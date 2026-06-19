import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { fieldsEmbed, premiumEmbed } from "../ui.js";
import { handleMusicCommand } from "../services/music.js";
import { handleLuaCommand } from "../services/lua-tools.js";
import { mainHelpPayload } from "../services/help-menu.js";
import { handleBackup, handleGiveaway, handleSuggestion, handleTicket, handleVerify, handleWelcomeConfig } from "../services/community.js";
import { getGuildConfig, updateGuildConfig, writeAuditLog } from "@manok/database";
export const manokCommand = new SlashCommandBuilder()
    .setName("manok")
    .setDescription("MANOK Bot 2026 premium command center")
    .addSubcommand((s) => s.setName("help").setDescription("Show MANOK command center"))
    .addSubcommand((s) => s.setName("play").setDescription("Play YouTube or Spotify metadata match").addStringOption((o) => o.setName("query").setDescription("Song name, YouTube URL, or Spotify URL").setRequired(true)))
    .addSubcommand((s) => s.setName("skip").setDescription("Skip current track"))
    .addSubcommand((s) => s.setName("pause").setDescription("Pause music"))
    .addSubcommand((s) => s.setName("resume").setDescription("Resume music"))
    .addSubcommand((s) => s.setName("queue").setDescription("Show queue"))
    .addSubcommand((s) => s.setName("stop").setDescription("Stop music and clear queue"))
    .addSubcommand((s) => s.setName("volume").setDescription("Set volume").addIntegerOption((o) => o.setName("percent").setDescription("1-150").setMinValue(1).setMaxValue(150).setRequired(true)))
    .addSubcommand((s) => s.setName("nowplaying").setDescription("Show now playing"))
    .addSubcommand((s) => s.setName("loop").setDescription("Set loop mode").addStringOption((o) => o.setName("mode").setDescription("Loop mode").setRequired(true).addChoices({ name: "Off", value: "off" }, { name: "Track", value: "track" }, { name: "Queue", value: "queue" })))
    .addSubcommand((s) => s.setName("shuffle").setDescription("Shuffle queue"))
    .addSubcommand((s) => s.setName("encrypt").setDescription("Encrypt a Lua file owned by you").addAttachmentOption((o) => o.setName("file").setDescription("Lua file").setRequired(true)))
    .addSubcommand((s) => s.setName("decrypt").setDescription("Decrypt a MANOK-encrypted Lua file").addAttachmentOption((o) => o.setName("file").setDescription("MANOK encrypted file").setRequired(true)))
    .addSubcommand((s) => s.setName("hash").setDescription("Hash text with SHA-256").addStringOption((o) => o.setName("text").setDescription("Text to hash").setRequired(true)))
    .addSubcommand((s) => s.setName("compare").setDescription("Compare text against SHA-256 hash").addStringOption((o) => o.setName("text").setDescription("Text").setRequired(true)).addStringOption((o) => o.setName("hash").setDescription("Expected SHA-256 hash").setRequired(true)))
    .addSubcommand((s) => s.setName("scan").setDescription("Run a safe Lua file scan").addAttachmentOption((o) => o.setName("file").setDescription("Lua file").setRequired(true)))
    .addSubcommand((s) => s.setName("security").setDescription("Show anti-nuke security center"))
    .addSubcommand((s) => s.setName("whitelist").setDescription("Whitelist a trusted user").addUserOption((o) => o.setName("user").setDescription("Trusted user").setRequired(true)))
    .addSubcommand((s) => s.setName("logs").setDescription("Configure log channel").addChannelOption((o) => o.setName("channel").setDescription("Log channel").setRequired(false)))
    .addSubcommand((s) => s.setName("dashboard").setDescription("Open the premium dashboard"));
export const communityCommand = new SlashCommandBuilder()
    .setName("community")
    .setDescription("MANOK community tools")
    .addSubcommand((s) => s.setName("ticket").setDescription("Create a support ticket").addStringOption((o) => o.setName("subject").setDescription("Ticket subject")))
    .addSubcommand((s) => s.setName("verify").setDescription("Verify yourself or configure verification").addRoleOption((o) => o.setName("role").setDescription("Verified role to configure")).addChannelOption((o) => o.setName("channel").setDescription("Verification channel")))
    .addSubcommand((s) => s.setName("welcome").setDescription("Show or configure welcome messages").addBooleanOption((o) => o.setName("enabled").setDescription("Enable or disable welcome system")).addChannelOption((o) => o.setName("channel").setDescription("Welcome channel")).addChannelOption((o) => o.setName("leave_channel").setDescription("Leave channel")).addStringOption((o) => o.setName("message").setDescription("Welcome message. Use {user}, {server}, {count}").setMaxLength(1000)).addStringOption((o) => o.setName("leave_message").setDescription("Leave message. Use {user}, {server}, {count}").setMaxLength(1000)))
    .addSubcommand((s) => s.setName("embed").setDescription("Build a premium embed").addStringOption((o) => o.setName("title").setDescription("Title").setRequired(true)).addStringOption((o) => o.setName("body").setDescription("Body").setRequired(true)))
    .addSubcommand((s) => s.setName("giveaway").setDescription("Create a giveaway").addStringOption((o) => o.setName("prize").setDescription("Prize").setRequired(true)).addIntegerOption((o) => o.setName("minutes").setDescription("Duration in minutes").setMinValue(1).setMaxValue(10080)).addIntegerOption((o) => o.setName("winners").setDescription("Winner count").setMinValue(1).setMaxValue(20)))
    .addSubcommand((s) => s.setName("suggest").setDescription("Send a suggestion").addStringOption((o) => o.setName("idea").setDescription("Your suggestion").setRequired(true)))
    .addSubcommand((s) => s.setName("backup").setDescription("Create a server backup manifest"));
export async function handleManok(interaction) {
    if (!interaction.guildId) {
        await interaction.reply({ content: "MANOK commands run inside servers.", ephemeral: true });
        return;
    }
    const subcommand = interaction.options.getSubcommand();
    if (["play", "skip", "pause", "resume", "queue", "stop", "volume", "nowplaying", "loop", "shuffle"].includes(subcommand)) {
        await handleMusicCommand(interaction, subcommand);
        return;
    }
    if (["encrypt", "decrypt", "hash", "compare", "scan"].includes(subcommand)) {
        await handleLuaCommand(interaction, subcommand);
        return;
    }
    const config = await getGuildConfig(interaction.guildId);
    switch (subcommand) {
        case "help":
            await interaction.reply(mainHelpPayload(interaction));
            break;
        case "security":
            await interaction.reply({
                embeds: [fieldsEmbed("Security Center", [
                        { name: "Anti-nuke", value: config.antiNuke.enabled ? "Enabled" : "Disabled", inline: true },
                        { name: "Threshold", value: `${config.antiNuke.threshold} actions / ${Math.round(config.antiNuke.windowMs / 1000)}s`, inline: true },
                        { name: "Punishment", value: config.antiNuke.punishment, inline: true },
                        { name: "Whitelist", value: `${config.whitelistUserIds.length} users, ${config.whitelistRoleIds.length} roles`, inline: true }
                    ])],
                ephemeral: true
            });
            break;
        case "whitelist": {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                await interaction.reply({ content: "Administrator permission is required.", ephemeral: true });
                return;
            }
            const user = interaction.options.getUser("user", true);
            await updateGuildConfig(interaction.guildId, { whitelistUserIds: [...new Set([...config.whitelistUserIds, user.id])] });
            await writeAuditLog({ guildId: interaction.guildId, userId: interaction.user.id, action: "config_update", targetId: user.id, metadata: { area: "whitelist" } });
            await interaction.reply({ embeds: [premiumEmbed("Whitelist Updated", `${user} is trusted by MANOK anti-nuke.`)], ephemeral: true });
            break;
        }
        case "logs": {
            const channel = interaction.options.getChannel("channel");
            await updateGuildConfig(interaction.guildId, { logChannelId: channel?.id });
            await interaction.reply({ embeds: [premiumEmbed("Logging Updated", channel ? `Live logs will stream to ${channel}.` : "Log channel cleared.")], ephemeral: true });
            break;
        }
        case "dashboard":
            await interaction.reply({ embeds: [premiumEmbed("MANOK Dashboard", "Public dashboard will be updated soon.")], ephemeral: true });
            break;
        case "embed":
            await interaction.reply({ embeds: [premiumEmbed(interaction.options.getString("title", true), interaction.options.getString("body", true))] });
            break;
        case "ticket":
            await handleTicket(interaction);
            break;
        case "verify":
            await handleVerify(interaction);
            break;
        case "welcome":
            await handleWelcomeConfig(interaction);
            break;
        case "giveaway":
            await handleGiveaway(interaction);
            break;
        case "suggest":
            await handleSuggestion(interaction);
            break;
        case "backup":
            await handleBackup(interaction);
            break;
        default:
            await interaction.reply({ embeds: [premiumEmbed("MANOK Module Ready", `The \`${subcommand}\` workflow is available in the dashboard foundation and ready for guild-specific customization.`)], ephemeral: true });
    }
}
//# sourceMappingURL=manok.js.map