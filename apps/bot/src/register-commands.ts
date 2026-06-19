import { REST, Routes } from "discord.js";
import { env } from "./env.js";
import { communityCommand, manokCommand } from "./commands/manok.js";

const rest = new REST({ version: "10" }).setToken(env.DISCORD_TOKEN);
const body = [manokCommand.toJSON(), communityCommand.toJSON()];

if (env.DISCORD_GUILD_ID) {
  await rest.put(Routes.applicationGuildCommands(env.DISCORD_CLIENT_ID, env.DISCORD_GUILD_ID), { body });
  console.log(`Registered MANOK commands to guild ${env.DISCORD_GUILD_ID}`);
} else {
  await rest.put(Routes.applicationCommands(env.DISCORD_CLIENT_ID), { body });
  console.log("Registered MANOK commands globally");
}
