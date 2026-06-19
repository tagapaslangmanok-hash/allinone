import { z } from "zod";

export const manokBrand = {
  name: "MANOK Bot 2026",
  shortName: "MANOK",
  accent: 0x8b5cf6,
  cyan: 0x22d3ee,
  invitePermissions: "8"
} as const;

export const punishmentOptions = ["timeout", "kick", "ban", "log_only"] as const;
export type PunishmentOption = (typeof punishmentOptions)[number];

export const guildConfigSchema = z.object({
  guildId: z.string().min(1),
  premium: z.boolean().default(false),
  locale: z.string().default("en-US"),
  logChannelId: z.string().optional(),
  staffRoleIds: z.array(z.string()).default([]),
  whitelistUserIds: z.array(z.string()).default([]),
  whitelistRoleIds: z.array(z.string()).default([]),
  ownerOnlyDecrypt: z.boolean().default(true),
  antiNuke: z.object({
    enabled: z.boolean().default(true),
    threshold: z.number().int().min(2).max(25).default(5),
    windowMs: z.number().int().min(5000).max(300000).default(30000),
    punishment: z.enum(punishmentOptions).default("ban"),
    botAddPunishment: z.enum(punishmentOptions).default("kick"),
    logChannelId: z.string().optional()
  }),
  music: z.object({
    volume: z.number().int().min(1).max(150).default(80),
    djRoleIds: z.array(z.string()).default([]),
    announceNowPlaying: z.boolean().default(true)
  }),
  welcome: z.object({
    enabled: z.boolean().default(false),
    channelId: z.string().optional(),
    leaveChannelId: z.string().optional(),
    message: z.string().max(1000).default("Welcome {user} to {server}."),
    leaveMessage: z.string().max(1000).default("{user} left {server}.")
  }),
  verification: z.object({
    enabled: z.boolean().default(false),
    roleId: z.string().optional(),
    channelId: z.string().optional()
  }),
  tickets: z.object({
    enabled: z.boolean().default(false),
    categoryId: z.string().optional(),
    staffRoleIds: z.array(z.string()).default([])
  })
});

export type GuildConfig = z.infer<typeof guildConfigSchema>;

export const defaultGuildConfig = (guildId: string): GuildConfig =>
  guildConfigSchema.parse({
    guildId,
    antiNuke: {},
    music: {},
    welcome: {},
    verification: {},
    tickets: {}
  });

export const luaCryptoLimits = {
  maxBytes: 512 * 1024,
  extensionAllowList: [".lua", ".txt", ".luau"],
  encryptedMagic: "MANOK-LUA-GCM-v1"
} as const;

export type MusicLoopMode = "off" | "track" | "queue";

export type BotStatus = {
  guilds: number;
  users: number;
  uptimeMs: number;
  shardId?: number;
  lavalink: "connected" | "degraded" | "offline";
  mongo: "connected" | "offline";
  redis: "connected" | "offline";
};

export type AuditAction =
  | "anti_nuke_triggered"
  | "lua_encrypt"
  | "lua_decrypt"
  | "ticket_create"
  | "verify"
  | "giveaway_create"
  | "backup_create"
  | "config_update";

export const isStaffOrOwner = (
  userId: string,
  ownerIds: string[],
  memberRoleIds: string[],
  staffRoleIds: string[]
) => ownerIds.includes(userId) || memberRoleIds.some((roleId) => staffRoleIds.includes(roleId));

export const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const formatDuration = (ms: number) => {
  if (!Number.isFinite(ms) || ms < 0) return "live";
  const seconds = Math.floor(ms / 1000);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return h > 0 ? `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}` : `${m}:${s.toString().padStart(2, "0")}`;
};
