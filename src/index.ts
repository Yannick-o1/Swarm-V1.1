import Bot from "./lib/bot.js";
import { postForBot } from "./lib/getPostImage.js";
import fs from 'node:fs/promises';

async function main() {
  try {
    const totalBots = 5; // Number of bots
    const password = process.env.BSKY_PASSWORD;

    if (!password) {
      throw new Error('BSKY_PASSWORD is not set in the environment variables.');
    }

    const indexFile = './lastIndex.txt';
    let currentIndex = 0;
    try {
      const lastIndex = await fs.readFile(indexFile, 'utf8');
      currentIndex = parseInt(lastIndex);
    } catch (error) {
      // Start from 0 if no index file exists
      currentIndex = 0;
    }

    const nextIndex = currentIndex + 1;
    await fs.writeFile(indexFile, nextIndex.toString());

    for (let botIndex = 0; botIndex < totalBots; botIndex++) {
      const botNumber = botIndex + 1;
      const handle = process.env[`BSKY_HANDLE_${botNumber}`];

      if (!handle) {
        console.error(`Missing handle for bot ${botNumber}`);
        continue;
      }

      const imagePost = await postForBot(botIndex, currentIndex);

      if (typeof imagePost !== 'string') {
        const bot = new Bot(Bot.defaultOptions.service);
        await bot.login({
          identifier: handle,
          password: password,
        });
        await bot.post(imagePost);
        console.log(`[${new Date().toISOString()}] Posted from bot ${botNumber}`);
      } else {
        console.error(`Bot ${botNumber} failed to create a post: ${imagePost}`);
      }
    }
  } catch (error) {
    console.error('Failed to post:', error);
    process.exit(1);
  }
}

main();