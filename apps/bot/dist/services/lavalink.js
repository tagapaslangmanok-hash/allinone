import { LavalinkManager } from "lavalink-client";
import { env } from "../env.js";
let lavalink = null;
export function createLavalink(client) {
    lavalink = new LavalinkManager({
        nodes: [
            {
                id: "MANOK-Railway",
                host: env.LAVALINK_HOST,
                port: env.LAVALINK_PORT,
                authorization: env.LAVALINK_PASSWORD,
                secure: env.LAVALINK_SECURE
            }
        ],
        sendToShard: (guildId, payload) => client.guilds.cache.get(guildId)?.shard?.send(payload),
        autoSkip: true,
        client: {
            id: env.DISCORD_CLIENT_ID,
            username: "MANOK Bot 2026"
        },
        playerOptions: {
            defaultSearchPlatform: "ytmsearch",
            onDisconnect: {
                autoReconnect: true,
                destroyPlayer: false
            },
            onEmptyQueue: {
                destroyAfterMs: 30_000
            },
            volumeDecrementer: 0.75
        },
        queueOptions: {
            maxPreviousTracks: 25
        }
    });
    lavalink.nodeManager.on("connect", (node) => console.log(`Lavalink connected: ${node.id}`));
    lavalink.nodeManager.on("disconnect", (node, reason) => console.warn(`Lavalink disconnected: ${node.id}`, reason));
    lavalink.nodeManager.on("error", (node, error) => console.error(`Lavalink error: ${node.id}`, error));
    return lavalink;
}
export async function initLavalink(client) {
    if (!lavalink)
        createLavalink(client);
    await lavalink?.init({ id: client.user.id, username: client.user.username });
}
export async function sendLavalinkRaw(data) {
    await lavalink?.sendRawData(data);
}
export function lavalinkReady() {
    return Boolean(lavalink?.initiated);
}
function getPlayer(interaction, volume) {
    if (!lavalink)
        throw new Error("Lavalink is not initialized yet.");
    const member = interaction.member;
    const voiceChannelId = member?.voice.channelId;
    if (!interaction.guildId || !voiceChannelId)
        throw new Error("Join a voice channel first and MANOK will auto-join you.");
    return lavalink.createPlayer({
        guildId: interaction.guildId,
        voiceChannelId,
        textChannelId: interaction.channelId,
        selfDeaf: true,
        volume
    });
}
function firstTrack(result) {
    const data = result;
    return data.tracks?.[0] ?? null;
}
export async function lavalinkPlay(interaction, query, volume) {
    const player = getPlayer(interaction, volume);
    await player.connect();
    const result = await player.search(query, interaction.user, true);
    const track = firstTrack(result);
    if (!track)
        throw new Error("No matching YouTube result found.");
    player.queue.add(track);
    const state = player;
    if (!state.playing && !state.paused)
        await state.play();
    return {
        title: track.info?.title ?? query,
        uri: track.info?.uri ?? query,
        durationMs: track.info?.duration ?? 0
    };
}
export async function lavalinkSkip(guildId) {
    await lavalink?.getPlayer(guildId)?.skip();
}
export async function lavalinkPause(guildId, paused) {
    const player = lavalink?.getPlayer(guildId);
    if (paused)
        await player?.pause();
    else
        await player?.resume();
}
export async function lavalinkStop(guildId) {
    await lavalink?.getPlayer(guildId)?.stopPlaying(true);
}
export async function lavalinkVolume(guildId, volume) {
    await lavalink?.getPlayer(guildId)?.setVolume(volume);
}
export async function lavalinkLoop(guildId, mode) {
    await lavalink?.getPlayer(guildId)?.setRepeatMode(mode);
}
export async function lavalinkShuffle(guildId) {
    const player = lavalink?.getPlayer(guildId);
    await player?.queue?.shuffle?.();
}
//# sourceMappingURL=lavalink.js.map