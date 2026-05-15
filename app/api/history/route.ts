import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const history = await db.collection('draw_history').find({}).sort({ _id: -1 }).toArray();
    return NextResponse.json({ success: true, history });
  } catch (error) {
    console.error("History GET Error:", error);
    return NextResponse.json({ success: false, message: "서버 오류" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { draw, date, numbers, spirit, first, second, third } = body;

    if (!draw || !numbers || !first) {
      return NextResponse.json({ success: false, message: "필수 데이터 누락" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    
    // DB에 저장
    await db.collection('draw_history').insertOne({
      draw, date, numbers, spirit, first, second, third,
      createdAt: new Date()
    });

    return NextResponse.json({ success: true, message: "당첨 내역이 공식 등록되었습니다." });
  } catch (error) {
    console.error("History POST Error:", error);
    return NextResponse.json({ success: false, message: "저장 실패" }, { status: 500 });
  }
}