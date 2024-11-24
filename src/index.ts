import Bot from "./lib/bot.js";
import { postForBot } from "./lib/getPostImage.js";

async function main() {
    try {
        const botIndex = process.env.BOT_INDEX ? parseInt(process.env.BOT_INDEX) : undefined;
        
        if (typeof botIndex === 'number') {
            // Run single bot
            const imagePost = await postForBot(botIndex);
            if (typeof imagePost !== 'string') {
                const bot = new Bot(Bot.defaultOptions.service);
                await bot.login({
                    identifier: process.env[`BSKY_HANDLE_${botIndex + 1}`] || process.env.BSKY_HANDLE!,
                    password: process.env.BSKY_PASSWORD!
                });
                await bot.post(imagePost);
                console.log(`[${new Date().toISOString()}] Posted from bot ${botIndex + 1}`);
            }
        } else {
            // Run all bots
            for (let i = 0; i < 5; i++) {
                const imagePost = await postForBot(i);
                if (typeof imagePost !== 'string') {
                    const bot = new Bot(Bot.defaultOptions.service);
                    await bot.login({
                        identifier: process.env[`BSKY_HANDLE_${i + 1}`] || process.env.BSKY_HANDLE!,
                        password: process.env.BSKY_PASSWORD!
                    });
                    await bot.post(imagePost);
                    console.log(`[${new Date().toISOString()}] Posted from bot ${i + 1}`);
                }
            }
        }
    } catch (error) {
        console.error('Failed to post:', error);
        process.exit(1);
    }
}

main();