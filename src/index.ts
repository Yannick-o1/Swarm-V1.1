import Bot from "./lib/bot.js";
import getPostImage from "./lib/getPostImage.js";
import getPostImage2 from "./lib/getPostImage2.js";
import getPostImage3 from "./lib/getPostImage3.js";
import getPostImage4 from "./lib/getPostImage4.js";
import getPostImage5 from "./lib/getPostImage5.js";

async function postWithBot(getImage: typeof getPostImage, configPath: string) {
    const imagePost = await getImage();
    if (typeof imagePost !== 'string') {
        const bot = new Bot(Bot.defaultOptions.service);
        await bot.login(await import(configPath).then(m => m.bskyAccount));
        await bot.post(imagePost);
    }
}

async function main() {
    try {
        // Post with all bots
        await postWithBot(getPostImage, './lib/config.js');
        await postWithBot(getPostImage2, './lib/config2.js');
        await postWithBot(getPostImage3, './lib/config3.js');
        await postWithBot(getPostImage4, './lib/config4.js');
        await postWithBot(getPostImage5, './lib/config5.js');
        
        console.log(`[${new Date().toISOString()}] Posted from all bots`);
    } catch (error) {
        console.error('Failed to post:', error);
        process.exit(1);
    }
}

main();