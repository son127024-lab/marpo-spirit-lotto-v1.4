// app/api/admin/stats/route.ts
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("marpo_lotto");

    // settlements 컬렉션에서 모든 정산 데이터 가져오기
    const stats = await db.collection("settlements").find({}).sort({ drawDate: -1 }).toArray();

    // 총 합계 계산
    const totals = stats.reduce((acc, curr) => ({
      totalSales: acc.totalSales + (curr.totalSales || 0),
      houseEdge: acc.houseEdge + (curr.houseEdge || 0),
      childFund: acc.childFund + (curr.childFund || 0),
    }), { totalSales: 0, houseEdge: 0, childFund: 0 });

    return NextResponse.json({ success: true, stats, totals });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message });
  }
}