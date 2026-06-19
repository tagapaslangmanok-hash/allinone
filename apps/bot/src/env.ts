import crypto from "node:crypto";
import { config } from "dotenv";
import { z } from "zod";

config({ path: new URL("../../../.env", import.meta.url) });
config();

const envSchema = z.object({
  DISCORD_TOKEN: z.string().min(1),
  DISCORD_CLIENT_ID: z.string().min(1),
  DISCORD_GUILD_ID: z.string().optional(),
  MONGODB_URI: z.string().min(1).default("mongodb://localhost:27017/manok"),
  REDIS_URL: z.string().min(1).default("redis://localhost:6379"),
  LAVALINK_HOST: z.string().default("localhost"),
  LAVALINK_PORT: z.coerce.number().default(2333),
  LAVALINK_PASSWORD: z.string().default("youshallnotpass"),
  LAVALINK_SECURE: z.coerce.boolean().default(false),
  DASHBOARD_URL: z.string().url().default("http://localhost:3000"),
  ENCRYPTION_MASTER_KEY: z.string().min(32).optional(),
  OWNER_IDS: z.string().default(""),
  STAFF_LOG_WEBHOOK_URL: z.string().optional().transform((value) => value || undefined)
});

const parsedEnv = envSchema.parse(process.env);

export const env = {
  ...parsedEnv,
  ENCRYPTION_MASTER_KEY:
    parsedEnv.ENCRYPTION_MASTER_KEY ??
    crypto.createHash("sha256").update(`${parsedEnv.DISCORD_TOKEN}:manok-lua-v1`).digest("hex")
};

export const ownerIds = env.OWNER_IDS.split(",").map((id) => id.trim()).filter(Boolean);
