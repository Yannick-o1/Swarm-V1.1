import fs from 'node:fs/promises';
import atproto from '@atproto/api';
const { BskyAgent } = atproto;

export default async function getPostImage() {
    const imagePath = './images/magachud.jpg';
    const postText = "Amen!";
    const postDescription = "Your custom post text here";
    
    try {
        // Read the image file
        const imageData = await fs.readFile(imagePath);
        
        // Create temporary agent for blob upload
        const agent = new BskyAgent({ service: 'https://bsky.social' });
        await agent.login({
            identifier: process.env.BSKY_HANDLE!,
            password: process.env.BSKY_PASSWORD!
        });

        // Upload image as blob first
        const uploadResult = await agent.uploadBlob(imageData, {
            encoding: 'image/jpeg'
        });

        return {
            text: postText,
            embed: {
                $type: 'app.bsky.embed.images',
                images: [{
                    alt: postDescription,
                    image: uploadResult.data.blob // Use the blob reference
                }]
            }
        };
    } catch (error) {
        console.error('Error processing image:', error);
        return "Failed to upload image";
    }
}