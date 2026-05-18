import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    success: true,
    app: "MARPO_SPIRIT",
    version: "subscription-auth-fallback-v1",
    buildCheck: "approve-route-405-subscription-fallback",
    nodeEnv: process.env.NODE_ENV,
    sandbox: process.env.NEXT_PUBLIC_PI_SANDBOX ?? null,
    hasPiApiKey: Boolean(process.env.PI_API_KEY),
    hasMongoUri: Boolean(process.env.MONGODB_URI),
    timestamp: new Date().toISOString(),
  });
}