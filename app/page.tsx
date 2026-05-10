"use client";
import React, { useState, useEffect } from 'react';
import IntroductionPage from '@/components/introduction-page';
import SubscriptionModal from '@/components/subscription-modal';
import MarpoSpiritPage from '@/components/marpo-spirit-page';

export default function Home() {
  // view: 'intro' | 'subscription' | 'dashboard'
  const [view, setView] = useState<'intro' | 'subscription' | 'dashboard'>('intro');
  const [lang, setLang] = useState('ko');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 이미 구독한 유저인지 체크
    const savedTier = localStorage.getItem('marpo_tier');
    
    // 로고 화면을 무조건 보여주기 위해 초기 view는 'intro'로 유지합니다.
    // 만약 이미 로그인된 유저가 인트로를 건너뛰게 하고 싶다면 아래 주석을 푸세요.
    /*
    if (savedTier) {
      setView('dashboard');
    }
    */
    setIsReady(true);
  }, []);

  const handleStartSession = () => {
    // 인트로 동의 후 -> 구독 페이지로 이동
    const savedTier = localStorage.getItem('marpo_tier');
    if (savedTier) {
      setView('dashboard');
    } else {
      setView('subscription');
    }
  };

  const handleTierSelect = (tier: string) => {
    // 구독 선택 후 -> 대시보드로 이동
    localStorage.setItem('marpo_tier', tier);
    setView('dashboard');
  };

  if (!isReady) return null;

  return (
    <main className="bg-[#050505] min-h-screen">
      {view === 'intro' && (
        <IntroductionPage 
          onStartSession={handleStartSession} 
          currentLang={lang} 
          setLang={setLang} 
        />
      )}
      
      {view === 'subscription' && (
        <SubscriptionModal onSelect={handleTierSelect} />
      )}
      
      {view === 'dashboard' && (
        <MarpoSpiritPage lang={lang} />
      )}
    </main>
  );
}