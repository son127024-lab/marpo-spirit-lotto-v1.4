import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type PiMeResponse = {
  uid?: string;
  username?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const accessToken = body?.accessToken;

    if (!accessToken || typeof accessToken !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Missing access token",
        },
        { status: 400 }
      );
    }

    const piResponse = await fetch("https://api.minepi.com/v2/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!piResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid Pi access token",
        },
        { status: 401 }
      );
    }

    const piUser = (await piResponse.json()) as PiMeResponse;

    if (!piUser?.username) {
      return NextResponse.json(
        {
          success: false,
          error: "Pi user verification failed",
        },
        { status: 401 }
      );
    }

    const sessionPayload = {
      uid: piUser.uid ?? null,
      username: piUser.username,
      verifiedAt: Date.now(),
    };

    const response = NextResponse.json({
      success: true,
      user: {
        uid: piUser.uid ?? null,
        username: piUser.username,
      },
    });

    response.cookies.set(
      "marpo_pi_session",
      Buffer.from(JSON.stringify(sessionPayload)).toString("base64url"),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      }
    );

    return response;
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Pi authentication server error",
      },
      { status: 500 }
    );
  }
}