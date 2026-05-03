import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// 🚨 신규 추가: 대표님 전용 비밀 추첨 엔진 (POST)
export async function POST(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("marpo_lotto");

    // 1. 현재 '추첨 대기 중(COMPLETED)'인 모든 티켓을 불러옵니다.
    const pendingTickets = await db.collection("tickets").find({ status: "COMPLETED" }).toArray();

    if (pendingTickets.length === 0) {
      return NextResponse.json({ success: false, message: "대기 중인 티켓이 없습니다." });
    }

    // 2. [관리자 특권] 테스트를 위해 가장 첫 번째(최근) 티켓을 무조건 당첨시킵니다!
    const targetTicket = pendingTickets[0];
    const winMain = targetTicket.selectedNumbers.main;
    const winSpirit = targetTicket.selectedNumbers.spirit;

    // 3. 당첨 및 낙첨 처리 (DB 업데이트)
    for (const ticket of pendingTickets) {
      const isMainMatch = JSON.stringify(ticket.selectedNumbers.main) === JSON.stringify(winMain);
      const isSpiritMatch = JSON.stringify(ticket.selectedNumbers.spirit) === JSON.stringify(winSpirit);

      if (isMainMatch && isSpiritMatch) {
        // 일치하면 WON (당첨) 상태로 변경하고 상금 입력
        await db.collection("tickets").updateOne(
          { _id: ticket._id },
          { $set: { status: "WON", prize: "15,420" } }
        );
      } else {
        // 일치하지 않으면 LOSE (낙첨) 상태로 변경
        await db.collection("tickets").updateOne(
          { _id: ticket._id },
          { $set: { status: "LOSE" } }
        );
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "🎰 [SECRET DRAW] 추첨 완료! 대표님의 티켓이 당첨되었습니다!" 
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}