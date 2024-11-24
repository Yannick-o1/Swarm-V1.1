import Bot from "./lib/bot.js";
import { postForBot } from "./lib/getPostImage.js";

/**
 * Main function that handles posting for all bots
 * Iterates through 5 bots and posts images using their respective credentials
 */
async function main() {
    try {
        // Iterate through all 5 bots (0-4)
        for (let i = 0; i < 5; i++) {
            // Get image post data for current bot
            const imagePost = await postForBot(i);
            
            // Only proceed if we got a valid post object (not an error string)
            if (typeof imagePost !== 'string') {
                // Create new bot instance with default service
                const bot = new Bot(Bot.defaultOptions.service);
                
                // Login with either numbered credentials (BSKY_HANDLE_1, etc) 
                // or fall back to default credentials for first bot
                await bot.login({
                    identifier: process.env[`BSKY_HANDLE_${i + 1}`] || process.env.BSKY_HANDLE!,
                    password: process.env[`BSKY_PASSWORD_${i + 1}`] || process.env.BSKY_PASSWORD!
                });
                
                // Post the image with associated text
                await bot.post(imagePost);
            }
        }
        
        // Log success message with timestamp
        console.log(`[${new Date().toISOString()}] Posted from all bots`);
    } catch (error) {
        // Log any errors and exit with failure code
        console.error('Failed to post:', error);
        process.exit(1);
    }
}

// Execute main function
main();