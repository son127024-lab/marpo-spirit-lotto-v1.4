import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req: Request) {
  try {
    const { ticketId } = await req.json();
    const client = await clientPromise;
    const db = client.db("marpo_lotto");

    // 1. 해당 티켓이 진짜 당첨된 티켓인지, 그리고 수령 기한(1년) 내인지 확인
    const ticket = await db.collection("tickets").findOne({ _id: new ObjectId(ticketId) });

    if (!ticket || ticket.status !== "WON") {
      return NextResponse.json({ success: false, message: "수령 가능한 티켓이 아닙니다." });
    }

    const drawDate = new Date(ticket.drawDate);
    const oneYearLater = new Date(drawDate);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

    if (new Date() > oneYearLater) {
      return NextResponse.json({ success: false, message: "지급 기한(1년)이 만료된 티켓입니다." });
    }

    // 2. 상태를 'CLAIMED(수령 완료)'로 변경
    await db.collection("tickets").updateOne(
      { _id: new ObjectId(ticketId) },
      { $set: { status: "CLAIMED", claimedAt: new Date() } }
    );

    return NextResponse.json({ success: true, message: "🎉 수령 프로세스가 시작되었습니다! 지갑을 확인해 주세요." });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}