import { connectMongo, getGuildConfig, updateGuildConfig } from "@manok/database";
import { guildConfigSchema } from "@manok/shared";
import { NextResponse, type NextRequest } from "next/server";

async function ensureDb() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not configured.");
  await connectMongo(process.env.MONGODB_URI);
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ guildId: string }> }) {
  await ensureDb();
  const { guildId } = await params;
  return NextResponse.json(await getGuildConfig(guildId));
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ guildId: string }> }) {
  await ensureDb();
  const { guildId } = await params;
  const body = await request.json();
  const parsed = guildConfigSchema.partial().parse({ ...body, guildId });
  return NextResponse.json(await updateGuildConfig(guildId, parsed));
}
