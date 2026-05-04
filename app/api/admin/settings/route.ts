import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("marpo_lotto");
    
    // 1. 설정값 가져오기
    let settings: any = await db.collection("system_settings").findOne({ type: "global" });
    if (!settings) {
      settings = { type: "global", targetUsd: 5.0, peggedUsd: 38.42 };
      await db.collection("system_settings").insertOne(settings);
    }

    // 2. 실제 누적 판매액(Jackpot) 계산
    // tickets 컬렉션에서 모든 티켓의 amount 합산
    const ticketStats = await db.collection("tickets").aggregate([
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
    ]).toArray();

    const realJackpot = ticketStats.length > 0 ? ticketStats[0].totalAmount : 0;
    
    // 3. 티켓 가격 계산 (타겟 달러 / 파이 시세)
    const ticketPricePi = Number((settings.targetUsd / settings.peggedUsd).toFixed(8));
    
    return NextResponse.json({ 
      success: true, 
      settings: { 
        ...settings, 
        ticketPricePi,
        realJackpot: Number(realJackpot.toFixed(4)) // 잭팟은 소수점 4자리까지 표시
      } 
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message });
  }
}