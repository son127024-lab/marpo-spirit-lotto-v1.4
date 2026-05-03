import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

const generateWinningNumbers = () => {
  const getUniqueNumbers = (count: number) => {
    const nums = new Set<number>();
    while (nums.size < count) nums.add(Math.floor(Math.random() * 45) + 1);
    return Array.from(nums).sort((a, b) => a - b);
  };
  return { main: getUniqueNumbers(8), spirit: getUniqueNumbers(2) };
};

export async function POST(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("marpo_lotto");
    const pendingTickets = await db.collection("tickets").find({ status: "COMPLETED" }).toArray();
    if (pendingTickets.length === 0) return NextResponse.json({ success: false, message: "추첨 대기 티켓 없음" });

    const winningNumbers = generateWinningNumbers();
    
    // 🏛️ [신규] 이번 회차 당첨 번호를 역사관(draw_history)에 박제
    await db.collection("draw_history").insertOne({
      drawDate: new Date(),
      numbers: winningNumbers,
      totalTickets: pendingTickets.length
    });

    for (const ticket of pendingTickets) {
      const mainMatches = ticket.selectedNumbers.main.filter((n: number) => winningNumbers.main.includes(n)).length;
      const spiritMatches = ticket.selectedNumbers.spirit.filter((n: number) => winningNumbers.spirit.includes(n)).length;
      let rank = "LOSE", prize = "0", status = "LOSE";

      if (mainMatches === 8) { rank = "1st"; prize = "15420"; status = "WON"; }
      else if (mainMatches === 7 && spiritMatches >= 1) { rank = "2nd"; prize = "5000"; status = "WON"; }
      else if (mainMatches === 6) { rank = "3rd"; prize = "1000"; status = "WON"; }
      else if (mainMatches === 5) { rank = "4th"; prize = "100"; status = "WON"; }
      else if (mainMatches === 4) { rank = "5th"; prize = "3"; status = "WON"; }
      else if (mainMatches === 3) { rank = "6th"; prize = "1"; status = "WON"; }
      else if (mainMatches === 2 && spiritMatches === 2) { rank = "Extra"; prize = "500"; status = "WON"; }

      await db.collection("tickets").updateOne({ _id: ticket._id }, { $set: { status, rank, prize, drawDate: new Date(), winningNumbers } });
    }

    return NextResponse.json({ success: true, winningNumbers });
  } catch (e: any) { return NextResponse.json({ success: false, error: e.message }); }
}