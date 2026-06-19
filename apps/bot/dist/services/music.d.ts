import type { ButtonInteraction, ChatInputCommandInteraction } from "discord.js";
export declare function handleMusicCommand(interaction: ChatInputCommandInteraction, subcommand: string): Promise<void>;
export declare function handleMusicButton(interaction: ButtonInteraction): Promise<boolean>;
