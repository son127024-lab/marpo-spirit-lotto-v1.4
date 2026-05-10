"use client";
import React, { useState } from 'react';
import IntroductionPage from "../components/introduction-page";
import MarpoSpiritPage from "../components/marpo-spirit-page";

export default function Home() {
  const [hasEntered, setHasEntered] = useState(false);

  // 인트로 통과 시 실행되는 함수
  const handleEntry = () => {
    // 1. 여기서 실제 광고 호출 코드를 넣을 수 있습니다.
    console.log("세션 진입: 광고 최적화 완료");
    setHasEntered(true);
  };

  return (
    <>
      {hasEntered ? (
        // 인트로 통과 후: 정화된 메인 대시보드 노출
        <MarpoSpiritPage />
      ) : (
        // 첫 접속 시: 전문 인트로 페이지 노출 (기존 공지 팝업 대체)
        <IntroductionPage onStartSession={handleEntry} />
      )}
    </>
  );
}