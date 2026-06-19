import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    name: "MANOK Bot 2026",
    bot: "online",
    lavalink: process.env.LAVALINK_HOST ? "configured" : "missing",
    mongo: process.env.MONGODB_URI ? "configured" : "missing",
    redis: process.env.REDIS_URL ? "configured" : "missing",
    timestamp: new Date().toISOString()
  });
}
