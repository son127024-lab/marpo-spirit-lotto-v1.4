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
    
    // 유저의 티켓을 가져오되, 가장 최근에 산 것이 맨 위로 오게 정렬합니다.
    const tickets = await db.collection("tickets")
      .find({ userId: userId })
      .sort({ createdAt: -1 }) 
      .toArray();

    return NextResponse.json({ success: true, tickets });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}