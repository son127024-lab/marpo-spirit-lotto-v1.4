import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// 1. 티켓 조회 담당 (GET) - 대표님이 하단에서 목록을 볼 때 사용
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ success: false, error: "유저 아이디가 없습니다." }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("marpo_lotto");
    
    // 유저의 티켓을 최신순으로 가져옵니다.
    const tickets = await db.collection("tickets")
      .find({ userId: userId })
      .sort({ createdAt: -1 }) 
      .toArray();

    return NextResponse.json({ success: true, tickets });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

// 2. 티켓 저장 담당 (POST) - 결제 성공 후 번호를 DB에 저장할 때 사용 (🚨복구된 핵심 엔진!)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { numbers, userId, amount, transactionId } = body;

    // 데이터가 다 있는지 더블체크
    if (!userId || !numbers || !numbers.main || !numbers.spirit) {
      return NextResponse.json({ success: false, error: "필수 데이터가 누락되었습니다." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("marpo_lotto");

    // 금고에 넣을 티켓 문서 만들기
    const newTicket = {
      userId: userId,
      selectedNumbers: numbers,
      amount: amount || 1,
      transactionId: transactionId || "pending",
      status: "COMPLETED", // 기본 상태: 추첨 대기
      createdAt: new Date(),
    };

    // DB에 밀어 넣기
    const result = await db.collection("tickets").insertOne(newTicket);

    if (result.acknowledged) {
      return NextResponse.json({ success: true, ticketId: result.insertedId });
    } else {
      throw new Error("DB 저장 실패");
    }
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}