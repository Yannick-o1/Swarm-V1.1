import fs from 'node:fs/promises';
import path from 'path';
import atproto from '@atproto/api';
import sharp from 'sharp';
const { BskyAgent } = atproto;

interface BotConfig {
  handle: string;      // Bot's Bluesky handle
  password: string;    // Bot's password
  imageDir: string;    // Directory containing bot's images
  message: string;     // Custom message for posts
}

// Configuration for all bots with their respective settings
const BOTS: BotConfig[] = [
  {
    handle: process.env.BSKY_HANDLE_1!,
    password: process.env.BSKY_PASSWORD!,
    imageDir: './images1',
    message: "🔥",
  },
  {
    handle: process.env.BSKY_HANDLE_2!,
    password: process.env.BSKY_PASSWORD!,
    imageDir: './images2',
    message: "🔥",
  },
  {
    handle: process.env.BSKY_HANDLE_3!,
    password: process.env.BSKY_PASSWORD!,
    imageDir: './images3',
    message: "🔥",
  },
  {
    handle: process.env.BSKY_HANDLE_4!,
    password: process.env.BSKY_PASSWORD!,
    imageDir: './images4',
    message: "🔥",
  },
  {
    handle: process.env.BSKY_HANDLE_5!,
    password: process.env.BSKY_PASSWORD!,
    imageDir: './images5',
    message: "🔥",
  },
];

export async function getNextImagePath(botConfig: BotConfig, runNumber: number): Promise<string> {
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

    // Calculate index based on run number
    const currentIndex = (runNumber - 1) % imageFiles.length;

    return path.join(botConfig.imageDir, imageFiles[currentIndex]);
  } catch (error) {
    console.error('Error getting next image:', error);
    throw error;
  }
}

export async function postForBot(botIndex: number, runNumber: number) {
  try {
    const botConfig = BOTS[botIndex];
    const imagePath = await getNextImagePath(botConfig, runNumber);

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