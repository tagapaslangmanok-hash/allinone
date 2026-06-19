import { Redis } from "ioredis";
import mongoose, { type Model } from "mongoose";
import { defaultGuildConfig, type AuditAction, type GuildConfig } from "@manok/shared";

const { Schema, model, models } = mongoose;

let redisClient: Redis | null = null;

export async function connectMongo(uri: string) {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, {
    autoIndex: true,
    serverSelectionTimeoutMS: 10000
  });
  return mongoose.connection;
}

export function getRedis(url: string) {
  if (redisClient) return redisClient;
  redisClient = new Redis(url, {
    maxRetriesPerRequest: 2,
    lazyConnect: true,
    enableReadyCheck: true
  });
  return redisClient;
}

const guildConfigSchema = new Schema<GuildConfig>(
  {
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
  },
  { timestamps: true }
);

export const GuildConfigModel = (models.GuildConfig ||
  model<GuildConfig>("GuildConfig", guildConfigSchema)) as Model<GuildConfig>;

export type AuditLog = {
  guildId: string;
  userId: string;
  action: AuditAction;
  targetId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
};

const auditLogSchema = new Schema<AuditLog>(
  {
    guildId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    action: { type: String, required: true, index: true },
    targetId: String,
    metadata: Schema.Types.Mixed,
    createdAt: { type: Date, default: Date.now, expires: "90d" }
  },
  { timestamps: false }
);

export const AuditLogModel = (models.AuditLog || model<AuditLog>("AuditLog", auditLogSchema)) as Model<AuditLog>;

export type Ticket = {
  guildId: string;
  channelId: string;
  openerId: string;
  status: "open" | "closed";
  subject?: string;
};

const ticketSchema = new Schema<Ticket>(
  {
    guildId: { type: String, required: true, index: true },
    channelId: { type: String, required: true, unique: true },
    openerId: { type: String, required: true },
    status: { type: String, default: "open", index: true },
    subject: String
  },
  { timestamps: true }
);

export const TicketModel = (models.Ticket || model<Ticket>("Ticket", ticketSchema)) as Model<Ticket>;

export async function getGuildConfig(guildId: string): Promise<GuildConfig> {
  const found = await GuildConfigModel.findOne({ guildId }).lean<GuildConfig>();
  if (found) return found;
  const config = defaultGuildConfig(guildId);
  await GuildConfigModel.create(config);
  return config;
}

export async function updateGuildConfig(guildId: string, patch: Partial<GuildConfig>) {
  return GuildConfigModel.findOneAndUpdate(
    { guildId },
    { $set: patch },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean<GuildConfig>();
}

export async function writeAuditLog(log: Omit<AuditLog, "createdAt">) {
  return AuditLogModel.create({ ...log, createdAt: new Date() });
}
