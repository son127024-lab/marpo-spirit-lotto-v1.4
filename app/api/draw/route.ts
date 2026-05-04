import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST() {
  try {
    const client = await clientPromise;
    const db = client.db("marpo_lotto");

    // 1. 미추첨 티켓(COMPLETED) 전수 조사 및 총 매출 계산
    const pendingTickets = await db.collection("tickets").find({ status: "COMPLETED" }).toArray();
    const totalSales = pendingTickets.length; // 티켓당 1 Pi 기준

    if (totalSales === 0) {
      return NextResponse.json({ success: false, message: "No pending tickets to draw." });
    }

    // 2. 당첨 번호 생성 (8/45 + 2/45)
    const generateNumbers = (count: number, max: number) => {
      const nums = new Set<number>();
      while (nums.size < count) nums.add(Math.floor(Math.random() * max) + 1);
      return Array.from(nums).sort((a, b) => a - b);
    };
    const winningMain = generateNumbers(8, 45);
    const winningSpirit = generateNumbers(2, 45);
    const drawDate = new Date();

    // 3. [비즈니스 핵심] 수익 및 기부금 자동 정산 (백서 기준)
    const houseEdge = totalSales * 0.08;   // 경영진 수익 8%
    const childFund = totalSales * 0.05;   // 차일드 펀드 기부금 5%
    const netJackpotPool = totalSales - houseEdge - childFund; // 실질 당첨금 풀

    // 4. 정산 내역 장부(Settlement) 기록
    await db.collection("settlements").insertOne({
      drawDate,
      totalSales,
      houseEdge,
      childFund,
      netJackpotPool,
      status: "CALCULATED"
    });

    // 5. 티켓별 당첨 대조 및 상태 업데이트
    for (const ticket of pendingTickets) {
      const matchMain = ticket.selectedNumbers.main.filter((n: number) => winningMain.includes(n)).length;
      const matchSpirit = ticket.selectedNumbers.spirit.filter((n: number) => winningSpirit.includes(n)).length;

      let status = "LOSE";
      let rank = "";
      let prize = 0;

      if (matchMain === 8 && matchSpirit === 2) { status = "WON"; rank = "1st"; prize = 10000; }
      else if (matchMain === 8 && matchSpirit === 1) { status = "WON"; rank = "2nd"; prize = 5000; }
      else if (matchMain === 8) { status = "WON"; rank = "3rd"; prize = 1000; }
      else if (matchMain === 7) { status = "WON"; rank = "4th"; prize = 100; }
      else if (matchMain === 6) { status = "WON"; rank = "5th"; prize = 10; }
      else if (matchMain === 5) { status = "WON"; rank = "6th"; prize = 2; }
      else if (matchSpirit === 2) { status = "WON"; rank = "Extra"; prize = 1; }

      await db.collection("tickets").updateOne(
        { _id: ticket._id },
        { $set: { status, rank, prize, drawDate } }
      );
    }

    // 6. 이번 회차 당첨 히스토리 기록
    await db.collection("draw_history").insertOne({
      drawDate,
      numbers: { main: winningMain, spirit: winningSpirit },
      stats: { totalSales, houseEdge, childFund }
    });

    return NextResponse.json({ 
      success: true, 
      winningNumbers: { main: winningMain, spirit: winningSpirit },
      settlement: { houseEdge, childFund, netJackpotPool }
    });

  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}