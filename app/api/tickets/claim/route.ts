import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb'; // 대표님의 MongoDB 연결 파일
import { ObjectId } from 'mongodb';

export async function POST(req: Request) {
  try {
    // 1. 프론트엔드에서 보낸 수령 신청 데이터 수신
    const body = await req.json();
    const { ticketId, userId, prizeAmount, drawDate } = body;

    // 2. 필수 데이터 누락 체크 (보안)
    if (!ticketId || !userId) {
      return NextResponse.json(
        { success: false, message: "필수 정보가 누락되었습니다." }, 
        { status: 400 }
      );
    }

    // 3. DB 연결
    const client = await clientPromise;
    const db = client.db(); 
    const ticketsCollection = db.collection('tickets');

    // 4. [보안 더블체크] 티켓의 실제 소유자와 당첨 여부 확인
    const ticket = await ticketsCollection.findOne({
      _id: new ObjectId(ticketId),
      userId: userId
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, message: "존재하지 않거나 본인의 티켓이 아닙니다." }, 
        { status: 404 }
      );
    }

    if (ticket.status !== 'WON') {
      return NextResponse.json(
        { success: false, message: "당첨된 티켓만 수령 신청이 가능합니다." }, 
        { status: 400 }
      );
    }

    // 5. DB 상태 업데이트 (WON -> CLAIMED)
    const result = await ticketsCollection.updateOne(
      { _id: new ObjectId(ticketId) },
      { 
        $set: { 
          status: 'CLAIMED',         // 수령 대기 상태로 변경
          claimedAt: new Date(),     // 신청 시간 기록 (관리자 확인용)
          claimAmount: prizeAmount   // 유저가 신청한 금액 기록
        } 
      }
    );

    // 6. 결과 반환
    if (result.modifiedCount === 1) {
      return NextResponse.json({ 
        success: true, 
        message: "수령 신청이 성공적으로 완료되었습니다." 
      });
    } else {
      throw new Error("DB 업데이트 실패");
    }

  } catch (error) {
    console.error("Claim API Error:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다. 다시 시도해주세요." }, 
      { status: 500 }
    );
  }
}