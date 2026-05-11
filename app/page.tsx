"use client";
import React, { useState, useEffect } from 'react';

export default function MainGameLobby() {
  const [isReady, setIsReady] = useState(false);
  // 3단계 화면 전환 로직 복구 (인트로 -> 결제 -> 메인 게임)
  const [view, setView] = useState<'intro' | 'subscription' | 'dashboard'>('intro');

  useEffect(() => {
    setIsReady(true);
    // 세션 유지 로직: 이미 결제/로그인 기록이 있는 유저는 바로 메인 엔진으로 직행
    const savedSession = localStorage.getItem('marpo_session');
    if (savedSession === 'active') {
      setView('dashboard');
    }
  }, []);

  if (!isReady) return null; // 화면 깜빡임(Hydration Error) 원천 차단

  // 🏁 1. 인트로 화면 (블록버스터급 대문)
  if (view === 'intro') {
    return (
      <div className="min-h-screen bg-marpo-bg text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at center, #f39c12 0%, transparent 70%)` }}></div>
        <div className="relative z-10 text-center max-w-3xl flex flex-col items-center gap-8">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-marpo-amber italic uppercase font-urbanist leading-none drop-shadow-[0_0_20px_rgba(243,156,18,0.2)]">
            MARPO <span className="text-white">RUN</span>
          </h1>
          <p className="text-zinc-400 mt-4 font-bold uppercase tracking-[0.4em] text-xs md:text-sm">
            6-Stage Economic History Engine
          </p>
          <button 
            onClick={() => setView('subscription')}
            className="mt-8 bg-marpo-amber hover:bg-yellow-400 text-black font-black uppercase italic tracking-widest px-10 py-5 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(243,156,18,0.3)]"
          >
            Initialize System
          </button>
        </div>
      </div>
    );
  }

  // 💳 2. 구독/결제 화면 (파이 코인 연동 대기소)
  if (view === 'subscription') {
    return (
      <div className="min-h-screen bg-marpo-bg text-white flex flex-col items-center justify-center p-6 relative">
        <div className="bg-marpo-zinc/30 border border-marpo-amber/30 p-10 rounded-[2.5rem] max-w-md w-full backdrop-blur-md text-center shadow-[0_0_40px_rgba(243,156,18,0.1)]">
          <h2 className="text-3xl font-black text-white italic uppercase mb-4 tracking-wider">Access Protocol</h2>
          <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-10 leading-relaxed">
            Insert 1 Pi (Premium) or 3 Pi (VIP)<br />to activate the Mal-Po Character.
          </p>
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => {
                localStorage.setItem('marpo_session', 'active');
                setView('dashboard');
              }}
              className="w-full bg-marpo-neon hover:bg-green-400 text-black font-black uppercase italic tracking-widest py-4 rounded-xl transition-all"
            >
              Confirm Pi Payment
            </button>
            <button 
              onClick={() => setView('intro')}
              className="w-full bg-transparent border border-zinc-700 text-zinc-400 hover:text-white font-bold uppercase tracking-widest py-4 rounded-xl transition-all text-xs"
            >
              Cancel Mission
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 🎮 3. 메인 게임 대시보드 (말포 진화 및 로또 월드 구동)
  if (view === 'dashboard') {
    return (
      <div className="min-h-screen bg-marpo-bg text-white p-6 md:p-10 relative flex flex-col items-center">
        <header className="w-full max-w-6xl flex justify-between items-end border-b border-marpo-zinc pb-6 mb-10">
          <div>
            <h2 className="text-4xl font-black text-marpo-amber uppercase italic tracking-tighter">Lotto World</h2>
            <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-[10px] mt-2">Mal-Po Evolution System Active</p>
          </div>
          <button 
            onClick={() => {
              localStorage.removeItem('marpo_session');
              setView('intro');
            }}
            className="text-zinc-500 hover:text-marpo-amber text-xs font-bold uppercase tracking-widest transition-colors"
          >
            System Disconnect
          </button>
        </header>

        {/* 향후 MarpoSpiritPage 컴포넌트가 마운트될 핵심 엔진 구역 */}
        <main className="w-full max-w-6xl flex-1 flex flex-col items-center justify-center bg-marpo-zinc/20 border border-marpo-zinc border-dashed rounded-[3rem] p-10 text-center relative overflow-hidden group">
          <div className="w-20 h-20 bg-marpo-amber/20 rounded-full flex items-center justify-center mb-6 animate-pulse shadow-[0_0_30px_rgba(243,156,18,0.2)]">
             <span className="text-marpo-amber text-3xl font-black italic">M</span>
          </div>
          <h3 className="text-2xl font-black text-white uppercase italic tracking-widest mb-4">Mal-Po Engine Ready</h3>
          <p className="text-zinc-400 max-w-lg text-sm leading-relaxed mb-8">
            유저 데이터 연결 대기 중입니다.<br/>
            골드러시부터 Web 3.0 시대까지 이어지는 6단계 진화 로직 컴포넌트를 이 영역에 마운트하십시오.
          </p>
          <div className="px-6 py-2 bg-black/50 border border-zinc-800 rounded-full">
             <p className="text-[10px] text-marpo-neon font-mono uppercase tracking-widest animate-pulse">&lt;MarpoSpiritPage /&gt; Mount Area</p>
          </div>
        </main>
      </div>
    );
  }
}