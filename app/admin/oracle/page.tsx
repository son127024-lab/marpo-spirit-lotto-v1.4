"use client";
import React from 'react';
import RevenueHud from './components/RevenueHud';
import TokenomicsHud from './components/TokenomicsHud';
import SubscriptionPolicyHud from './components/SubscriptionPolicyHud';
import NotificationControlHud from './components/NotificationControlHud';
import AirdropMonitorHud from './components/AirdropMonitorHud';
import GlobalSupplyHud from './components/GlobalSupplyHud';
import PiPaymentLogHud from './components/PiPaymentLogHud';
import WinnerVault from './components/WinnerVault';

export default function OracleDashboard() {
  return (
    {/* 1. 모바일에서는 패딩(p)을 적게(p-4), PC에서는 넉넉하게(lg:p-10) 조절하고 가로 스크롤을 원천 차단(overflow-x-hidden)합니다. */}
    <div className="min-h-screen bg-marpo-bg text-white p-4 sm:p-6 lg:p-10 font-sans selection:bg-marpo-amber/30 overflow-x-hidden w-full">
      
      {/* 배경 장식 */}
      <div className="fixed inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: `linear-gradient(#1a1a1b 1px, transparent 1px), linear-gradient(90deg, #1a1a1b 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>
      
      {/* 헤더 부분 반응형 (글자 크기 자동 조절) */}
      <header className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-16 border-b-2 border-marpo-zinc pb-6 md:pb-10 gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter text-marpo-amber italic uppercase font-urbanist leading-none">
            Marpo Oracle <span className="text-white font-light text-lg md:text-2xl ml-2 md:ml-4 not-italic tracking-[0.3em] md:tracking-[0.6em] opacity-50 block md:inline mt-2 md:mt-0">V2 Command</span>
          </h1>
          <p className="text-zinc-500 mt-4 font-black uppercase tracking-[0.2em] md:tracking-[0.5em] text-[10px] md:text-xs flex items-center gap-3">
            <span className="w-2 h-2 bg-marpo-neon rounded-full animate-ping shrink-0"></span>
            Pi Browser Integrated | Mining Governance
          </p>
        </div>
      </header>

      {/* 2. 메인 뼈대: 모바일은 1단(col-span-1), PC는 12단 그리드(grid-cols-12) */}
      <main className="relative z-10 grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-10 w-full max-w-[1800px] mx-auto">
        
        {/* 좌측 패널 (모바일: 위, PC: 왼쪽 4칸) */}
        <div className="xl:col-span-4 flex flex-col gap-6 lg:gap-10 min-w-0">
          <RevenueHud />
          <GlobalSupplyHud />
          <PiPaymentLogHud />
        </div>
        
        {/* 우측 패널 (모바일: 아래, PC: 오른쪽 8칸) */}
        <div className="xl:col-span-8 flex flex-col gap-6 lg:gap-10 min-w-0">
          <TokenomicsHud />
          
          {/* 하위 컴포넌트들: 화면이 좁으면 위아래로, 넓어지면(lg:) 양옆으로 배치 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
            <SubscriptionPolicyHud />
            <AirdropMonitorHud />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
             <div className="min-w-0 overflow-hidden"><NotificationControlHud /></div>
             <div className="min-w-0 overflow-hidden"><WinnerVault /></div>
          </div>
        </div>
        
      </main>
    </div>
  );
}