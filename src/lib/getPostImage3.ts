import fs from 'node:fs/promises';
import path from 'path';
import atproto from '@atproto/api';
import sharp from 'sharp';
import 'dotenv/config';
const { BskyAgent } = atproto;

const INDEX_FILE = './lastIndex3.txt';  // Different index file for each bot

async function getNextImagePath(): Promise<string> {
    try {
        // Read all images from directory
        const files = await fs.readdir('./images3');  // Different directory for each bot
        const imageFiles = files.filter(file => 
            ['.jpg', '.jpeg', '.png'].includes(path.extname(file).toLowerCase())
        );

        if (imageFiles.length === 0) {
            throw new Error('No images found in directory');
        }

        // Read last used index
        let currentIndex = 0;
        try {
            const lastIndex = await fs.readFile(INDEX_FILE, 'utf8');
            currentIndex = parseInt(lastIndex);
        } catch (error) {
            // If file doesn't exist, start from 0
            currentIndex = 0;
        }

        // Get next image
        const nextIndex = currentIndex >= imageFiles.length - 1 ? 0 : currentIndex + 1;
        
        // Save next index
        await fs.writeFile(INDEX_FILE, nextIndex.toString());

        return path.join('./images3', imageFiles[currentIndex]);
    } catch (error) {
        console.error('Error getting next image:', error);
        throw error;
    }
}

export default async function getPostImage() {
    try {
        const imagePath = await getNextImagePath();
        const postText = "Bot 3's custom message";  // Different message for each bot
        const postDescription = "Description of the image for accessibility";
        
        // Read and compress image
        const ext = path.extname(imagePath).toLowerCase();
        
        let imageProcess = sharp(imagePath)
            .resize(1500, 1500, {
                fit: 'inside',
                withoutEnlargement: true
            });
            
        if (ext === '.png') {
            imageProcess = imageProcess
                .jpeg({
                    quality: 80,
                    mozjpeg: true,
                    force: true
                });
        } else {
            imageProcess = imageProcess
                .jpeg({
                    quality: 80,
                    mozjpeg: true
                });
        }
        
        const imageBuffer = await imageProcess.toBuffer();
        
        // Create temporary agent for blob upload
        const agent = new BskyAgent({ service: 'https://bsky.social' });
        await agent.login({
            identifier: process.env.BSKY_HANDLE_3!,
            password: process.env.BSKY_PASSWORD!
        });

        // Upload compressed image as blob
        const uploadResult = await agent.uploadBlob(imageBuffer, {
            encoding: 'image/jpeg'
        });

        return {
            text: postText,
            embed: {
                $type: 'app.bsky.embed.images',
                images: [{
                    alt: postDescription,
                    image: uploadResult.data.blob
                }]
            }
        };
    } catch (error) {
        console.error('Error processing image:', error);
        return "Failed to upload image";
    }
}