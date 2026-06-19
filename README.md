# MANOK Bot 2026

Premium Discord bot platform for security, Lavalink music, Lua file tools, tickets, verification, welcome flows, suggestions, giveaways, backups, live logs, and a Next.js dashboard.

## Stack

- Node.js 22.x and npm workspaces
- discord.js v14
- MongoDB via Mongoose
- Redis via ioredis
- Lavalink-ready music service
- Next.js 15 dashboard
- Tailwind CSS
- Railway deployment

## Structure

```txt
apps/
  bot/             Discord bot, slash commands, anti-nuke, Lua tools, music controls
  dashboard/       Premium web dashboard and API routes
packages/
  database/        MongoDB models, Redis client, config and audit helpers
  shared/          Shared schemas, constants, types, formatting helpers
```

## Commands

The main slash command group is `/manok`.

Available subcommands: `help`, `play`, `skip`, `pause`, `resume`, `queue`, `stop`, `volume`, `nowplaying`, `loop`, `shuffle`, `encrypt`, `decrypt`, `hash`, `compare`, `scan`, `security`, `whitelist`, `logs`, `ticket`, `verify`, `welcome`, `embed`, `giveaway`, `suggest`, `backup`, `dashboard`.

## Local Setup

1. Install Node.js 22.x.
2. Copy `.env.example` to `.env`.
3. Fill in Discord token, Discord client id, and `OWNER_IDS`. MongoDB, Redis, and Lavalink work locally with bundled defaults.
4. Install dependencies:

```bash
npm install
```

5. Start bundled local services:

```bash
npm run dev:infra
```

This starts MongoDB, Redis, and Lavalink locally. You do not need to add `MONGODB_URI`, `REDIS_URL`, `LAVALINK_HOST`, `LAVALINK_PORT`, `LAVALINK_PASSWORD`, or `LAVALINK_SECURE` to `.env` for local development.

6. Register slash commands:

```bash
npm run register:commands
```

7. Start the bot:

```bash
npm run dev:bot
```

8. Start the dashboard:

```bash
npm run dev:dashboard
```

## Railway Deployment

Use [RAILWAY_SETUP.md](./RAILWAY_SETUP.md) for the easiest setup. Public dashboard links are intentionally marked **to be updated soon**, but the Discord bot functions are wired and deployable.

Quick version:

1. Create a Railway bot service from this repo using the root `Dockerfile`.
2. Create a Railway Lavalink service using `infra/lavalink/Dockerfile`.
3. Add MongoDB and Redis services, or paste external connection strings.
4. Set Discord, database, Redis, Lavalink host, and `OWNER_IDS` variables.
5. Run `npm run register:commands` once from Railway shell or locally using production env values.

For the bot service, the start command is:

```bash
npm run start --workspace @manok/bot
```

The public dashboard service is not required yet.

## Lua Tool Safety

MANOK only encrypts slash-command uploaded Lua-oriented files from the requesting user. Decryption only accepts MANOK envelopes with the `MANOK-LUA-GCM-v1` marker. The crypto path uses AES-256-GCM and PBKDF2, records the original owner, enforces a file size limit, emits audit logs, supports owner-only decrypt mode, and does not bypass or crack protected third-party scripts.

## Music Notes

The queue, controls, commands, Lavalink adapter, and Spotify metadata behavior are implemented. Spotify links are treated as metadata/search input only; MANOK does not stream Spotify directly. The bundled Docker Compose Lavalink service includes the official YouTube source plugin, because Lavalink's built-in YouTube source is disabled in favor of the maintained plugin.

## Production Checklist

- Enable privileged Discord intents in the developer portal.
- For local development, `OWNER_IDS` is the only security value you must edit. For production, set strong random values for `ENCRYPTION_MASTER_KEY` and `NEXTAUTH_SECRET`.
- Configure anti-nuke thresholds and log channels per guild from the dashboard or `/manok` commands.
- Run the bot and dashboard as separate Railway services for independent scaling.
- Add OAuth session enforcement to dashboard API routes before exposing to guild admins.
