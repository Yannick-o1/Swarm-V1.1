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
    handle: process.env.BSKY_HANDLE_1!,
    password: process.env.BSKY_PASSWORD!,
    imageDir: './images1',
    indexFile: './lastIndex.txt',
    message: "🔥",
  },
  {
    handle: process.env.BSKY_HANDLE_2!,
    password: process.env.BSKY_PASSWORD!,
    imageDir: './images2',
    indexFile: './lastIndex.txt',
    message: "🔥",
  },
  {
    handle: process.env.BSKY_HANDLE_3!,
    password: process.env.BSKY_PASSWORD!,
    imageDir: './images3',
    indexFile: './lastIndex.txt',
    message: "🔥",
  },
  {
    handle: process.env.BSKY_HANDLE_4!,
    password: process.env.BSKY_PASSWORD!,
    imageDir: './images4',
    indexFile: './lastIndex.txt',
    message: "🔥",
  },
  {
    handle: process.env.BSKY_HANDLE_5!,
    password: process.env.BSKY_PASSWORD!,
    imageDir: './images5',
    indexFile: './lastIndex.txt',
    message: "🔥",
  },
];

export async function getNextImagePath(botConfig: BotConfig, currentIndex: number): Promise<string> {
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

    // Calculate next index with wraparound
    const nextIndex = currentIndex >= imageFiles.length - 1 ? 0 : currentIndex + 1;

    return path.join(botConfig.imageDir, imageFiles[currentIndex]);
  } catch (error) {
    console.error('Error getting next image:', error);
    throw error;
  }
}

export async function postForBot(botIndex: number, currentIndex: number) {
  try {
    const botConfig = BOTS[botIndex];
    const imagePath = await getNextImagePath(botConfig, currentIndex);

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