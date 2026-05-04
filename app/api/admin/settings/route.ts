import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("marpo_lotto");
    
    // settings 타입을 any로 지정하여 필드 접근 에러 방지
    let settings: any = await db.collection("system_settings").findOne({ type: "global" });
    
    if (!settings) {
      settings = { type: "global", targetUsd: 5.0, peggedUsd: 38.42 };
      await db.collection("system_settings").insertOne(settings);
    }
    
    // 데이터 추출 시 숫자 타입 보장
    const tUsd = Number(settings.targetUsd || 5.0);
    const pUsd = Number(settings.peggedUsd || 38.42);
    
    // 핵심 로직: 타겟 달러 / 파이 시세 = 결제할 Pi 개수
    const ticketPricePi = Number((tUsd / pUsd).toFixed(4));
    
    return NextResponse.json({ 
      success: true, 
      settings: { 
        type: "global",
        targetUsd: tUsd,
        peggedUsd: pUsd,
        ticketPricePi: ticketPricePi 
      } 
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db("marpo_lotto");
    
    await db.collection("system_settings").updateOne(
      { type: "global" },
      { $set: { 
          targetUsd: Number(body.targetUsd), 
          peggedUsd: Number(body.peggedUsd) 
        } 
      },
      { upsert: true }
    );
    
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message });
  }
}