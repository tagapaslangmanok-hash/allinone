import crypto from "node:crypto";
import path from "node:path";
import { AttachmentBuilder } from "discord.js";
import { fetch } from "undici";
import { luaCryptoLimits } from "@manok/shared";
import { getGuildConfig, writeAuditLog } from "@manok/database";
import { env, ownerIds } from "../env.js";
import { premiumEmbed } from "../ui.js";
const iterations = 210_000;
function keyMaterial(salt) {
    return crypto.pbkdf2Sync(env.ENCRYPTION_MASTER_KEY, salt, iterations, 32, "sha512");
}
async function readAttachment(interaction) {
    const file = interaction.options.getAttachment("file", true);
    if (file.size > luaCryptoLimits.maxBytes)
        throw new Error(`File exceeds ${luaCryptoLimits.maxBytes / 1024} KB limit.`);
    const extension = path.extname(file.name).toLowerCase();
    if (!luaCryptoLimits.extensionAllowList.includes(extension)) {
        throw new Error("Only Lua-oriented text files are accepted.");
    }
    const response = await fetch(file.url);
    if (!response.ok)
        throw new Error("Could not download the uploaded file.");
    return { file, bytes: Buffer.from(await response.arrayBuffer()) };
}
function envelope(payload) {
    return Buffer.from(JSON.stringify({ magic: luaCryptoLimits.encryptedMagic, version: 1, ...payload }, null, 2));
}
function parseEnvelope(bytes) {
    const parsed = JSON.parse(bytes.toString("utf8"));
    if (parsed.magic !== luaCryptoLimits.encryptedMagic || !parsed.ownerId || !parsed.salt || !parsed.iv || !parsed.tag || !parsed.ciphertext) {
        throw new Error("This file was not encrypted by MANOK Bot.");
    }
    return parsed;
}
async function staffLog(interaction, action, metadata) {
    if (!interaction.guildId)
        return;
    await writeAuditLog({ guildId: interaction.guildId, userId: interaction.user.id, action, metadata });
    if (!env.STAFF_LOG_WEBHOOK_URL)
        return;
    await fetch(env.STAFF_LOG_WEBHOOK_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
            embeds: [{
                    title: `MANOK ${action.replace("_", " ")}`,
                    color: 0x8b5cf6,
                    fields: [
                        { name: "User", value: `${interaction.user.tag} (${interaction.user.id})`, inline: false },
                        { name: "Guild", value: `${interaction.guild?.name ?? "Unknown"} (${interaction.guildId})`, inline: false },
                        { name: "Metadata", value: `\`\`\`json\n${JSON.stringify(metadata, null, 2).slice(0, 900)}\n\`\`\`` }
                    ],
                    timestamp: new Date().toISOString()
                }]
        })
    }).catch(() => undefined);
}
export async function handleLuaCommand(interaction, subcommand) {
    try {
        if (subcommand === "hash") {
            const text = interaction.options.getString("text", true);
            const hash = crypto.createHash("sha256").update(text).digest("hex");
            await interaction.reply({ embeds: [premiumEmbed("SHA-256 Hash", `\`${hash}\``)], ephemeral: true });
            return;
        }
        if (subcommand === "compare") {
            const text = interaction.options.getString("text", true);
            const expected = interaction.options.getString("hash", true).toLowerCase();
            const actual = crypto.createHash("sha256").update(text).digest("hex");
            await interaction.reply({ embeds: [premiumEmbed("Hash Compare", actual === expected ? "Match confirmed." : "No match.")], ephemeral: true });
            return;
        }
        await interaction.deferReply({ ephemeral: true });
        if (subcommand === "scan") {
            const { file, bytes } = await readAttachment(interaction);
            const text = bytes.toString("utf8");
            const findings = [
                /loadstring\s*\(/i.test(text) && "Uses loadstring",
                /HttpGet|request\s*\(/i.test(text) && "Performs remote fetch/request",
                /getfenv|setfenv/i.test(text) && "Manipulates environment",
                /require\s*\(/i.test(text) && "Loads external module"
            ].filter(Boolean);
            await staffLog(interaction, "lua_encrypt", { scanOnly: true, filename: file.name, findings });
            await interaction.editReply({ embeds: [premiumEmbed("Lua Scan Complete", findings.length ? findings.join("\n") : "No common high-risk patterns found. This is not a guarantee of safety.")] });
            return;
        }
        const { file, bytes } = await readAttachment(interaction);
        if (subcommand === "encrypt") {
            const salt = crypto.randomBytes(24);
            const iv = crypto.randomBytes(12);
            const cipher = crypto.createCipheriv("aes-256-gcm", keyMaterial(salt), iv);
            const ciphertext = Buffer.concat([cipher.update(bytes), cipher.final()]);
            const tag = cipher.getAuthTag();
            const output = envelope({
                ownerId: interaction.user.id,
                guildId: interaction.guildId ?? "dm",
                filename: file.name,
                salt: salt.toString("base64"),
                iv: iv.toString("base64"),
                tag: tag.toString("base64"),
                ciphertext: ciphertext.toString("base64")
            });
            await staffLog(interaction, "lua_encrypt", { filename: file.name, bytes: file.size });
            await interaction.editReply({
                embeds: [premiumEmbed("Lua File Encrypted", "Encrypted with AES-256-GCM. Only MANOK can decrypt this envelope, and ownership is recorded.")],
                files: [new AttachmentBuilder(output, { name: `${file.name}.manok.json` })]
            });
            return;
        }
        if (subcommand === "decrypt") {
            const parsed = parseEnvelope(bytes);
            const config = await getGuildConfig(interaction.guildId ?? parsed.guildId ?? "unknown");
            const member = interaction.member;
            const isOwner = ownerIds.includes(interaction.user.id);
            const ownsFile = parsed.ownerId === interaction.user.id;
            const hasStaffRole = member?.roles.cache.some((role) => config.staffRoleIds.includes(role.id)) ?? false;
            if (config.ownerOnlyDecrypt && !isOwner)
                throw new Error("Owner-only decrypt mode is enabled for this guild.");
            if (!ownsFile && !isOwner && !hasStaffRole)
                throw new Error("You can only decrypt MANOK files that you own.");
            const decipher = crypto.createDecipheriv("aes-256-gcm", keyMaterial(Buffer.from(parsed.salt, "base64")), Buffer.from(parsed.iv, "base64"));
            decipher.setAuthTag(Buffer.from(parsed.tag, "base64"));
            const plaintext = Buffer.concat([decipher.update(Buffer.from(parsed.ciphertext, "base64")), decipher.final()]);
            await staffLog(interaction, "lua_decrypt", { filename: parsed.filename, ownerId: parsed.ownerId, byOwner: isOwner });
            await interaction.editReply({
                embeds: [premiumEmbed("Lua File Decrypted", "This only works for MANOK-encrypted files. Protected third-party scripts are never bypassed or cracked.")],
                files: [new AttachmentBuilder(plaintext, { name: parsed.filename ?? "decrypted.lua" })]
            });
        }
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Lua tool failed.";
        if (interaction.deferred)
            await interaction.editReply({ embeds: [premiumEmbed("Lua Tool Blocked", message)] });
        else
            await interaction.reply({ embeds: [premiumEmbed("Lua Tool Blocked", message)], ephemeral: true });
    }
}
//# sourceMappingURL=lua-tools.js.map