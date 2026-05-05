import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

// 1. 정보를 가져올 때 (자동 회차 체크 로직 포함)
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    let settings = await db.collection('settings').findOne({ id: 'oracle' });

    if (!settings) {
      // 초기 데이터가 아예 없을 경우 기본값 생성
      const defaultSettings = {
        id: 'oracle',
        ticketPricePi: "1.0",
        peggedUsd: "314159",
        realJackpot: 0,
        currentRound: "1",
        nextDrawDate: new Date().toISOString()
      };
      return NextResponse.json({ success: true, settings: defaultSettings });
    }

    // 🚩 [자동 회차 업데이트 체크]
    const now = new Date();
    const nextDraw = new Date(settings.nextDrawDate);

    if (now >= nextDraw) {
      const newRound = (parseInt(settings.currentRound) + 1).toString();
      const newDrawDate = new Date(nextDraw);
      newDrawDate.setDate(newDrawDate.getDate() + 7); // 7일 뒤로 자동 연장

      await db.collection('settings').updateOne(
        { id: 'oracle' },
        { $set: { 
            currentRound: newRound, 
            nextDrawDate: newDrawDate.toISOString(),
            updatedAt: new Date()
        }}
      );
      // 리턴할 데이터 최신화
      settings.currentRound = newRound;
      settings.nextDrawDate = newDrawDate.toISOString();
    }

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

// 2. 대표님이 수동으로 리셋/수정할 때
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ticketPricePi, peggedUsd, realJackpot, currentRound, nextDrawDate } = body;

    const client = await clientPromise;
    const db = client.db();
    
    // 대표님이 입력한 값(예: 1회)으로 즉시 강제 업데이트
    await db.collection('settings').updateOne(
      { id: 'oracle' },
      { $set: { 
        ticketPricePi, 
        peggedUsd, 
        realJackpot: Number(realJackpot), 
        currentRound: currentRound.toString(), // ◀ 대표님의 명령이 우선순위
        nextDrawDate, 
        updatedAt: new Date() 
      } },
      { upsert: true }
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}