import { NextResponse } from "next/server";
import { getMarpoDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SubscriptionStatus = "active" | "cancelled" | "expired";

type SubscriptionQuery = {
  app: string;
  status?: SubscriptionStatus;
  username?: {
    $regex: string;
    $options: string;
  };
};

function cleanText(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const cleaned = value.trim();

  if (!cleaned) return null;
  if (cleaned.length > 100) return null;

  return cleaned;
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function serializeSubscription(item: Record<string, unknown>) {
  const id =
    item._id instanceof ObjectId
      ? item._id.toString()
      : typeof item._id === "string"
        ? item._id
        : undefined;

  return {
    id,
    username: typeof item.username === "string" ? item.username : undefined,
    uid: typeof item.uid === "string" ? item.uid : null,
    status: item.status,
    tier: item.tier,
    amount: item.amount,
    paymentId: typeof item.paymentId === "string" ? item.paymentId : null,
    txid: typeof item.txid === "string" ? item.txid : null,
    orderId: typeof item.orderId === "string" ? item.orderId : null,
    activatedAt: item.activatedAt,
    nextBillingAt: item.nextBillingAt,
    cancelAtPeriodEnd: item.cancelAtPeriodEnd,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export async function GET(request: Request) {
  try {
    const adminMonitorKey = process.env.ADMIN_MONITOR_KEY?.trim();
    const providedKey = request.headers.get("x-admin-key")?.trim();

    if (!adminMonitorKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing ADMIN_MONITOR_KEY environment variable",
        },
        { status: 500 }
      );
    }

    if (!providedKey || providedKey !== adminMonitorKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized admin monitor key",
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    const statusParam = cleanText(searchParams.get("status"));
    const usernameParam = cleanText(searchParams.get("username"));

    const query: SubscriptionQuery = {
      app: "MARPO_SPIRIT",
    };

    if (
      statusParam === "active" ||
      statusParam === "cancelled" ||
      statusParam === "expired"
    ) {
      query.status = statusParam;
    }

    if (usernameParam) {
      query.username = {
        $regex: escapeRegex(usernameParam),
        $options: "i",
      };
    }

    const db = await getMarpoDb();
    const subscriptions = db.collection("subscriptions");

    const records = await subscriptions
      .find(query)
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(100)
      .toArray();

    const [total, active, cancelled, expired] = await Promise.all([
      subscriptions.countDocuments({ app: "MARPO_SPIRIT" }),
      subscriptions.countDocuments({
        app: "MARPO_SPIRIT",
        status: "active",
      }),
      subscriptions.countDocuments({
        app: "MARPO_SPIRIT",
        status: "cancelled",
      }),
      subscriptions.countDocuments({
        app: "MARPO_SPIRIT",
        status: "expired",
      }),
    ]);

    return NextResponse.json({
      success: true,
      summary: {
        total,
        active,
        cancelled,
        expired,
      },
      subscriptions: records.map((item) =>
        serializeSubscription(item as Record<string, unknown>)
      ),
    });
  } catch (error) {
    console.error("Admin subscriptions GET error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Admin subscription monitor server error",
      },
      { status: 500 }
    );
  }
}