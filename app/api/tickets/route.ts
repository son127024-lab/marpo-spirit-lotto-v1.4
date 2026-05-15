import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ success: false, error: "유저 아이디가 없습니다." }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("marpo_lotto");
    
    const tickets = await db.collection("tickets")
      .find({ userId: userId })
      .sort({ createdAt: -1 }) 
      .toArray();

    return NextResponse.json({ success: true, tickets });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { numbers, userId, amount, transactionId } = body;
    if (!userId || !numbers || !numbers.main || !numbers.spirit) {
      return NextResponse.json({ success: false, error: "필수 데이터가 누락되었습니다." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("marpo_lotto");

    const newTicket = {
      userId: userId,
      selectedNumbers: numbers,
      amount: amount || 1,
      transactionId: transactionId || "pending",
      status: "COMPLETED", 
      createdAt: new Date(),
    };

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