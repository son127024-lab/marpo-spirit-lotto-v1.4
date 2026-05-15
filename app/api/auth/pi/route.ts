import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PiMeResponse = {
  user?: {
    uid?: string;
    username?: string;
  };
  uid?: string;
  username?: string;
};

export async function POST(request: NextRequest) {
  try {
    let body: { accessToken?: string };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Request body is not valid JSON",
        },
        { status: 400 }
      );
    }

    const accessToken = body.accessToken;

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
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const piText = await piResponse.text();

    let piUser: PiMeResponse;

    try {
      piUser = JSON.parse(piText) as PiMeResponse;
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: `Pi API did not return valid JSON. Status: ${piResponse.status}`,
        },
        { status: 502 }
      );
    }

    if (!piResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid Pi access token",
        },
        { status: 401 }
      );
    }

    const uid = piUser.user?.uid ?? piUser.uid ?? null;
    const username = piUser.user?.username ?? piUser.username ?? null;

    if (!username) {
      return NextResponse.json(
        {
          success: false,
          error: "Pi user verification failed",
        },
        { status: 401 }
      );
    }

    const sessionPayload = {
      uid,
      username,
      verifiedAt: Date.now(),
    };

    const response = NextResponse.json({
      success: true,
      user: {
        uid,
        username,
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
  } catch (error) {
    console.error("Pi auth route error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Pi authentication server error",
      },
      { status: 500 }
    );
  }
}