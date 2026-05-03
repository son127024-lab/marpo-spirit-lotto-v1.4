import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("marpo_lotto");

    // 1. 현재 '추첨 대기 중(COMPLETED)'인 모든 티켓을 불러옵니다.
    const pendingTickets = await db.collection("tickets").find({ status: "COMPLETED" }).toArray();

    if (pendingTickets.length === 0) {
      return NextResponse.json({ success: false, message: "추첨 대기 중인 티켓이 없습니다." });
    }

    // 2. [대표님 전용 테스트 모드] 대기 중인 티켓 중 첫 번째 것을 무조건 1등으로 만듭니다!
    const targetTicket = pendingTickets[0];
    const winMain = targetTicket.selectedNumbers.main;
    const winSpirit = targetTicket.selectedNumbers.spirit;

    // 3. 금고(DB) 안의 티켓들을 당첨/낙첨으로 업데이트합니다.
    let winCount = 0;
    for (const ticket of pendingTickets) {
      const isMainMatch = JSON.stringify(ticket.selectedNumbers.main) === JSON.stringify(winMain);
      const isSpiritMatch = JSON.stringify(ticket.selectedNumbers.spirit) === JSON.stringify(winSpirit);

      if (isMainMatch && isSpiritMatch) {
        await db.collection("tickets").updateOne(
          { _id: ticket._id },
          { $set: { status: "WON", prize: "15,420" } }
        );
        winCount++;
      } else {
        await db.collection("tickets").updateOne(
          { _id: ticket._id },
          { $set: { status: "LOSE" } }
        );
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `🎰 추첨 완료! ${winCount}장의 티켓이 잭팟에 당첨되었습니다!` 
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}