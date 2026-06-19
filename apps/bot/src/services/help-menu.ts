import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  type ChatInputCommandInteraction,
  type InteractionUpdateOptions,
  type InteractionReplyOptions,
  type MessageActionRowComponentBuilder
} from "discord.js";
import { env } from "../env.js";

const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${env.DISCORD_CLIENT_ID}&permissions=8&scope=bot%20applications.commands`;

type HelpCategory =
  | "security"
  | "music"
  | "lua"
  | "tickets"
  | "moderation"
  | "giveaway"
  | "utils"
  | "fun"
  | "more";

const totalCommands = 27;

const categories: Record<HelpCategory, { label: string; description: string; commands: string[] }> = {
  security: {
    label: "Security",
    description: "Anti-nuke, whitelist, live logs, and permission escalation controls.",
    commands: ["/manok security", "/manok whitelist", "/manok logs", "/manok scan"]
  },
  music: {
    label: "Music",
    description: "Lavalink music control with YouTube search and Spotify metadata matching.",
    commands: ["/manok play", "/manok skip", "/manok pause", "/manok resume", "/manok queue", "/manok stop", "/manok volume", "/manok nowplaying", "/manok loop", "/manok shuffle"]
  },
  lua: {
    label: "Lua Tools",
    description: "User-owned Lua file encryption, decryption, hashing, compare, and scan tools.",
    commands: ["/manok encrypt", "/manok decrypt", "/manok hash", "/manok compare", "/manok scan"]
  },
  tickets: {
    label: "Tickets",
    description: "Premium support ticket workflow and staff routing foundation.",
    commands: ["/manok ticket", "/manok dashboard"]
  },
  moderation: {
    label: "Moderation",
    description: "Server safety commands and audit-ready moderation controls.",
    commands: ["/manok security", "/manok whitelist", "/manok logs", "/manok backup"]
  },
  giveaway: {
    label: "Giveaway",
    description: "Giveaway creation and community engagement tools.",
    commands: ["/manok giveaway"]
  },
  utils: {
    label: "Utils",
    description: "Embeds, dashboard links, server configuration, and utility workflows.",
    commands: ["/manok help", "/manok embed", "/manok dashboard", "/manok backup"]
  },
  fun: {
    label: "Fun",
    description: "Community interaction commands for suggestions, giveaways, and music sessions.",
    commands: ["/manok suggest", "/manok giveaway", "/manok play"]
  },
  more: {
    label: "More",
    description: "Welcome, verification, tickets, backups, and dashboard modules.",
    commands: ["/manok verify", "/manok welcome", "/manok ticket", "/manok suggest", "/manok backup", "/manok dashboard"]
  }
};

function baseEmbed(guildName?: string | null) {
  return new EmbedBuilder()
    .setColor(0x111827)
    .setTitle("ElijahSEC")
    .setDescription("Help menu")
    .addFields(
      {
        name: "Server",
        value: [
          `- Prefix for this server is \`/manok\``,
          `- Total commands: \`${totalCommands}\``,
          `- Server: \`${guildName ?? "MANOK protected server"}\``
        ].join("\n")
      },
      {
        name: "Main",
        value: [
          ":ManokSecurity: Security",
          ":ManokAutomod: Automod",
          ":ManokModeration: Moderation",
          ":ManokTicket: Ticket",
          ":ManokWelcome: Welcomer",
          ":ManokMusic: Music"
        ].join("\n"),
        inline: true
      },
      {
        name: "Extra",
        value: [
          ":ManokSettings: Utils",
          ":ManokGiveaway: Giveaway",
          ":ManokHelp: Help",
          ":ManokFun: Fun",
          ":ManokVoice: Voice",
          ":ManokExtra: More"
        ].join("\n"),
        inline: true
      },
      {
        name: "Select a category to view",
        value: "Use the menu below to open a focused command panel."
      }
    )
    .setFooter({ text: "MANOK Bot 2026 - premium Discord security and music platform" })
    .setTimestamp();
}

function categoryEmbed(category: HelpCategory) {
  const item = categories[category];
  return new EmbedBuilder()
    .setColor(0x8b5cf6)
    .setTitle(`ElijahSEC - ${item.label}`)
    .setDescription(item.description)
    .addFields({
      name: "Commands",
      value: item.commands.map((command) => `\`${command}\``).join("\n")
    })
    .setFooter({ text: "Select another category or open All Commands." })
    .setTimestamp();
}

function allCommandsEmbed() {
  return new EmbedBuilder()
    .setColor(0x22d3ee)
    .setTitle("ElijahSEC - All Commands")
    .setDescription("Complete MANOK slash-command map. Every command stays under `/manok`.")
    .addFields(
      { name: "Security", value: categories.security.commands.map((c) => `\`${c}\``).join(", ") },
      { name: "Music", value: categories.music.commands.map((c) => `\`${c}\``).join(", ") },
      { name: "Lua Tools", value: categories.lua.commands.map((c) => `\`${c}\``).join(", ") },
      { name: "Community", value: ["/manok ticket", "/manok verify", "/manok welcome", "/manok embed", "/manok giveaway", "/manok suggest", "/manok backup", "/manok dashboard"].map((c) => `\`${c}\``).join(", ") }
    )
    .setFooter({ text: `${totalCommands} total premium commands` })
    .setTimestamp();
}

function selectRow(selected?: HelpCategory) {
  const menu = new StringSelectMenuBuilder()
    .setCustomId("manok:help:category")
    .setPlaceholder("Select a category to view")
    .addOptions(
      Object.entries(categories).map(([value, category]) => ({
        label: category.label,
        value,
        description: category.description.slice(0, 95),
        default: selected === value
      }))
    );

  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
}

function buttonRow() {
  return new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
    new ButtonBuilder().setCustomId("manok:help:all").setLabel("All Commands").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId("manok:help:report").setLabel("Report").setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setLabel("Invite").setStyle(ButtonStyle.Link).setURL(inviteUrl),
    new ButtonBuilder().setCustomId("manok:help:support").setLabel("Support").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("manok:help:vote").setLabel("Vote").setStyle(ButtonStyle.Secondary)
  );
}

function helpPayload(embed: EmbedBuilder, selected?: HelpCategory): InteractionReplyOptions & InteractionUpdateOptions {
  return {
    embeds: [embed],
    components: [selectRow(selected), buttonRow()]
  };
}

export function mainHelpPayload(interaction: ChatInputCommandInteraction): InteractionReplyOptions {
  return helpPayload(baseEmbed(interaction.guild?.name));
}

export async function handleHelpComponent(interaction: StringSelectMenuInteraction | ButtonInteraction) {
  if (interaction.isStringSelectMenu() && interaction.customId === "manok:help:category") {
    const selected = interaction.values[0] as HelpCategory | undefined;
    if (!selected || !(selected in categories)) {
      await interaction.reply({ content: "That help category is not available.", ephemeral: true });
      return true;
    }
    await interaction.update(helpPayload(categoryEmbed(selected), selected));
    return true;
  }

  if (interaction.isButton() && interaction.customId === "manok:help:all") {
    await interaction.update(helpPayload(allCommandsEmbed()));
    return true;
  }

  if (interaction.isButton() && interaction.customId === "manok:help:report") {
    await interaction.reply({
      content: "Report system will be updated soon.",
      ephemeral: true
    });
    return true;
  }

  if (interaction.isButton() && interaction.customId === "manok:help:support") {
    await interaction.reply({
      content: "Support server will be updated soon.",
      ephemeral: true
    });
    return true;
  }

  if (interaction.isButton() && interaction.customId === "manok:help:vote") {
    await interaction.reply({
      content: "Vote page will be updated soon.",
      ephemeral: true
    });
    return true;
  }

  return false;
}
