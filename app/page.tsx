// app/page.tsx
"use client";
import React from 'react';
import Link from 'next/link';

export default function MainGameLobby() {
  return (
    <div className="min-h-screen bg-marpo-bg text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* 백그라운드 디자인 (파이 네트워크 연결 느낌) */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at center, #f39c12 0%, transparent 70%)` }}></div>
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `linear-gradient(#1a1a1b 1px, transparent 1px), linear-gradient(90deg, #1a1a1b 1px, transparent 1px)`, backgroundSize: '30px 30px' }}></div>

      <div className="relative z-10 text-center max-w-3xl flex flex-col items-center gap-8">
        
        {/* 상태 표시줄 */}
        <div className="px-4 py-1.5 bg-marpo-amber/10 border border-marpo-amber/30 rounded-full flex items-center gap-3 animate-pulse">
          <span className="w-2 h-2 bg-marpo-amber rounded-full"></span>
          <span className="text-[10px] md:text-xs font-black text-marpo-amber uppercase tracking-widest italic">Pi Browser Sandbox Connected</span>
        </div>

        {/* 메인 타이틀 */}
        <div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white italic uppercase font-urbanist leading-none drop-shadow-[0_0_20px_rgba(243,156,18,0.2)]">
            MARPO <span className="text-marpo-amber">RUN</span>
          </h1>
          <p className="text-zinc-400 mt-4 font-bold uppercase tracking-[0.4em] text-xs md:text-sm">
            Lotto World ✕ Pi Network Ecosystem
          </p>
        </div>

        {/* 액션 버튼 */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full max-w-md">
          {/* 게임 시작 버튼 (결제 로직 연결 예정) */}
          <button className="flex-1 bg-marpo-amber hover:bg-yellow-400 text-black font-black uppercase italic tracking-widest py-5 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(243,156,18,0.3)]">
            Insert 1 Pi to Play
          </button>
          
          {/* 어드민 사령부 이동 버튼 */}
          <Link href="/admin/oracle" className="flex-1 bg-marpo-zinc/50 hover:bg-marpo-zinc border border-marpo-zinc text-white font-bold uppercase tracking-widest py-5 rounded-2xl transition-all hover:border-white/20 flex items-center justify-center text-xs">
            Oracle Command
          </Link>
        </div>

        <p className="text-[10px] text-zinc-600 mt-10 font-mono tracking-widest uppercase">
          Marpo Group V2 © 2026
        </p>
      </div>
    </div>
  );
}