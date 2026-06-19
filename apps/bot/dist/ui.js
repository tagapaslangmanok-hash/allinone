import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { manokBrand } from "@manok/shared";
export function premiumEmbed(title, description) {
    return new EmbedBuilder()
        .setColor(manokBrand.accent)
        .setTitle(title)
        .setDescription(description ?? null)
        .setFooter({ text: `${manokBrand.name} • premium control plane` })
        .setTimestamp();
}
export function fieldsEmbed(title, fields) {
    return premiumEmbed(title).addFields(fields);
}
export function musicButtons(disabled = false) {
    return new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("music:pause").setStyle(ButtonStyle.Secondary).setLabel("Pause").setDisabled(disabled), new ButtonBuilder().setCustomId("music:skip").setStyle(ButtonStyle.Primary).setLabel("Skip").setDisabled(disabled), new ButtonBuilder().setCustomId("music:stop").setStyle(ButtonStyle.Danger).setLabel("Stop").setDisabled(disabled));
}
export function dashboardButton(url) {
    return new ActionRowBuilder().addComponents(new ButtonBuilder().setStyle(ButtonStyle.Link).setURL(url).setLabel("Open Dashboard"));
}
//# sourceMappingURL=ui.js.map