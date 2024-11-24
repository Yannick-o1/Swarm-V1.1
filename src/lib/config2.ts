import { env } from "node:process";
import { z } from "zod";
import type { AtpAgentLoginOpts } from "@atproto/api";

const envSchema = z.object({
  BSKY_HANDLE_2: z.string().nonempty(),
  BSKY_PASSWORD: z.string().nonempty(),
  BSKY_SERVICE: z.string().nonempty().default("https://bsky.social"),
});

const parsed = envSchema.parse(env);

export const bskyAccount: AtpAgentLoginOpts = {
  identifier: parsed.BSKY_HANDLE_2,
  password: parsed.BSKY_PASSWORD,
};

export const bskyService = parsed.BSKY_SERVICE;