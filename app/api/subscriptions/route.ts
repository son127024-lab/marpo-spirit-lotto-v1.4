import { NextResponse } from "next/server";
import { getMarpoDb } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SessionPayload = {
  uid?: string | null;
  username?: string;
  verifiedAt?: number;
};

type SubscriptionBody = {
  status?: "active" | "cancelled" | "expired";
  tier?: "premium" | "vip";
  amount?: number;
  paymentId?: string;
  txid?: string;
  orderId?: string | null;
  activatedAt?: number;
  nextBillingAt?: number;
  cancelAtPeriodEnd?: boolean;
};

function getCookieValue(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get("cookie");

  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());

  for (const cookie of cookies) {
    const [key, ...valueParts] = cookie.split("=");

    if (key === name) {
      return decodeURIComponent(valueParts.join("="));
    }
  }

  return null;
}

function getSessionFromRequest(request: Request): SessionPayload | null {
  const sessionCookie = getCookieValue(request, "marpo_pi_session");

  if (!sessionCookie) return null;

  try {
    const json = Buffer.from(sessionCookie, "base64url").toString("utf8");
    const session = JSON.parse(json) as SessionPayload;

    if (!session?.username) return null;

    return session;
  } catch {
    return null;
  }
}

function isValidSubscriptionBody(body: SubscriptionBody) {
  if (body.status !== "active" && body.status !== "cancelled" && body.status !== "expired") {
    return false;
  }

  if (body.tier !== "premium" && body.tier !== "vip") {
    return false;
  }

  const expectedAmount = body.tier === "premium" ? 1 : 3;

  if (body.amount !== expectedAmount) {
    return false;
  }

  if (!body.activatedAt || typeof body.activatedAt !== "number") {
    return false;
  }

  if (!body.nextBillingAt || typeof body.nextBillingAt !== "number") {
    return false;
  }

  return true;
}

export async function GET(request: Request) {
  try {
    const session = getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized Pi session",
        },
        { status: 401 }
      );
    }

    const db = await getMarpoDb();
    const subscriptions = db.collection("subscriptions");

    const existing = await subscriptions.findOne({
      app: "MARPO_SPIRIT",
      username: session.username,
    });

    if (!existing) {
      return NextResponse.json({
        success: true,
        subscription: null,
      });
    }

    if (
      existing.status === "active" &&
      typeof existing.nextBillingAt === "number" &&
      Date.now() > existing.nextBillingAt
    ) {
      await subscriptions.updateOne(
        {
          _id: existing._id,
        },
        {
          $set: {
            status: "expired",
            updatedAt: Date.now(),
          },
        }
      );

      return NextResponse.json({
        success: true,
        subscription: {
          ...existing,
          status: "expired",
        },
      });
    }

    return NextResponse.json({
      success: true,
      subscription: existing,
    });
  } catch (error) {
    console.error("Subscription GET error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Subscription server error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized Pi session",
        },
        { status: 401 }
      );
    }

    let body: SubscriptionBody;

    try {
      body = (await request.json()) as SubscriptionBody;
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Request body is not valid JSON",
        },
        { status: 400 }
      );
    }

    if (!isValidSubscriptionBody(body)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid subscription payload",
        },
        { status: 400 }
      );
    }

    const db = await getMarpoDb();
    const subscriptions = db.collection("subscriptions");

    const now = Date.now();

    const subscriptionDoc = {
      app: "MARPO_SPIRIT",
      uid: session.uid ?? null,
      username: session.username,
      status: body.status,
      tier: body.tier,
      amount: body.amount,
      paymentId: body.paymentId ?? null,
      txid: body.txid ?? null,
      orderId: body.orderId ?? null,
      activatedAt: body.activatedAt,
      nextBillingAt: body.nextBillingAt,
      cancelAtPeriodEnd: body.cancelAtPeriodEnd ?? false,
      updatedAt: now,
    };

    await subscriptions.updateOne(
      {
        app: "MARPO_SPIRIT",
        username: session.username,
      },
      {
        $set: subscriptionDoc,
        $setOnInsert: {
          createdAt: now,
        },
      },
      {
        upsert: true,
      }
    );

    const saved = await subscriptions.findOne({
      app: "MARPO_SPIRIT",
      username: session.username,
    });

    return NextResponse.json({
      success: true,
      subscription: saved,
    });
  } catch (error) {
    console.error("Subscription POST error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Subscription save server error",
      },
      { status: 500 }
    );
  }
}