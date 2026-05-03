import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { paymentId, txid } = await req.json();
    const piApiKey = process.env.PI_API_KEY;

    // 파이 서버에 "블록체인 기록 확인했어, 완료 처리해!" 라고 대답하는 로직
    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${piApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ txid }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "완료 처리 실패" }, { status: 500 });
  }
}