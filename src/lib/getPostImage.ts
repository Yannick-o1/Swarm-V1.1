import fs from 'node:fs/promises';
import path from 'path';
import atproto from '@atproto/api';
import sharp from 'sharp';
const { BskyAgent } = atproto;

/**
 * Interface defining the configuration for each bot
 */
interface BotConfig {
    handle: string;      // Bot's Bluesky handle
    password: string;    // Bot's password
    imageDir: string;    // Directory containing bot's images
    indexFile: string;   // File tracking current image index
    message: string;     // Custom message for posts
}

// Default index tracking file
const INDEX_FILE = './lastIndex.txt';

// Configuration for all bots with their respective settings
const BOTS: BotConfig[] = [
    {
        handle: process.env.BSKY_HANDLE!,
        password: process.env.BSKY_PASSWORD!,
        imageDir: './images',
        indexFile: './lastIndex.txt',
        message: "Check out this image!"
    },
    {
        handle: process.env.BSKY_HANDLE_2!,
        password: process.env.BSKY_PASSWORD_2!,
        imageDir: './images2',
        indexFile: './lastIndex2.txt',
        message: "Bot 2's custom message"
    },
    {
        handle: process.env.BSKY_HANDLE_3!,
        password: process.env.BSKY_PASSWORD_3!,
        imageDir: './images3',
        indexFile: './lastIndex3.txt',
        message: "Bot 3's custom message"
    },
    {
        handle: process.env.BSKY_HANDLE_4!,
        password: process.env.BSKY_PASSWORD_4!,
        imageDir: './images4',
        indexFile: './lastIndex4.txt',
        message: "Bot 4's custom message"
    },
    {
        handle: process.env.BSKY_HANDLE_5!,
        password: process.env.BSKY_PASSWORD_5!,
        imageDir: './images5',
        indexFile: './lastIndex5.txt',  
        message: "Bot 5's custom message"
    }
];

/**
 * Gets the next image path for a bot while handling rotation
 * @param botConfig - Configuration for the specific bot
 * @returns Path to the next image to be posted
 */
async function getNextImagePath(botConfig: BotConfig): Promise<string> {
    try {
        // Read all images from bot's directory
        const files = await fs.readdir(botConfig.imageDir);
        // Filter for supported image types
        const imageFiles = files.filter(file => 
            ['.jpg', '.jpeg', '.png'].includes(path.extname(file).toLowerCase())
        );

        if (imageFiles.length === 0) {
            throw new Error('No images found in directory');
        }

        // Get and update current index
        let currentIndex = 0;
        try {
            const lastIndex = await fs.readFile(botConfig.indexFile, 'utf8');
            currentIndex = parseInt(lastIndex);
        } catch (error) {
            // Start from 0 if no index file exists
            currentIndex = 0;
        }

        // Calculate next index with wraparound
        const nextIndex = currentIndex >= imageFiles.length - 1 ? 0 : currentIndex + 1;
        await fs.writeFile(botConfig.indexFile, nextIndex.toString());

        return path.join(botConfig.imageDir, imageFiles[currentIndex]);
    } catch (error) {
        console.error('Error getting next image:', error);
        throw error;
    }
}

/**
 * Handles the image posting process for a specific bot
 * @param botIndex - Index of the bot in the BOTS array
 * @returns Post object with image and text or error string
 */
export async function postForBot(botIndex: number) {
    try {
        const botConfig = BOTS[botIndex];
        const imagePath = await getNextImagePath(botConfig);
        
        // Process and compress image
        const ext = path.extname(imagePath).toLowerCase();
        let imageProcess = sharp(imagePath)
            .resize(1500, 1500, {
                fit: 'inside',
                withoutEnlargement: true
            });
            
        // Convert PNGs to JPEG and compress all images
        if (ext === '.png') {
            imageProcess = imageProcess.jpeg({
                quality: 80,
                mozjpeg: true,
                force: true
            });
        } else {
            imageProcess = imageProcess.jpeg({
                quality: 80,
                mozjpeg: true
            });
        }
        
        const imageBuffer = await imageProcess.toBuffer();
        
        // Upload to Bluesky
        const agent = new BskyAgent({ service: 'https://bsky.social' });
        await agent.login({
            identifier: botConfig.handle,
            password: botConfig.password
        });

        // Create blob from image
        const uploadResult = await agent.uploadBlob(imageBuffer, {
            encoding: 'image/jpeg'
        });

        // Return formatted post object
        return {
            text: botConfig.message,
            embed: {
                $type: 'app.bsky.embed.images',
                images: [{
                    alt: "Image post",
                    image: uploadResult.data.blob
                }]
            }
        };
    } catch (error) {
        console.error('Error processing image:', error);
        return "Failed to upload image";
    }
}