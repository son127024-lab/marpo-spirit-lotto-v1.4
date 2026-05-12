"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image'; // 🚩 이미지 컴포넌트 추가
import MarpoSpiritPage from '../components/marpo-spirit-page'; 

export default function MainGameLobby() {
  const [isReady, setIsReady] = useState(false);
  const [view, setView] = useState<'intro' | 'subscription' | 'dashboard'>('intro');
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  if (!isReady) return null;

  // 🏁 1단계: 인트로 (회사 로고 및 토크노믹스 동의)
  if (view === 'intro') {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `radial-gradient(#f39c12 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>
        
        <div className="relative z-10 w-full max-w-4xl flex flex-col items-center gap-6 bg-black/60 p-10 rounded-[3rem] border border-zinc-800 backdrop-blur-md shadow-2xl">
          
          {/* 🚩 웅장한 회사 로고 최상단 배치 */}
          <div className="relative w-40 h-40 md:w-48 md:h-48 mb-2 animate-pulse-slow">
            <Image 
              src="/marpo-logo.png" 
              alt="MARPO GROUP LOGO" 
              fill 
              className="object-contain drop-shadow-[0_0_30px_rgba(185,28,28,0.4)]"
              priority
            />
          </div>

          <div className="text-center flex flex-col items-center">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-amber-500 italic uppercase leading-none drop-shadow-[0_0_30px_rgba(243,156,18,0.3)]">
              MARPO SPIRIT
            </h1>
            <p className="text-2xl md:text-3xl font-black text-white mt-3 italic tracking-widest">
              Mar point
            </p>
            <div className="mt-4 flex flex-col items-center gap-1">
              <p className="text-lg md:text-xl font-black text-amber-400 tracking-[0.3em] uppercase">
                L.O.T.T.O WORLD
              </p>
              <p className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-widest">
                ( Loyalty Optimized Token Tactical Operations )
              </p>
            </div>
          </div>
          
          <div className="w-full bg-zinc-900/80 p-6 md:p-8 rounded-3xl border border-zinc-700 text-left mt-2">
            <h2 className="text-xl font-black text-amber-500 mb-3 uppercase tracking-widest">Marpo Tokenomics Vision</h2>
            <p className="text-zinc-300 text-sm md:text-base leading-relaxed mb-4">
              마르포 그룹(Marpo Group)은 파이 네트워크(Pi Network) 생태계의 가치 보존과 디플레이션(Deflation)을 이끄는 핵심 엔진입니다. 유저는 원소 채굴을 통해 Ω 에너지를 획득하며, 이는 곧 실물 경제 서사의 기반이 됩니다.
            </p>
            <p className="text-zinc-400 text-[11px] md:text-xs leading-relaxed">
              우리는 무분별한 인플레이션을 거부합니다. 파이(Pi) 결제를 통해 활성화되는 시스템은 참여자 모두에게 공정한 가치 분배와 강력한 소각 메커니즘을 제공합니다. 마르포 스피릿과 함께 새로운 부의 서사를 작성하시겠습니까?
            </p>
          </div>

          <div 
            onClick={() => setAgreed(!agreed)} 
            className="flex items-center gap-4 cursor-pointer group p-2 rounded-xl hover:bg-zinc-900/50 transition-colors w-full justify-center"
          >
            <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-colors ${agreed ? 'bg-amber-500 border-amber-500' : 'border-zinc-500 group-hover:border-amber-400'}`}>
              {agreed && <span className="text-black font-black text-lg">✓</span>}
            </div>
            <span className="text-zinc-300 font-bold text-sm md:text-base select-none group-hover:text-white transition-colors">
              마르포 그룹의 토크노믹스 비전 및 정책에 동의합니다.
            </span>
          </div>

          <button 
            onClick={() => setView('subscription')}
            disabled={!agreed}
            className={`font-black uppercase italic tracking-widest px-12 py-5 rounded-2xl transition-all shadow-2xl ${agreed ? 'bg-amber-500 text-black hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(243,156,18,0.4)]' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}`}
          >
            Access Subscription
          </button>
        </div>
        <style jsx>{`
          @keyframes pulse-slow {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.02); }
          }
          .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        `}</style>
      </div>
    );
  }

  // 💳 2단계: 구독 선택창 (로고 상단 작게 배치)
  if (view === 'subscription') {
    const handlePayment = (tier: string) => {
      alert(`[파이 지갑 호출] ${tier.toUpperCase()} 결제 승인 대기 중...`);
      localStorage.setItem('marpo_session', 'active');
      localStorage.setItem('marpo_tier', tier); 
      setView('dashboard');
    };

    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative">
        <div className="mb-8 relative w-24 h-24">
          <Image src="/marpo-logo.png" alt="Logo" fill className="object-contain opacity-50" />
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-white italic uppercase mb-10 tracking-widest text-center">Select Tier Protocol</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
          {/* Basic */}
          <div className="bg-zinc-900 border border-zinc-700 rounded-[3.5rem] p-8 flex flex-col items-center text-center">
            <h3 className="text-xl font-black text-zinc-400 uppercase mb-2">Basic</h3>
            <p className="text-3xl font-black text-white mb-6">0 Pi</p>
            <ul className="text-zinc-500 text-[11px] font-bold flex-1 space-y-3 mb-8">
              <li>기본 원소 탐색 권한</li>
              <li>매회 광고 시청 필수</li>
              <li>기본 리워드 풀 접속</li>
            </ul>
            <button onClick={() => handlePayment('basic')} className="w-full py-4 bg-zinc-800 text-white rounded-xl font-black uppercase text-xs">Free Access</button>
          </div>

          {/* Premium */}
          <div className="bg-zinc-900 border-2 border-amber-500 rounded-[3.5rem] p-8 flex flex-col items-center text-center transform md:-translate-y-4 shadow-[0_0_40px_rgba(243,156,18,0.2)]">
            <div className="bg-amber-500 text-black text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest mb-4">Most Popular</div>
            <h3 className="text-xl font-black text-amber-500 uppercase mb-2">Premium</h3>
            <p className="text-5xl font-black text-white mb-6">1 Pi</p>
            <ul className="text-zinc-300 text-[11px] font-bold flex-1 space-y-3 mb-8">
              <li>4시간 내 5회 연속 프리드로우</li>
              <li>5회 소진 시 광고 1회 시청 룰 적용</li>
              <li>프리미엄 리워드 배율 적용</li>
            </ul>
            <button onClick={() => handlePayment('premium')} className="w-full py-5 bg-amber-500 text-black rounded-xl font-black uppercase text-sm shadow-[0_0_20px_rgba(243,156,18,0.3)]">Connect Pi Wallet</button>
          </div>

          {/* VIP */}
          <div className="bg-zinc-900 border border-lime-500/50 rounded-[3.5rem] p-8 flex flex-col items-center text-center shadow-[0_0_30px_rgba(163,230,53,0.1)]">
            <h3 className="text-xl font-black text-lime-400 uppercase mb-2">VIP</h3>
            <p className="text-3xl font-black text-white mb-6">3 Pi</p>
            <ul className="text-zinc-400 text-[11px] font-bold flex-1 space-y-3 mb-8">
              <li>10회 연속 압도적 프리드로우</li>
              <li>10회 소진 시 짧은 광고 1회 룰 적용</li>
              <li>마르포 생태계 최우선 혜택 보장</li>
            </ul>
            <button onClick={() => handlePayment('vip')} className="w-full py-4 bg-lime-500 text-black rounded-xl font-black uppercase text-xs">Connect Pi Wallet</button>
          </div>
        </div>
        <button onClick={() => setView('intro')} className="mt-12 text-zinc-500 text-[10px] font-bold underline hover:text-white transition-colors">Cancel & Go Back</button>
      </div>
    );
  }

  // 🏁 3단계: 메인 게임 (상단 바에 로고 심볼 배치)
  if (view === 'dashboard') {
    return (
      <div className="min-h-screen bg-[#050505] text-white relative flex flex-col items-center">
        <header className="w-full p-4 md:px-10 flex justify-between items-center z-50 bg-black/50 backdrop-blur-md sticky top-0 border-b border-zinc-800">
          <div className="flex items-center gap-3">
             <div className="relative w-8 h-8">
               <Image src="/marpo-logo.png" alt="Symbol" fill className="object-contain" />
             </div>
             <h2 className="text-[10px] md:text-xs font-black text-zinc-400 uppercase italic tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Pi Network Connected
             </h2>
          </div>
          <button 
            onClick={() => {
              localStorage.removeItem('marpo_session');
              localStorage.removeItem('marpo_tier');
              setView('intro');
            }}
            className="text-zinc-500 hover:text-amber-500 text-[9px] font-bold uppercase tracking-widest transition-colors border border-zinc-800 px-3 py-1 rounded-full"
          >
            Disconnect
          </button>
        </header>

        <main className="w-full flex-1 relative">
          <MarpoSpiritPage lang="ko" />
        </main>
      </div>
    );
  }
}