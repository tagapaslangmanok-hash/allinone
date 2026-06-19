import {
  AuditLogEvent,
  Events,
  PermissionFlagsBits,
  type Client,
  type Guild,
  type GuildAuditLogsEntry,
  type GuildMember
} from "discord.js";
import { getGuildConfig, writeAuditLog } from "@manok/database";
import { premiumEmbed } from "../ui.js";

const buckets = new Map<string, number[]>();

async function actorFromAudit(guild: Guild, type: AuditLogEvent) {
  const logs = await guild.fetchAuditLogs({ type, limit: 1 }).catch(() => null);
  return logs?.entries.first() as GuildAuditLogsEntry | undefined;
}

async function punish(member: GuildMember, punishment: string, reason: string) {
  if (punishment === "timeout") await member.timeout(60 * 60 * 1000, reason).catch(() => undefined);
  if (punishment === "kick") await member.kick(reason).catch(() => undefined);
  if (punishment === "ban") await member.ban({ reason }).catch(() => undefined);
}

async function record(guild: Guild, userId: string, event: string, auditType: AuditLogEvent) {
  const config = await getGuildConfig(guild.id);
  if (!config.antiNuke.enabled || config.whitelistUserIds.includes(userId)) return;
  const member = await guild.members.fetch(userId).catch(() => null);
  if (!member || member.permissions.has(PermissionFlagsBits.Administrator) && guild.ownerId === userId) return;
  if (member.roles.cache.some((role) => config.whitelistRoleIds.includes(role.id))) return;

  const key = `${guild.id}:${userId}:${event}`;
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((time) => now - time <= config.antiNuke.windowMs);
  hits.push(now);
  buckets.set(key, hits);

  if (hits.length < config.antiNuke.threshold) return;

  const reason = `MANOK anti-nuke: ${event} threshold exceeded`;
  await punish(member, config.antiNuke.punishment, reason);
  await writeAuditLog({ guildId: guild.id, userId, action: "anti_nuke_triggered", metadata: { event, hits: hits.length, auditType } });

  const logChannelId = config.antiNuke.logChannelId ?? config.logChannelId;
  const channel = logChannelId ? await guild.channels.fetch(logChannelId).catch(() => null) : null;
  if (channel?.isTextBased()) {
    await channel.send({ embeds: [premiumEmbed("Anti-nuke Triggered", `<@${userId}> exceeded **${event}** threshold. Punishment: **${config.antiNuke.punishment}**.`)] }).catch(() => undefined);
  }
  buckets.delete(key);
}

export function installAntiNuke(client: Client) {
  const wire = (event: string, discordEvent: string, auditType: AuditLogEvent) => {
    client.on(discordEvent as never, async (payload: { guild?: Guild }) => {
      const guild = payload.guild;
      if (!guild) return;
      const entry = await actorFromAudit(guild, auditType);
      const userId = entry?.executorId;
      if (userId && userId !== client.user?.id) await record(guild, userId, event, auditType);
    });
  };

  wire("mass_ban", Events.GuildBanAdd, AuditLogEvent.MemberBanAdd);
  wire("mass_kick", Events.GuildMemberRemove, AuditLogEvent.MemberKick);
  wire("role_create", Events.GuildRoleCreate, AuditLogEvent.RoleCreate);
  wire("role_delete", Events.GuildRoleDelete, AuditLogEvent.RoleDelete);
  wire("role_update", Events.GuildRoleUpdate, AuditLogEvent.RoleUpdate);
  wire("channel_create", Events.ChannelCreate, AuditLogEvent.ChannelCreate);
  wire("channel_delete", Events.ChannelDelete, AuditLogEvent.ChannelDelete);
  wire("channel_update", Events.ChannelUpdate, AuditLogEvent.ChannelUpdate);
  wire("webhook_spam", Events.WebhooksUpdate, AuditLogEvent.WebhookCreate);

  client.on(Events.GuildMemberAdd, async (member) => {
    if (!member.user.bot) return;
    const entry = await actorFromAudit(member.guild, AuditLogEvent.BotAdd);
    const userId = entry?.executorId;
    if (userId && userId !== client.user?.id) await record(member.guild, userId, "bot_add", AuditLogEvent.BotAdd);
  });
}
