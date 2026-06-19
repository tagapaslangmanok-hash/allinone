import { ButtonInteraction, StringSelectMenuInteraction, type ChatInputCommandInteraction, type InteractionReplyOptions } from "discord.js";
export declare function mainHelpPayload(interaction: ChatInputCommandInteraction): InteractionReplyOptions;
export declare function handleHelpComponent(interaction: StringSelectMenuInteraction | ButtonInteraction): Promise<boolean>;
