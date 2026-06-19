import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChannelType,
  ChatInputCommandInteraction,
  Client,
  Events,
  GuildMember,
  PartialGuildMember,
  PermissionFlagsBits,
  type TextBasedChannel,
  type TextChannel
} from "discord.js";
import { getGuildConfig, TicketModel, updateGuildConfig, writeAuditLog } from "@manok/database";
import { premiumEmbed } from "../ui.js";

type GiveawayState = {
  guildId: string;
  channelId: string;
  messageId: string;
  prize: string;
  winnerCount: number;
  entrants: Set<string>;
  endsAt: number;
};

const giveaways = new Map<string, GiveawayState>();
let botClient: Client | null = null;

type SendableTextChannel = TextBasedChannel & {
  send: TextChannel["send"];
};

function canSend(channel: TextBasedChannel | null | undefined): channel is SendableTextChannel {
  return Boolean(channel && "send" in channel);
}

function renderTemplate(template: string, member: GuildMember | PartialGuildMember) {
  return template
    .replaceAll("{user}", `${member}`)
    .replaceAll("{tag}", member.user.tag)
    .replaceAll("{server}", member.guild.name)
    .replaceAll("{count}", member.guild.memberCount.toString());
}

export async function handleTicket(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild || !interaction.guildId) return;
  await interaction.deferReply({ ephemeral: true });

  const config = await getGuildConfig(interaction.guildId);
  const subject = interaction.options.getString("subject") ?? "support";
  const safeSubject = subject.toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 32) || "support";
  const staffRoleIds = [...new Set([...config.staffRoleIds, ...config.tickets.staffRoleIds])];

  const channel = await interaction.guild.channels.create({
    name: `ticket-${interaction.user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 90),
    type: ChannelType.GuildText,
    parent: config.tickets.categoryId,
    topic: `MANOK ticket for ${interaction.user.tag}: ${subject}`,
    permissionOverwrites: [
      { id: interaction.guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
      { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
      ...staffRoleIds.map((roleId) => ({
        id: roleId,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
      }))
    ]
  });

  await TicketModel.create({
    guildId: interaction.guildId,
    channelId: channel.id,
    openerId: interaction.user.id,
    status: "open",
    subject: safeSubject
  });

  await channel.send({
    content: `${interaction.user}`,
    embeds: [premiumEmbed("Support Ticket", `Subject: **${subject}**\nStaff will assist you here.`)]
  });
  await writeAuditLog({ guildId: interaction.guildId, userId: interaction.user.id, action: "ticket_create", targetId: channel.id, metadata: { subject } });
  await interaction.editReply({ embeds: [premiumEmbed("Ticket Created", `Your private ticket is ready: ${channel}`)] });
}

export async function handleVerify(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild || !interaction.guildId) return;
  const role = interaction.options.getRole("role");
  const channel = interaction.options.getChannel("channel");
  const config = await getGuildConfig(interaction.guildId);

  if (role || channel) {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
      await interaction.reply({ content: "Manage Server permission is required to configure verification.", ephemeral: true });
      return;
    }
    await updateGuildConfig(interaction.guildId, {
      verification: {
        enabled: true,
        roleId: role?.id ?? config.verification.roleId,
        channelId: channel?.id ?? config.verification.channelId
      }
    });
    await interaction.reply({ embeds: [premiumEmbed("Verification Configured", `Role: ${role ?? "unchanged"}\nChannel: ${channel ?? "any channel"}`)], ephemeral: true });
    return;
  }

  if (!config.verification.enabled || !config.verification.roleId) {
    await interaction.reply({ embeds: [premiumEmbed("Verification Not Configured", "Run `/manok verify role:@Role` to configure a verified role.")], ephemeral: true });
    return;
  }

  const member = interaction.member as GuildMember;
  await member.roles.add(config.verification.roleId, "MANOK verification").catch(async () => {
    throw new Error("I could not assign the verification role. Move my role above the target role and give Manage Roles.");
  });
  await writeAuditLog({ guildId: interaction.guildId, userId: interaction.user.id, action: "verify", targetId: config.verification.roleId });
  await interaction.reply({ embeds: [premiumEmbed("Verified", "You have been verified successfully.")], ephemeral: true });
}

export async function handleWelcomeConfig(interaction: ChatInputCommandInteraction) {
  if (!interaction.guildId) return;
  const enabled = interaction.options.getBoolean("enabled");
  const channel = interaction.options.getChannel("channel");
  const leaveChannel = interaction.options.getChannel("leave_channel");
  const message = interaction.options.getString("message");
  const leaveMessage = interaction.options.getString("leave_message");
  const config = await getGuildConfig(interaction.guildId);

  if (enabled !== null || channel || leaveChannel || message || leaveMessage) {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
      await interaction.reply({ content: "Manage Server permission is required to configure welcome messages.", ephemeral: true });
      return;
    }
    const next = {
      ...config.welcome,
      enabled: enabled ?? config.welcome.enabled,
      channelId: channel?.id ?? config.welcome.channelId,
      leaveChannelId: leaveChannel?.id ?? config.welcome.leaveChannelId,
      message: message ?? config.welcome.message,
      leaveMessage: leaveMessage ?? config.welcome.leaveMessage
    };
    await updateGuildConfig(interaction.guildId, { welcome: next });
    await interaction.reply({ embeds: [premiumEmbed("Welcome Configured", `Enabled: **${next.enabled ? "yes" : "no"}**\nWelcome channel: ${next.channelId ? `<#${next.channelId}>` : "none"}\nLeave channel: ${next.leaveChannelId ? `<#${next.leaveChannelId}>` : "none"}`)], ephemeral: true });
    return;
  }

  await interaction.reply({
    embeds: [premiumEmbed("Welcome Settings", `Enabled: **${config.welcome.enabled ? "yes" : "no"}**\nWelcome channel: ${config.welcome.channelId ? `<#${config.welcome.channelId}>` : "none"}\nLeave channel: ${config.welcome.leaveChannelId ? `<#${config.welcome.leaveChannelId}>` : "none"}\nMessage: \`${config.welcome.message}\``)],
    ephemeral: true
  });
}

export async function sendWelcome(member: GuildMember) {
  const config = await getGuildConfig(member.guild.id);
  if (!config.welcome.enabled || !config.welcome.channelId) return;
  const channel = await member.guild.channels.fetch(config.welcome.channelId).catch(() => null);
  if (channel?.isTextBased() && canSend(channel)) {
    await channel.send({ embeds: [premiumEmbed("Welcome", renderTemplate(config.welcome.message, member))] }).catch(() => undefined);
  }
}

export async function sendLeave(member: GuildMember | PartialGuildMember) {
  const config = await getGuildConfig(member.guild.id);
  if (!config.welcome.enabled || !config.welcome.leaveChannelId) return;
  const channel = await member.guild.channels.fetch(config.welcome.leaveChannelId).catch(() => null);
  if (channel?.isTextBased() && canSend(channel)) {
    await channel.send({ embeds: [premiumEmbed("Member Left", renderTemplate(config.welcome.leaveMessage, member))] }).catch(() => undefined);
  }
}

export async function handleSuggestion(interaction: ChatInputCommandInteraction) {
  const idea = interaction.options.getString("idea", true);
  const config = interaction.guildId ? await getGuildConfig(interaction.guildId) : null;
  const target = config?.logChannelId && interaction.guild
    ? await interaction.guild.channels.fetch(config.logChannelId).catch(() => null)
    : interaction.channel;
  if (!target?.isTextBased() || !canSend(target)) {
    await interaction.reply({ content: "No text channel is available for suggestions.", ephemeral: true });
    return;
  }
  const message = await target.send({
    embeds: [premiumEmbed("New Suggestion", `${idea}\n\nSubmitted by ${interaction.user}`)]
  });
  await interaction.reply({ embeds: [premiumEmbed("Suggestion Sent", `Posted in ${target}.`)], ephemeral: true });
}

export async function handleGiveaway(interaction: ChatInputCommandInteraction) {
  if (!interaction.guildId || !interaction.channel?.isTextBased() || !canSend(interaction.channel)) return;
  const prize = interaction.options.getString("prize", true);
  const minutes = interaction.options.getInteger("minutes") ?? 10;
  const winnerCount = interaction.options.getInteger("winners") ?? 1;
  const endsAt = Date.now() + minutes * 60_000;
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId("giveaway:join:pending").setLabel("Join Giveaway").setStyle(ButtonStyle.Success)
  );
  const message = await interaction.channel.send({
    embeds: [premiumEmbed("Giveaway Started", `Prize: **${prize}**\nWinners: **${winnerCount}**\nEnds: <t:${Math.floor(endsAt / 1000)}:R>\nEntries: **0**`)],
    components: [row]
  });

  const state: GiveawayState = {
    guildId: interaction.guildId,
    channelId: interaction.channelId,
    messageId: message.id,
    prize,
    winnerCount,
    entrants: new Set<string>(),
    endsAt
  };
  giveaways.set(message.id, state);
  const activeRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(`giveaway:join:${message.id}`).setLabel("Join Giveaway").setStyle(ButtonStyle.Success)
  );
  await message.edit({ components: [activeRow] });
  setTimeout(() => void endGiveaway(message.id), Math.max(5_000, minutes * 60_000));
  await writeAuditLog({ guildId: interaction.guildId, userId: interaction.user.id, action: "giveaway_create", targetId: message.id, metadata: { prize, minutes, winnerCount } });
  await interaction.reply({ embeds: [premiumEmbed("Giveaway Live", `Giveaway posted: ${message.url}`)], ephemeral: true });
}

async function endGiveaway(messageId: string) {
  const state = giveaways.get(messageId);
  if (!state) return;
  giveaways.delete(messageId);
  const entrants = [...state.entrants];
  const winners = entrants.sort(() => Math.random() - 0.5).slice(0, state.winnerCount);
  const channel = await botClient?.channels.fetch(state.channelId).catch(() => null);
  if (channel?.isTextBased() && canSend(channel)) {
    await channel.send({
      embeds: [premiumEmbed("Giveaway Ended", winners.length ? `Prize: **${state.prize}**\nWinner(s): ${winners.map((id) => `<@${id}>`).join(", ")}` : `Prize: **${state.prize}**\nNo valid entries.`)]
    }).catch(() => undefined);
  }
}

export async function handleGiveawayButton(interaction: ButtonInteraction) {
  if (!interaction.customId.startsWith("giveaway:join:")) return false;
  const messageId = interaction.customId.split(":")[2];
  const state = messageId ? giveaways.get(messageId) : null;
  if (!state) {
    await interaction.reply({ content: "This giveaway is no longer active.", ephemeral: true });
    return true;
  }
  state.entrants.add(interaction.user.id);
  await interaction.reply({ content: `You joined **${state.prize}**. Entries: ${state.entrants.size}`, ephemeral: true });
  await interaction.message.edit({
    embeds: [premiumEmbed("Giveaway Started", `Prize: **${state.prize}**\nWinners: **${state.winnerCount}**\nEnds: <t:${Math.floor(state.endsAt / 1000)}:R>\nEntries: **${state.entrants.size}**`)]
  }).catch(() => undefined);
  return true;
}

export async function handleBackup(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) return;
  await interaction.deferReply({ ephemeral: true });
  const roles = interaction.guild.roles.cache
    .filter((role) => role.id !== interaction.guild?.id)
    .map((role) => ({ name: role.name, color: role.hexColor, hoist: role.hoist, permissions: role.permissions.bitfield.toString(), position: role.position }));
  const channels = interaction.guild.channels.cache.map((channel) => ({
    name: channel.name,
    id: channel.id,
    type: channel.type,
    parentId: "parentId" in channel ? channel.parentId : null,
    position: "position" in channel ? channel.position : null
  }));
  const backup = {
    guild: { id: interaction.guild.id, name: interaction.guild.name, icon: interaction.guild.iconURL() },
    createdAt: new Date().toISOString(),
    createdBy: interaction.user.id,
    roles,
    channels
  };
  const file = new AttachmentBuilder(Buffer.from(JSON.stringify(backup, null, 2)), { name: `manok-backup-${interaction.guild.id}.json` });
  await writeAuditLog({ guildId: interaction.guild.id, userId: interaction.user.id, action: "backup_create", metadata: { roles: roles.length, channels: channels.length } });
  await interaction.editReply({ embeds: [premiumEmbed("Backup Created", "Server backup manifest is attached.")], files: [file] });
}

export function installCommunityEvents(client: Client) {
  botClient = client;
  client.on(Events.GuildMemberAdd, (member) => {
    void sendWelcome(member);
  });
  client.on(Events.GuildMemberRemove, (member) => {
    void sendLeave(member);
  });
}
