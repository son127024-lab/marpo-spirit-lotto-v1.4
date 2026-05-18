import { NextResponse } from "next/server";
import { getMarpoDb } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type EnergyBody = {
  username?: string;
  uid?: string | null;
  action?: "daily_claim";
};

type EnergyProfile = {
  app: "MARPO_SPIRIT";
  username: string;
  uid: string | null;
  energy: number;
  spiritPoints: number;
  lastDailyClaimAt: number | null;
  createdAt: number;
  updatedAt: number;
};

function cleanUsername(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const cleaned = value.trim();

  if (!cleaned) return null;
  if (cleaned.length > 80) return null;

  return cleaned;
}

function getTodayKey(timestamp = Date.now()) {
  const date = new Date(timestamp);
  return `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`;
}

function isSameUtcDay(a?: number | null, b = Date.now()) {
  if (!a) return false;
  return getTodayKey(a) === getTodayKey(b);
}

async function getSubscriptionTier(username: string) {
  const db = await getMarpoDb();
  const subscriptions = db.collection("subscriptions");

  const subscription = await subscriptions.findOne({
    app: "MARPO_SPIRIT",
    username,
    status: "active",
  });

  if (subscription?.tier === "vip") return "vip";
  if (subscription?.tier === "premium") return "premium";

  return "basic";
}

function getDailyEnergyByTier(tier: "basic" | "premium" | "vip") {
  if (tier === "vip") return 10;
  if (tier === "premium") return 5;
  return 1;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = cleanUsername(searchParams.get("username"));

    if (!username) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing username",
        },
        { status: 400 }
      );
    }

    const db = await getMarpoDb();
    const energyProfiles = db.collection<EnergyProfile>("energy_profiles");

    const existing = await energyProfiles.findOne({
      app: "MARPO_SPIRIT",
      username,
    });

    const tier = await getSubscriptionTier(username);

    return NextResponse.json({
      success: true,
      tier,
      dailyEnergy: getDailyEnergyByTier(tier),
      profile: existing ?? {
        app: "MARPO_SPIRIT",
        username,
        uid: null,
        energy: 0,
        spiritPoints: 0,
        lastDailyClaimAt: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    });
  } catch (error) {
    console.error("Energy GET error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Energy server error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    let body: EnergyBody;

    try {
      body = (await request.json()) as EnergyBody;
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Request body is not valid JSON",
        },
        { status: 400 }
      );
    }

    const username = cleanUsername(body.username);

    if (!username) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing username",
        },
        { status: 400 }
      );
    }

    if (body.action !== "daily_claim") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid energy action",
        },
        { status: 400 }
      );
    }

    const db = await getMarpoDb();
    const energyProfiles = db.collection<EnergyProfile>("energy_profiles");

    const now = Date.now();
    const tier = await getSubscriptionTier(username);
    const dailyEnergy = getDailyEnergyByTier(tier);

    const existing = await energyProfiles.findOne({
      app: "MARPO_SPIRIT",
      username,
    });

    if (existing?.lastDailyClaimAt && isSameUtcDay(existing.lastDailyClaimAt)) {
      return NextResponse.json({
        success: true,
        alreadyClaimed: true,
        tier,
        dailyEnergy,
        profile: existing,
        message: "Daily Energy already claimed today",
      });
    }

    await energyProfiles.updateOne(
      {
        app: "MARPO_SPIRIT",
        username,
      },
      {
        $inc: {
          energy: dailyEnergy,
          spiritPoints: dailyEnergy,
        },
        $set: {
          uid: body.uid ?? existing?.uid ?? null,
          lastDailyClaimAt: now,
          updatedAt: now,
        },
        $setOnInsert: {
          app: "MARPO_SPIRIT",
          username,
          createdAt: now,
        },
      },
      {
        upsert: true,
      }
    );

    const updated = await energyProfiles.findOne({
      app: "MARPO_SPIRIT",
      username,
    });

    return NextResponse.json({
      success: true,
      alreadyClaimed: false,
      tier,
      dailyEnergy,
      profile: updated,
      message: "Daily Energy claimed successfully",
    });
  } catch (error) {
    console.error("Energy POST error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Energy claim server error",
      },
      { status: 500 }
    );
  }
}