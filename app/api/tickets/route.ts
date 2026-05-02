import { NextResponse, NextRequest } from 'next/server';
import clientPromise from '@/lib/mongodb';

// 🚀 캐시 강제 차단 (항상 최신 데이터 유지)
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { numbers, userId, amount } = body;

    const client = await clientPromise;
    const db = client.db("lottoworld");

    const result = await db.collection("tickets").insertOne({
      userId: userId || "anonymous",
      selectedNumbers: numbers,
      purchaseAmount: amount,
      status: "pending",
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (e) {
    console.error("DB Storage Error:", e);
    return NextResponse.json({ success: false, error: "Storage failure" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID missing" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("lottoworld");

    // 1. 금고에서 내 티켓 꺼내오기 (최신순)
    const tickets = await db.collection("tickets")
      .find({ userId: userId })
      .sort({ createdAt: -1 })
      .toArray();

    // 🚀 [K1 최종 방어막] 몽고DB의 특수 _id를 문자로 변환하여 엔진 폭발 원천 차단!
    const safeTickets = tickets.map(ticket => ({
      ...ticket,
      _id: ticket._id.toString(), 
    }));

    // 2. 안전하게 정제된 진짜 데이터를 화면으로 발사
    return NextResponse.json({ success: true, tickets: safeTickets });

  } catch (e) {
    console.error("DB Fetch Error:", e);
    return NextResponse.json({ success: false, error: "Fetch failure" }, { status: 500 });
  }
}