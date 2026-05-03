import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// 🎲 1. 공정한 랜덤 번호 추첨기
const generateWinningNumbers = () => {
  const getUniqueNumbers = (count: number) => {
    const nums = new Set<number>();
    while (nums.size < count) nums.add(Math.floor(Math.random() * 45) + 1);
    return Array.from(nums).sort((a, b) => a - b);
  };
  return {
    main: getUniqueNumbers(8),
    spirit: getUniqueNumbers(2)
  };
};

export async function POST(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("marpo_lotto");

    const pendingTickets = await db.collection("tickets").find({ status: "COMPLETED" }).toArray();

    if (pendingTickets.length === 0) {
      return NextResponse.json({ success: false, message: "추첨 대기 중인 티켓이 없습니다." });
    }

    // 🎲 2. 이번 회차 진짜 당첨 번호 뽑기
    const winningNumbers = generateWinningNumbers();
    const winMain = winningNumbers.main;
    const winSpirit = winningNumbers.spirit;

    // 💰 3. 마르포 토크노믹스 풀(Pool) 계산
    const totalTickets = pendingTickets.length;
    const totalPi = totalTickets * 1; // 1장당 1 Pi (테스트용)
    
    // 🏛️ 하우스 에지 (20% 사전 공제)
    const houseEdge = totalPi * 0.20; 
    const childFund = totalPi * 0.05; // 💖 차일드 펀드 적립금 (5%)
    
    // 🎯 잭팟 풀 (80%)
    let jackpotPool = totalPi * 0.80;

    // 🏆 4. 티켓 채점 및 고정 상금 분배
    let winnersCount = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, extra: 0 };
    
    const gradedTickets = pendingTickets.map(ticket => {
      const mainMatches = ticket.selectedNumbers.main.filter((n: number) => winMain.includes(n)).length;
      const spiritMatches = ticket.selectedNumbers.spirit.filter((n: number) => winSpirit.includes(n)).length;
      
      let rank = "LOSE";
      let prizeAmount = 0;

      // 대표님이 설계하신 7단계 당첨 조건 판독기
      if (mainMatches === 8) { rank = "1st"; winnersCount[1]++; }
      else if (mainMatches === 7 && spiritMatches >= 1) { rank = "2nd"; winnersCount[2]++; }
      else if (mainMatches === 6) { rank = "3rd"; winnersCount[3]++; }
      else if (mainMatches === 5) { rank = "4th"; winnersCount[4]++; }
      else if (mainMatches === 4) { 
        rank = "5th"; winnersCount[5]++; 
        jackpotPool -= 3; // 3 Pi 고정 상금 차감
        prizeAmount = 3; 
      }
      else if (mainMatches === 3) { 
        rank = "6th"; winnersCount[6]++; 
        jackpotPool -= 1; // 1 Pi 고정 상금 차감
        prizeAmount = 1; 
      }
      else if (mainMatches === 2 && spiritMatches === 2) { 
        rank = "Extra"; winnersCount.extra++; 
      }

      return { ...ticket, rank, prizeAmount, mainMatches, spiritMatches };
    });

    // 📈 5. 남은 잭팟 풀 비율 분배 계산
    const finalJackpotPool = Math.max(0, jackpotPool); // 마이너스 방지
    const prizePools = {
      1: finalJackpotPool * 0.60,
      2: finalJackpotPool * 0.15,
      3: finalJackpotPool * 0.10,
      4: finalJackpotPool * 0.05,
      extra: finalJackpotPool * 0.10
    };

    // 💾 6. 금고(DB)에 당첨 결과 및 상금 최종 기록
    let totalWinners = 0;
    for (const ticket of gradedTickets) {
      let finalPrize = ticket.prizeAmount;
      let status = "LOSE";

      if (ticket.rank !== "LOSE") {
        status = "WON";
        totalWinners++;
        // 당첨자가 여럿일 경우 비율 상금을 나눠 가집니다 (N빵)
        if (ticket.rank === "1st") finalPrize = prizePools[1] / winnersCount[1];
        if (ticket.rank === "2nd") finalPrize = prizePools[2] / winnersCount[2];
        if (ticket.rank === "3rd") finalPrize = prizePools[3] / winnersCount[3];
        if (ticket.rank === "4th") finalPrize = prizePools[4] / winnersCount[4];
        if (ticket.rank === "Extra") finalPrize = prizePools.extra / winnersCount.extra;
      }

      await db.collection("tickets").updateOne(
        { _id: ticket._id },
        { 
          $set: { 
            status: status, 
            rank: ticket.rank, // 몇 등인지 기록
            prize: finalPrize > 0 ? finalPrize.toFixed(2) : "0", 
            drawDate: new Date(),
            winningNumbers: winningNumbers 
          } 
        }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: `🎰 추첨 완료! 당첨 번호: [${winMain.join(', ')}] + 스피릿 [${winSpirit.join(', ')}]\n총 ${totalWinners}명 당첨!` 
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}