import { z } from "zod";
export declare const manokBrand: {
    readonly name: "MANOK Bot 2026";
    readonly shortName: "MANOK";
    readonly accent: 9133302;
    readonly cyan: 2282478;
    readonly invitePermissions: "8";
};
export declare const punishmentOptions: readonly ["timeout", "kick", "ban", "log_only"];
export type PunishmentOption = (typeof punishmentOptions)[number];
export declare const guildConfigSchema: z.ZodObject<{
    guildId: z.ZodString;
    premium: z.ZodDefault<z.ZodBoolean>;
    locale: z.ZodDefault<z.ZodString>;
    logChannelId: z.ZodOptional<z.ZodString>;
    staffRoleIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    whitelistUserIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    whitelistRoleIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    ownerOnlyDecrypt: z.ZodDefault<z.ZodBoolean>;
    antiNuke: z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        threshold: z.ZodDefault<z.ZodNumber>;
        windowMs: z.ZodDefault<z.ZodNumber>;
        punishment: z.ZodDefault<z.ZodEnum<["timeout", "kick", "ban", "log_only"]>>;
        botAddPunishment: z.ZodDefault<z.ZodEnum<["timeout", "kick", "ban", "log_only"]>>;
        logChannelId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        threshold: number;
        windowMs: number;
        punishment: "timeout" | "kick" | "ban" | "log_only";
        botAddPunishment: "timeout" | "kick" | "ban" | "log_only";
        logChannelId?: string | undefined;
    }, {
        logChannelId?: string | undefined;
        enabled?: boolean | undefined;
        threshold?: number | undefined;
        windowMs?: number | undefined;
        punishment?: "timeout" | "kick" | "ban" | "log_only" | undefined;
        botAddPunishment?: "timeout" | "kick" | "ban" | "log_only" | undefined;
    }>;
    music: z.ZodObject<{
        volume: z.ZodDefault<z.ZodNumber>;
        djRoleIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        announceNowPlaying: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        volume: number;
        djRoleIds: string[];
        announceNowPlaying: boolean;
    }, {
        volume?: number | undefined;
        djRoleIds?: string[] | undefined;
        announceNowPlaying?: boolean | undefined;
    }>;
    welcome: z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        channelId: z.ZodOptional<z.ZodString>;
        leaveChannelId: z.ZodOptional<z.ZodString>;
        message: z.ZodDefault<z.ZodString>;
        leaveMessage: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        message: string;
        enabled: boolean;
        leaveMessage: string;
        channelId?: string | undefined;
        leaveChannelId?: string | undefined;
    }, {
        message?: string | undefined;
        enabled?: boolean | undefined;
        channelId?: string | undefined;
        leaveChannelId?: string | undefined;
        leaveMessage?: string | undefined;
    }>;
    verification: z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        roleId: z.ZodOptional<z.ZodString>;
        channelId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        channelId?: string | undefined;
        roleId?: string | undefined;
    }, {
        enabled?: boolean | undefined;
        channelId?: string | undefined;
        roleId?: string | undefined;
    }>;
    tickets: z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        categoryId: z.ZodOptional<z.ZodString>;
        staffRoleIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        staffRoleIds: string[];
        enabled: boolean;
        categoryId?: string | undefined;
    }, {
        staffRoleIds?: string[] | undefined;
        enabled?: boolean | undefined;
        categoryId?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    guildId: string;
    premium: boolean;
    locale: string;
    staffRoleIds: string[];
    whitelistUserIds: string[];
    whitelistRoleIds: string[];
    ownerOnlyDecrypt: boolean;
    antiNuke: {
        enabled: boolean;
        threshold: number;
        windowMs: number;
        punishment: "timeout" | "kick" | "ban" | "log_only";
        botAddPunishment: "timeout" | "kick" | "ban" | "log_only";
        logChannelId?: string | undefined;
    };
    music: {
        volume: number;
        djRoleIds: string[];
        announceNowPlaying: boolean;
    };
    welcome: {
        message: string;
        enabled: boolean;
        leaveMessage: string;
        channelId?: string | undefined;
        leaveChannelId?: string | undefined;
    };
    verification: {
        enabled: boolean;
        channelId?: string | undefined;
        roleId?: string | undefined;
    };
    tickets: {
        staffRoleIds: string[];
        enabled: boolean;
        categoryId?: string | undefined;
    };
    logChannelId?: string | undefined;
}, {
    guildId: string;
    antiNuke: {
        logChannelId?: string | undefined;
        enabled?: boolean | undefined;
        threshold?: number | undefined;
        windowMs?: number | undefined;
        punishment?: "timeout" | "kick" | "ban" | "log_only" | undefined;
        botAddPunishment?: "timeout" | "kick" | "ban" | "log_only" | undefined;
    };
    music: {
        volume?: number | undefined;
        djRoleIds?: string[] | undefined;
        announceNowPlaying?: boolean | undefined;
    };
    welcome: {
        message?: string | undefined;
        enabled?: boolean | undefined;
        channelId?: string | undefined;
        leaveChannelId?: string | undefined;
        leaveMessage?: string | undefined;
    };
    verification: {
        enabled?: boolean | undefined;
        channelId?: string | undefined;
        roleId?: string | undefined;
    };
    tickets: {
        staffRoleIds?: string[] | undefined;
        enabled?: boolean | undefined;
        categoryId?: string | undefined;
    };
    premium?: boolean | undefined;
    locale?: string | undefined;
    logChannelId?: string | undefined;
    staffRoleIds?: string[] | undefined;
    whitelistUserIds?: string[] | undefined;
    whitelistRoleIds?: string[] | undefined;
    ownerOnlyDecrypt?: boolean | undefined;
}>;
export type GuildConfig = z.infer<typeof guildConfigSchema>;
export declare const defaultGuildConfig: (guildId: string) => GuildConfig;
export declare const luaCryptoLimits: {
    readonly maxBytes: number;
    readonly extensionAllowList: readonly [".lua", ".txt", ".luau"];
    readonly encryptedMagic: "MANOK-LUA-GCM-v1";
};
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
export type AuditAction = "anti_nuke_triggered" | "lua_encrypt" | "lua_decrypt" | "ticket_create" | "verify" | "giveaway_create" | "backup_create" | "config_update";
export declare const isStaffOrOwner: (userId: string, ownerIds: string[], memberRoleIds: string[], staffRoleIds: string[]) => boolean;
export declare const clamp: (value: number, min: number, max: number) => number;
export declare const formatDuration: (ms: number) => string;
