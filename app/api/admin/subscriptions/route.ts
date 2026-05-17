import { NextResponse } from "next/server";
import { getMarpoDb } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: Request) {
  const configuredKey = process.env.ADMIN_MONITOR_KEY?.trim();

  if (!configuredKey) {
    return {
      ok: false,
      status: 500,
      error: "Missing ADMIN_MONITOR_KEY environment variable",
    };
  }

  const providedKey = request.headers.get("x-admin-key")?.trim();

  if (!providedKey || providedKey !== configuredKey) {
    return {
      ok: false,
      status: 401,
      error: "Unauthorized admin monitor request",
    };
  }

  return {
    ok: true,
    status: 200,
    error: null,
  };
}

function sanitizeSubscription(doc: Record<string, unknown>) {
  const { _id, ...rest } = doc;

  return {
    id: String(_id),
    ...rest,
  };
}

export async function GET(request: Request) {
  try {
    const auth = isAuthorized(request);

    if (!auth.ok) {
      return NextResponse.json(
        {
          success: false,
          error: auth.error,
        },
        { status: auth.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const username = searchParams.get("username");

    const filter: Record<string, unknown> = {
      app: "MARPO_SPIRIT",
    };

    if (status && status !== "all") {
      filter.status = status;
    }

    if (username) {
      filter.username = {
        $regex: username,
        $options: "i",
      };
    }

    const db = await getMarpoDb();
    const subscriptions = db.collection("subscriptions");

    const rows = await subscriptions
      .find(filter)
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(100)
      .toArray();

    const counts = await subscriptions
      .aggregate([
        {
          $match: {
            app: "MARPO_SPIRIT",
          },
        },
        {
          $group: {
            _id: "$status",
            count: {
              $sum: 1,
            },
          },
        },
      ])
      .toArray();

    const summary = {
      total: rows.length,
      active: 0,
      cancelled: 0,
      expired: 0,
    };

    for (const item of counts) {
      if (item._id === "active") summary.active = item.count;
      if (item._id === "cancelled") summary.cancelled = item.count;
      if (item._id === "expired") summary.expired = item.count;
    }

    return NextResponse.json({
      success: true,
      summary,
      subscriptions: rows.map((row) =>
        sanitizeSubscription(row as Record<string, unknown>)
      ),
    });
  } catch (error) {
    console.error("Admin subscription monitor GET error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Admin subscription monitor server error",
      },
      { status: 500 }
    );
  }
}
