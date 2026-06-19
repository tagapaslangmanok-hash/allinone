import {
  ActivityType,
  Client,
  Events,
  GatewayIntentBits,
  Partials
} from "discord.js";
import { connectMongo, getRedis } from "@manok/database";
import { env } from "./env.js";
import { handleManok } from "./commands/manok.js";
import { installAntiNuke } from "./services/anti-nuke.js";
import { createLavalink, initLavalink, sendLavalinkRaw } from "./services/lavalink.js";
import { handleHelpComponent } from "./services/help-menu.js";
import { handleMusicButton } from "./services/music.js";
import { handleGiveawayButton, installCommunityEvents } from "./services/community.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildWebhooks
  ],
  partials: [Partials.Channel, Partials.GuildMember, Partials.Message]
});

const statuses = [
  "Protecting servers",
  "Playing music",
  "Encrypting Lua files",
  "Watching dashboard"
];

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`${readyClient.user.tag} is online.`);
  await initLavalink(readyClient);
  let index = 0;
  setInterval(() => {
    const name = statuses[index % statuses.length] ?? "Protecting servers";
    index += 1;
    readyClient.user.setPresence({
      activities: [{ name, type: ActivityType.Watching }],
      status: "online"
    });
  }, 20_000);
});

client.on(Events.Raw, (packet) => {
  void sendLavalinkRaw(packet);
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (interaction.isChatInputCommand() && ["manok", "community"].includes(interaction.commandName)) {
      await handleManok(interaction);
      return;
    }
    if ((interaction.isStringSelectMenu() || interaction.isButton()) && await handleHelpComponent(interaction)) {
      return;
    }
    if (interaction.isButton() && await handleMusicButton(interaction)) {
      return;
    }
    if (interaction.isButton() && await handleGiveawayButton(interaction)) {
      return;
    }
  } catch (error) {
    console.error(error);
    if (interaction.isRepliable()) {
      const payload = { content: "MANOK caught an error and logged it safely.", ephemeral: true };
      if (interaction.deferred || interaction.replied) await interaction.followUp(payload).catch(() => undefined);
      else await interaction.reply(payload).catch(() => undefined);
    }
  }
});

process.on("unhandledRejection", (error) => console.error("Unhandled rejection", error));
process.on("uncaughtException", (error) => console.error("Uncaught exception", error));

await connectMongo(env.MONGODB_URI).catch((error) => console.warn("MongoDB degraded:", error.message));
const redis = getRedis(env.REDIS_URL);
redis.on("error", () => undefined);
await redis.connect().catch((error) => {
  console.warn("Redis degraded:", error.message);
  redis.disconnect();
});
createLavalink(client);
installAntiNuke(client);
installCommunityEvents(client);
await client.login(env.DISCORD_TOKEN).catch((error) => {
  console.error("Discord login failed:", error.message);
  process.exitCode = 1;
});
