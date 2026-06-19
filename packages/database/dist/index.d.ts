import { Redis } from "ioredis";
import mongoose, { type Model } from "mongoose";
import { type AuditAction, type GuildConfig } from "@manok/shared";
export declare function connectMongo(uri: string): Promise<mongoose.Connection>;
export declare function getRedis(url: string): Redis;
export declare const GuildConfigModel: Model<GuildConfig>;
export type AuditLog = {
    guildId: string;
    userId: string;
    action: AuditAction;
    targetId?: string;
    metadata?: Record<string, unknown>;
    createdAt: Date;
};
export declare const AuditLogModel: Model<AuditLog>;
export type Ticket = {
    guildId: string;
    channelId: string;
    openerId: string;
    status: "open" | "closed";
    subject?: string;
};
export declare const TicketModel: Model<Ticket>;
export declare function getGuildConfig(guildId: string): Promise<GuildConfig>;
export declare function updateGuildConfig(guildId: string, patch: Partial<GuildConfig>): Promise<{
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
}>;
export declare function writeAuditLog(log: Omit<AuditLog, "createdAt">): Promise<mongoose.Document<unknown, {}, AuditLog, {}, {}> & AuditLog & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
