import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("marpo_lotto");
    const history = await db.collection("draw_history").find().sort({ drawDate: -1 }).toArray();
    return NextResponse.json({ success: true, history });
  } catch (e: any) { return NextResponse.json({ success: false }); }
}