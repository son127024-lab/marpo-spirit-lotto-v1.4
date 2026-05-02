import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

// 1. 메타데이터 설정: 검색 엔진 최적화(SEO) 및 브랜딩 강화
export const metadata: Metadata = {
  title: "Marpo Spirit Lottoworld",
  description: "Global Jackpot Platform on Pi Network - Empowering the Ecosystem",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        {/* 🚀 파이 네트워크 SDK 최적화 장착 
          strategy="beforeInteractive"를 사용하여 페이지의 자바스크립트가 실행되기 전에 
          SDK를 가장 먼저 로드합니다. 'CONNECTING...' 멈춤 현상을 방지하는 핵심입니다.
        */}
        <Script
          src="https://sdk.minepi.com/pi-sdk.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="antialiased selection:bg-yellow-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}