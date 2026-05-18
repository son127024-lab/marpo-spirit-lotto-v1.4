import { NextResponse } from "next/server";
import { getMarpoDb } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SessionPayload = {
  uid?: string | null;
  username?: string;
  verifiedAt?: number;
};

type CancelBody = {
  username?: string;
  uid?: string | null;
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

function cleanUsername(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const cleaned = value.trim();

  if (!cleaned) return null;
  if (cleaned.length > 80) return null;

  return cleaned;
}

function getActorFromRequest(
  request: Request,
  body?: CancelBody
): SessionPayload | null {
  const session = getSessionFromRequest(request);

  if (session?.username) {
    return session;
  }

  const headerUsername = cleanUsername(request.headers.get("x-pi-username"));
  const bodyUsername = cleanUsername(body?.username);

  const username = headerUsername ?? bodyUsername;

  if (!username) return null;

  return {
    username,
    uid: body?.uid ?? null,
    verifiedAt: Date.now(),
  };
}

export async function POST(request: Request) {
  try {
    let body: CancelBody = {};

    try {
      body = (await request.json()) as CancelBody;
    } catch {
      body = {};
    }

    const actor = getActorFromRequest(request, body);

    if (!actor?.username) {
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
      username: actor.username,
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
        username: actor.username,
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
      username: actor.username,
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