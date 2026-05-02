import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { paymentId } = await request.json();
  // 여기서 원래 파이 개발자 포털의 API Key로 승인 요청을 보내야 합니다.
  // 우선은 '승인' 신호만 보내도록 설정합니다.
  return NextResponse.json({ message: "Payment Approved", paymentId });
}