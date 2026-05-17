import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ApproveBody = {
  paymentId?: string;
  tier?: "premium" | "vip";
  amount?: number;
  orderId?: string;
};

export async function POST(req: Request) {
  try {
    let body: ApproveBody;

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

    const { paymentId, tier, amount, orderId } = body;

    if (!paymentId || typeof paymentId !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Missing paymentId",
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
      `https://api.minepi.com/v2/payments/${paymentId}/approve`,
      {
        method: "POST",
        headers: {
          Authorization: `Key ${piApiKey}`,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    const piText = await piResponse.text();

    let piData: unknown;

    try {
      piData = JSON.parse(piText);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: `Pi approve API did not return valid JSON. Status: ${piResponse.status}`,
          details: piText.slice(0, 300),
        },
        { status: 502 }
      );
    }

    if (!piResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: "Pi payment approval failed",
          details: piData,
        },
        { status: piResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      paymentId,
      tier,
      amount,
      orderId: orderId ?? null,
      pi: piData,
    });
  } catch (error) {
    console.error("Payment approve route error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Payment approval server error",
      },
      { status: 500 }
    );
  }
}