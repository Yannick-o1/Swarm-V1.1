import Bot from "./lib/bot.js";
import { postForBot } from "./lib/getPostImage.js";

async function main() {
    try {
        const botIndex = process.env.BOT_INDEX ? parseInt(process.env.BOT_INDEX) : undefined;

        if (typeof botIndex === 'number') {
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
            console.error('BOT_INDEX environment variable is not set or invalid.');
            process.exit(1);
        }
    } catch (error) {
        console.error('Failed to post:', error);
        process.exit(1);
    }
}

main();