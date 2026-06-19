import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, type APIEmbedField } from "discord.js";
export declare function premiumEmbed(title: string, description?: string): EmbedBuilder;
export declare function fieldsEmbed(title: string, fields: APIEmbedField[]): EmbedBuilder;
export declare function musicButtons(disabled?: boolean): ActionRowBuilder<ButtonBuilder>;
export declare function dashboardButton(url: string): ActionRowBuilder<ButtonBuilder>;
