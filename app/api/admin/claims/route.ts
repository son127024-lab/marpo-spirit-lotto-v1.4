// 경로: app/api/admin/claims/route.ts
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb'; // 대표님의 MongoDB 연결 파일 경로

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    // DB에서 상태가 'CLAIMED' (수령 신청됨)인 티켓만 최신순으로 가져옴
    const claims = await db.collection('tickets')
      .find({ status: 'CLAIMED' })
      .sort({ claimedAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, claims });
  } catch (error) {
    console.error("Claims GET Error:", error);
    return NextResponse.json({ success: false, message: "서버 오류" }, { status: 500 });
  }
}