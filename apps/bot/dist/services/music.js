import { clamp, formatDuration } from "@manok/shared";
import { getGuildConfig } from "@manok/database";
import { musicButtons, premiumEmbed } from "../ui.js";
import { lavalinkLoop, lavalinkPause, lavalinkPlay, lavalinkShuffle, lavalinkSkip, lavalinkStop, lavalinkVolume } from "./lavalink.js";
const queues = new Map();
function queueFor(guildId, volume) {
    const existing = queues.get(guildId);
    if (existing)
        return existing;
    const queue = { tracks: [], loop: "off", volume, paused: false };
    queues.set(guildId, queue);
    return queue;
}
function spotifyToSearch(query) {
    if (!/open\.spotify\.com\/(track|album|playlist)/i.test(query))
        return query;
    return `ytsearch:${query} official audio`;
}
async function ensureVoice(interaction) {
    const member = interaction.member;
    const channel = member?.voice.channel;
    if (!channel)
        throw new Error("Join a voice channel first and MANOK will auto-join you.");
    return channel;
}
export async function handleMusicCommand(interaction, subcommand) {
    if (!interaction.guildId)
        return;
    const config = await getGuildConfig(interaction.guildId);
    const queue = queueFor(interaction.guildId, config.music.volume);
    try {
        if (subcommand === "play") {
            const voice = await ensureVoice(interaction);
            const query = spotifyToSearch(interaction.options.getString("query", true));
            const track = {
                ...(await lavalinkPlay(interaction, query, queue.volume)),
                uri: query,
                requesterId: interaction.user.id,
                durationMs: 0
            };
            if (!queue.current)
                queue.current = track;
            else
                queue.tracks.push(track);
            await interaction.reply({
                embeds: [premiumEmbed("Added to Queue", `**${track.title}**\nVoice: ${voice}\nSpotify links are used as metadata only, then matched against YouTube.`)],
                components: [musicButtons()]
            });
            return;
        }
        if (subcommand === "skip") {
            await lavalinkSkip(interaction.guildId);
            queue.current = queue.tracks.shift();
            await interaction.reply({ embeds: [premiumEmbed("Skipped", queue.current ? `Now playing **${queue.current.title}**.` : "Queue is empty.")] });
            return;
        }
        if (subcommand === "pause" || subcommand === "resume") {
            queue.paused = subcommand === "pause";
            await lavalinkPause(interaction.guildId, queue.paused);
            await interaction.reply({ embeds: [premiumEmbed(queue.paused ? "Paused" : "Resumed", queue.current?.title ?? "No active track.")], components: [musicButtons(!queue.current)] });
            return;
        }
        if (subcommand === "stop") {
            await lavalinkStop(interaction.guildId);
            queue.current = undefined;
            queue.tracks = [];
            await interaction.reply({ embeds: [premiumEmbed("Stopped", "Queue cleared and playback stopped.")] });
            return;
        }
        if (subcommand === "volume") {
            queue.volume = clamp(interaction.options.getInteger("percent", true), 1, 150);
            await lavalinkVolume(interaction.guildId, queue.volume);
            await interaction.reply({ embeds: [premiumEmbed("Volume Updated", `${queue.volume}%`)] });
            return;
        }
        if (subcommand === "loop") {
            queue.loop = interaction.options.getString("mode", true);
            await lavalinkLoop(interaction.guildId, queue.loop);
            await interaction.reply({ embeds: [premiumEmbed("Loop Updated", queue.loop)] });
            return;
        }
        if (subcommand === "shuffle") {
            await lavalinkShuffle(interaction.guildId);
            queue.tracks = queue.tracks.map((track) => ({ track, sort: Math.random() })).sort((a, b) => a.sort - b.sort).map(({ track }) => track);
            await interaction.reply({ embeds: [premiumEmbed("Queue Shuffled", `${queue.tracks.length} upcoming tracks mixed.`)] });
            return;
        }
        if (subcommand === "queue") {
            const upcoming = queue.tracks.slice(0, 10).map((track, index) => `${index + 1}. ${track.title}`).join("\n") || "No upcoming tracks.";
            await interaction.reply({ embeds: [premiumEmbed("Music Queue", `Now: **${queue.current?.title ?? "Nothing playing"}**\n\n${upcoming}`)] });
            return;
        }
        if (subcommand === "nowplaying") {
            await interaction.reply({
                embeds: [premiumEmbed("Now Playing", queue.current ? `**${queue.current.title}**\nVolume: ${queue.volume}%\nLoop: ${queue.loop}\nDuration: ${formatDuration(queue.current.durationMs)}` : "Nothing is playing.")],
                components: [musicButtons(!queue.current)]
            });
        }
    }
    catch (error) {
        await interaction.reply({ embeds: [premiumEmbed("Music Control", error instanceof Error ? error.message : "Music action failed.")], ephemeral: true });
    }
}
export async function handleMusicButton(interaction) {
    if (!interaction.guildId || !interaction.customId.startsWith("music:"))
        return false;
    const action = interaction.customId.split(":")[1];
    const config = await getGuildConfig(interaction.guildId);
    const queue = queueFor(interaction.guildId, config.music.volume);
    if (action === "pause") {
        queue.paused = !queue.paused;
        await lavalinkPause(interaction.guildId, queue.paused);
        await interaction.reply({ embeds: [premiumEmbed(queue.paused ? "Paused" : "Resumed", queue.current?.title ?? "Music player updated.")], ephemeral: true });
        return true;
    }
    if (action === "skip") {
        await lavalinkSkip(interaction.guildId);
        queue.current = queue.tracks.shift();
        await interaction.reply({ embeds: [premiumEmbed("Skipped", queue.current ? `Now playing **${queue.current.title}**.` : "Queue is empty.")], ephemeral: true });
        return true;
    }
    if (action === "stop") {
        await lavalinkStop(interaction.guildId);
        queue.current = undefined;
        queue.tracks = [];
        await interaction.reply({ embeds: [premiumEmbed("Stopped", "Queue cleared and playback stopped.")], ephemeral: true });
        return true;
    }
    return false;
}
//# sourceMappingURL=music.js.map