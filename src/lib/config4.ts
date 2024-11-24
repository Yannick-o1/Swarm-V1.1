// src/lib/config2.ts (repeat for 3,4,5)
import { env } from "node:process";
import { z } from "zod";
import type { AtpAgentLoginOpts } from "@atproto/api";

const envSchema = z.object({
  BSKY_HANDLE_4: z.string().nonempty(),
  BSKY_PASSWORD_4: z.string().nonempty(),
  BSKY_SERVICE: z.string().nonempty().default("https://bsky.social"),
});

const parsed = envSchema.parse(env);

export const bskyAccount: AtpAgentLoginOpts = {
  identifier: parsed.BSKY_HANDLE_4,
  password: parsed.BSKY_PASSWORD_4,
};

export const bskyService = parsed.BSKY_SERVICE;