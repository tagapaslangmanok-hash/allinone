import "dotenv/config";

const required = {
  DISCORD_TOKEN: "Discord Developer Portal > Bot > Token",
  DISCORD_CLIENT_ID: "Discord Developer Portal > OAuth2 > Client ID",
  DISCORD_GUILD_ID: "Right click your test server > Copy Server ID",
  OWNER_IDS: "Right click your Discord profile > Copy User ID"
};

const missing = Object.entries(required).filter(([key]) => {
  const value = process.env[key];
  return !value || value.startsWith("PASTE_") || value.startsWith("your_");
});

if (missing.length) {
  console.log("MANOK .env is not ready yet.\n");
  for (const [key, hint] of missing) {
    console.log(`- ${key}: ${hint}`);
  }
  console.log("\nEnable Developer Mode in Discord to copy server/user IDs.");
  process.exit(1);
}

console.log("MANOK .env looks ready for Discord testing.");
