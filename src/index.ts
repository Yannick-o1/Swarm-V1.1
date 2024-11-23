import Bot from "./lib/bot.js";
import getPostText from "./lib/getPostText.js";
import getPostImage from "./lib/getPostImage.js";

async function main() {
    try {
        // Post image
        const imagePost = await getPostImage();
        if (typeof imagePost !== 'string') {
            // Create a new bot instance directly for image posts
            const bot = new Bot(Bot.defaultOptions.service);
            await bot.login(await import('./lib/config.js').then(m => m.bskyAccount));
            await bot.post(imagePost);
        }
        
        // Post text
        //const text = await Bot.run(getPostText);
        //console.log(`[${new Date().toISOString()}] Posted: "${text}"`);
        
    } catch (error) {
        console.error('Failed to post:', error);
        process.exit(1);
    }
}

main();