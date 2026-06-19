# MANOK Bot 2026 Railway Setup

This setup keeps the public dashboard as **to be updated soon** and deploys the working Discord bot plus Lavalink.

## Services

Create these Railway services:

1. **manok-bot**
   - Root repo service.
   - Uses root `Dockerfile`.
   - Start command is already `npm run start`, which runs the bot.

2. **manok-lavalink**
   - Create another service from the same repo.
   - Set Dockerfile path to `infra/lavalink/Dockerfile`.
   - This exposes Lavalink on port `2333`.

3. **MongoDB**
   - Use Railway MongoDB plugin or MongoDB Atlas.

4. **Redis**
   - Use Railway Redis plugin.

## Bot Variables

Set these in the `manok-bot` service:

```env
DISCORD_TOKEN=your_discord_bot_token
DISCORD_CLIENT_ID=your_discord_application_client_id
DISCORD_GUILD_ID=optional_test_guild_id
MONGODB_URI=your_mongodb_uri
REDIS_URL=your_redis_url
OWNER_IDS=your_discord_user_id
```

For Railway Lavalink, also set:

```env
LAVALINK_HOST=your_lavalink_private_domain_or_host
LAVALINK_PORT=2333
LAVALINK_PASSWORD=youshallnotpass
LAVALINK_SECURE=false
```

Optional production security:

```env
ENCRYPTION_MASTER_KEY=64_random_hex_characters
STAFF_LOG_WEBHOOK_URL=your_staff_log_webhook
```

## Register Commands

After variables are set, run this once from Railway shell or locally using the same env:

```bash
npm run register:commands
```

If `DISCORD_GUILD_ID` is set, commands update instantly in that server. If it is not set, global Discord commands can take time to appear.

## Working Bot Functions

- `/manok help` premium embed menu, dropdown, buttons
- `/manok play`, `skip`, `pause`, `resume`, `queue`, `stop`, `volume`, `nowplaying`, `loop`, `shuffle`
- Music buttons: pause/resume, skip, stop
- `/manok encrypt`, `decrypt`, `hash`, `compare`, `scan`
- `/manok security`, `whitelist`, `logs`
- `/manok ticket`
- `/manok verify role:@Role`, then `/manok verify`
- `/manok welcome enabled:true channel:#welcome leave_channel:#logs`
- `/manok embed`
- `/manok giveaway prize:"Nitro" minutes:10 winners:1`
- `/manok suggest`
- `/manok backup`
- `/manok dashboard` returns "to be updated soon"

## Notes

- Keep Lavalink password as `youshallnotpass` unless you also change `LAVALINK_PASSWORD` in the bot service.
- The public web dashboard is intentionally not exposed yet.
- The bot needs Discord privileged intents enabled in the Discord Developer Portal.
