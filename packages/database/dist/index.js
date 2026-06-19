import { Redis } from "ioredis";
import mongoose from "mongoose";
import { defaultGuildConfig } from "@manok/shared";
const { Schema, model, models } = mongoose;
let redisClient = null;
export async function connectMongo(uri) {
    if (mongoose.connection.readyState === 1)
        return mongoose.connection;
    mongoose.set("strictQuery", true);
    await mongoose.connect(uri, {
        autoIndex: true,
        serverSelectionTimeoutMS: 10000
    });
    return mongoose.connection;
}
export function getRedis(url) {
    if (redisClient)
        return redisClient;
    redisClient = new Redis(url, {
        maxRetriesPerRequest: 2,
        lazyConnect: true,
        enableReadyCheck: true
    });
    return redisClient;
}
const guildConfigSchema = new Schema({
    guildId: { type: String, required: true, unique: true, index: true },
    premium: { type: Boolean, default: false },
    locale: { type: String, default: "en-US" },
    logChannelId: String,
    staffRoleIds: { type: [String], default: [] },
    whitelistUserIds: { type: [String], default: [] },
    whitelistRoleIds: { type: [String], default: [] },
    ownerOnlyDecrypt: { type: Boolean, default: true },
    antiNuke: {
        enabled: { type: Boolean, default: true },
        threshold: { type: Number, default: 5 },
        windowMs: { type: Number, default: 30000 },
        punishment: { type: String, default: "ban" },
        botAddPunishment: { type: String, default: "kick" },
        logChannelId: String
    },
    music: {
        volume: { type: Number, default: 80 },
        djRoleIds: { type: [String], default: [] },
        announceNowPlaying: { type: Boolean, default: true }
    },
    welcome: {
        enabled: { type: Boolean, default: false },
        channelId: String,
        leaveChannelId: String,
        message: { type: String, default: "Welcome {user} to {server}." },
        leaveMessage: { type: String, default: "{user} left {server}." }
    },
    verification: {
        enabled: { type: Boolean, default: false },
        roleId: String,
        channelId: String
    },
    tickets: {
        enabled: { type: Boolean, default: false },
        categoryId: String,
        staffRoleIds: { type: [String], default: [] }
    }
}, { timestamps: true });
export const GuildConfigModel = (models.GuildConfig ||
    model("GuildConfig", guildConfigSchema));
const auditLogSchema = new Schema({
    guildId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    action: { type: String, required: true, index: true },
    targetId: String,
    metadata: Schema.Types.Mixed,
    createdAt: { type: Date, default: Date.now, expires: "90d" }
}, { timestamps: false });
export const AuditLogModel = (models.AuditLog || model("AuditLog", auditLogSchema));
const ticketSchema = new Schema({
    guildId: { type: String, required: true, index: true },
    channelId: { type: String, required: true, unique: true },
    openerId: { type: String, required: true },
    status: { type: String, default: "open", index: true },
    subject: String
}, { timestamps: true });
export const TicketModel = (models.Ticket || model("Ticket", ticketSchema));
export async function getGuildConfig(guildId) {
    const found = await GuildConfigModel.findOne({ guildId }).lean();
    if (found)
        return found;
    const config = defaultGuildConfig(guildId);
    await GuildConfigModel.create(config);
    return config;
}
export async function updateGuildConfig(guildId, patch) {
    return GuildConfigModel.findOneAndUpdate({ guildId }, { $set: patch }, { upsert: true, new: true, setDefaultsOnInsert: true }).lean();
}
export async function writeAuditLog(log) {
    return AuditLogModel.create({ ...log, createdAt: new Date() });
}
//# sourceMappingURL=index.js.map