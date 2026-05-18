import { NextResponse } from "next/server";
import { getMarpoDb } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getMarpoDb();

    await db.command({ ping: 1 });

    return NextResponse.json({
      success: true,
      message: "MongoDB connection OK",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("MongoDB debug ping failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "MongoDB connection failed",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}