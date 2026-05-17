import { NextResponse } from "next/server";
import { getMarpoDb } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SessionPayload = {
  uid?: string | null;
  username?: string;
  verifiedAt?: number;
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

    const db = await getMarpoDb();
    const subscriptions = db.collection("subscriptions");

    const current = await subscriptions.findOne({
      app: "MARPO_SPIRIT",
      username: session.username,
    });

    if (!current) {
      return NextResponse.json(
        {
          success: false,
          error: "No subscription found",
        },
        { status: 404 }
      );
    }

    const now = Date.now();

    await subscriptions.updateOne(
      {
        app: "MARPO_SPIRIT",
        username: session.username,
      },
      {
        $set: {
          status: "cancelled",
          cancelAtPeriodEnd: true,
          cancelledAt: now,
          updatedAt: now,
        },
      }
    );

    const updated = await subscriptions.findOne({
      app: "MARPO_SPIRIT",
      username: session.username,
    });

    return NextResponse.json({
      success: true,
      subscription: updated,
    });
  } catch (error) {
    console.error("Subscription cancel error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Subscription cancel server error",
      },
      { status: 500 }
    );
  }
}