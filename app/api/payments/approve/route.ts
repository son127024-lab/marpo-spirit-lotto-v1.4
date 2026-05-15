import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { paymentId } = await req.json();
    const piApiKey = process.env.PI_API_KEY?.trim(); 

    if (!piApiKey) {
      return NextResponse.json({ error: "비밀번호(API Key)가 Vercel 금고에 없습니다." }, { status: 400 });
    }

    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${piApiKey}`,
      },
    });

    const text = await response.text(); 
    try {
      const data = JSON.parse(text);
      if (!response.ok) {
        return NextResponse.json({ error: "파이 서버가 승인을 거절함", details: text }, { status: response.status });
      }
      return NextResponse.json(data);
    } catch (e) {
      return NextResponse.json({ error: "파이 서버 응답이 이상함", details: text }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: "Vercel 서버 내부 고장", details: error.message }, { status: 500 });
  }
}