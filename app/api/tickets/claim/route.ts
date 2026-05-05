// 경로: app/api/tickets/claim/route.ts
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ticketId, userId } = body;

    if (!ticketId || !userId) {
      return NextResponse.json({ success: false, message: "필수 데이터가 없습니다." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const ticketsCollection = db.collection('tickets');

    // 보안 검증: 본인 티켓이 맞는지, 당첨 상태가 맞는지 확인
    const ticket = await ticketsCollection.findOne({
      _id: new ObjectId(ticketId),
      userId: userId
    });

    if (!ticket) {
      return NextResponse.json({ success: false, message: "티켓을 찾을 수 없습니다." }, { status: 404 });
    }

    if (ticket.status !== 'WON') {
      return NextResponse.json({ success: false, message: "당첨된 티켓이 아닙니다." }, { status: 400 });
    }

    // DB 업데이트: WON -> CLAIMED
    const result = await ticketsCollection.updateOne(
      { _id: new ObjectId(ticketId) },
      { 
        $set: { 
          status: 'CLAIMED', 
          claimedAt: new Date() // 수령 신청 시간 기록
        } 
      }
    );

    if (result.modifiedCount === 1) {
      return NextResponse.json({ success: true, message: "수령 신청 완료" });
    } else {
      throw new Error("DB 업데이트 실패");
    }

  } catch (error) {
    console.error("Claim API Error:", error);
    return NextResponse.json({ success: false, message: "서버 오류" }, { status: 500 });
  }
}