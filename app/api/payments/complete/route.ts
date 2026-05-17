import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CompleteBody = {
  paymentId?: string;
  txid?: string;
  tier?: "premium" | "vip";
  amount?: number;
  orderId?: string;
};

export async function POST(req: Request) {
  try {
    let body: CompleteBody;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Request body is not valid JSON",
        },
        { status: 400 }
      );
    }

    const { paymentId, txid, tier, amount, orderId } = body;

    if (!paymentId || typeof paymentId !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Missing paymentId",
        },
        { status: 400 }
      );
    }

    if (!txid || typeof txid !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Missing txid",
        },
        { status: 400 }
      );
    }

    if (tier !== "premium" && tier !== "vip") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid subscription tier",
        },
        { status: 400 }
      );
    }

    const expectedAmount = tier === "premium" ? 1 : 3;

    if (amount !== expectedAmount) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment amount does not match the selected tier",
        },
        { status: 400 }
      );
    }

    const piApiKey = process.env.PI_API_KEY?.trim();

    if (!piApiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing PI_API_KEY environment variable",
        },
        { status: 500 }
      );
    }

    const piResponse = await fetch(
      `https://api.minepi.com/v2/payments/${paymentId}/complete`,
      {
        method: "POST",
        headers: {
          Authorization: `Key ${piApiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ txid }),
        cache: "no-store",
      }
    );

    const piText = await piResponse.text();

    let piData: unknown = null;

    try {
      piData = piText ? JSON.parse(piText) : null;
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: `Pi complete API did not return valid JSON. Status: ${piResponse.status}`,
          details: piText.slice(0, 500),
        },
        { status: 502 }
      );
    }

    if (!piResponse.ok) {
      console.error("Pi payment completion failed:", {
        status: piResponse.status,
        paymentId,
        txid,
        tier,
        amount,
        orderId,
        piData,
      });

      return NextResponse.json(
        {
          success: false,
          error: "Pi payment completion failed",
          status: piResponse.status,
          details: piData,
        },
        { status: piResponse.status }
      );
    }

    const subscriptionPayload = {
      tier,
      paymentId,
      txid,
      amount,
      orderId: orderId ?? null,
      activatedAt: Date.now(),
    };

    const response = NextResponse.json(
      {
        success: true,
        message: "Payment completed successfully",
        paymentId,
        txid,
        tier,
        amount,
        orderId: orderId ?? null,
        pi: piData,
      },
      { status: 200 }
    );

    response.cookies.set(
      "marpo_subscription",
      JSON.stringify(subscriptionPayload),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      }
    );

    return response;
  } catch (error) {
    console.error("Payment complete route error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Payment completion server error",
      },
      { status: 500 }
    );
  }
}