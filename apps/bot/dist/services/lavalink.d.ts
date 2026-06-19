import type { Client, ChatInputCommandInteraction } from "discord.js";
import { LavalinkManager, type RepeatMode } from "lavalink-client";
export declare function createLavalink(client: Client): LavalinkManager<import("lavalink-client").Player>;
export declare function initLavalink(client: Client<true>): Promise<void>;
export declare function sendLavalinkRaw(data: unknown): Promise<void>;
export declare function lavalinkReady(): boolean;
export declare function lavalinkPlay(interaction: ChatInputCommandInteraction, query: string, volume: number): Promise<{
    title: string;
    uri: string;
    durationMs: number;
}>;
export declare function lavalinkSkip(guildId: string): Promise<void>;
export declare function lavalinkPause(guildId: string, paused: boolean): Promise<void>;
export declare function lavalinkStop(guildId: string): Promise<void>;
export declare function lavalinkVolume(guildId: string, volume: number): Promise<void>;
export declare function lavalinkLoop(guildId: string, mode: RepeatMode): Promise<void>;
export declare function lavalinkShuffle(guildId: string): Promise<void>;
