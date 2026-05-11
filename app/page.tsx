"use client";
import React, { useState, useEffect } from 'react';

// 👇 빨간 줄을 없애는 핵심: 정확한 폴더 경로에서 게임 엔진을 불러옵니다.
import MarpoSpiritPage from '../components/marpo-spirit-page'; 

export default function MainGameLobby() {
  const [isReady, setIsReady] = useState(false);
  const [view, setView] = useState<'intro' | 'subscription' | 'dashboard'>('intro');

  useEffect(() => {
    setIsReady(true);
    const savedSession = localStorage.getItem('marpo_session');
    if (savedSession === 'active') {
      setView('dashboard');
    }
  }, []);

  if (!isReady) return null;

  // 🏁 1. 인트로 화면
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

  // 💳 2. 구독/결제 화면
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

  // 🎮 3. 메인 게임 대시보드 (봉인 해제!)
  if (view === 'dashboard') {
    return (
      <div className="min-h-screen bg-marpo-bg text-white relative flex flex-col items-center">
        
        {/* 상단 비상 탈출 네비게이션 */}
        <header className="w-full p-4 md:px-10 flex justify-between items-center z-50 bg-black/50 backdrop-blur-md sticky top-0 border-b border-marpo-zinc/50">
          <h2 className="text-lg font-black text-zinc-400 uppercase italic tracking-widest">Pi Network Connected</h2>
          <button 
            onClick={() => {
              localStorage.removeItem('marpo_session');
              setView('intro');
            }}
            className="text-zinc-500 hover:text-marpo-amber text-[10px] font-bold uppercase tracking-widest transition-colors border border-zinc-800 px-3 py-1 rounded-full"
          >
            System Disconnect
          </button>
        </header>

        {/* 빈 박스를 날리고 진짜 게임 화면 마운트 */}
        <main className="w-full flex-1 relative">
          <MarpoSpiritPage />
        </main>

      </div>
    );
  }
}