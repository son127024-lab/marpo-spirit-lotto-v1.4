import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("marpo_lotto");
    
    // DB에서 전역 설정값 찾기 (없으면 $5 기준으로 기본값 생성)
    let settings = await db.collection("system_settings").findOne({ type: "global" });
    if (!settings) {
      // 🚨 $5 기준 셋팅: 티켓 기본값을 0.13 Pi로 설정
      settings = { type: "global", ticketPricePi: 0.13, peggedUsd: 38.42 };
      await db.collection("system_settings").insertOne(settings);
    }
    
    return NextResponse.json({ success: true, settings });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db("marpo_lotto");
    
    // 넘어온 값으로 DB 업데이트
    await db.collection("system_settings").updateOne(
      { type: "global" },
      { $set: { ticketPricePi: Number(body.ticketPricePi), peggedUsd: Number(body.peggedUsd) } },
      { upsert: true }
    );
    
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message });
  }
}