import fs from 'node:fs/promises';
import path from 'path';
import atproto from '@atproto/api';
import sharp from 'sharp';
const { BskyAgent } = atproto;

// Add index tracking
const INDEX_FILE = './lastIndex.txt';

async function getNextImagePath(): Promise<string> {
    try {
        // Read all images from directory
        const files = await fs.readdir('./images');
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

        return path.join('./images', imageFiles[currentIndex]);
    } catch (error) {
        console.error('Error getting next image:', error);
        throw error;
    }
}

export default async function getPostImage() {
    try {
        const imagePath = await getNextImagePath();
        const postText = "Check out this image!";
        const postDescription = "";
        
        // Rest of your existing image processing code
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
        
        const agent = new BskyAgent({ service: 'https://bsky.social' });
        await agent.login({
            identifier: process.env.BSKY_HANDLE!,
            password: process.env.BSKY_PASSWORD!
        });

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