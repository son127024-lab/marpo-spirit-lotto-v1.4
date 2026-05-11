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
    // max-w-full과 overflow-hidden으로 화면 이탈을 원천 차단합니다.
    <div className="min-h-screen bg-marpo-bg text-white overflow-x-hidden w-full relative selection:bg-marpo-amber/30">
      
      {/* 배경 장식 */}
      <div className="fixed inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: `linear-gradient(#1a1a1b 1px, transparent 1px), linear-gradient(90deg, #1a1a1b 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>
      
      <div className="relative z-10 p-4 sm:p-6 lg:p-10 max-w-[1920px] mx-auto w-full">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 border-b-2 border-marpo-zinc pb-6 gap-4">
          <div>
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black tracking-tighter text-marpo-amber italic uppercase font-urbanist leading-none">
              Marpo Oracle <span className="text-white font-light text-base md:text-2xl ml-2 not-italic tracking-[0.3em] opacity-50 block md:inline mt-1">V2 Command</span>
            </h1>
            <p className="text-zinc-500 mt-3 font-black uppercase tracking-[0.3em] text-[10px] md:text-xs flex items-center gap-2">
              <span className="w-2 h-2 bg-marpo-neon rounded-full animate-ping shrink-0"></span>
              Pi Browser System Active
            </p>
          </div>
        </header>

        {/* 메인 레이아웃: xl(1280px) 이상에서만 2컬럼, 그 미만은 무조건 1줄로 세웁니다. */}
        <main className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 w-full">
          
          {/* 왼쪽 영역: col-span-12(전체) -> xl:col-span-4(1/3) */}
          <div className="col-span-12 xl:col-span-4 flex flex-col gap-6 lg:gap-8 w-full min-w-0">
            <RevenueHud />
            <GlobalSupplyHud />
            <PiPaymentLogHud />
          </div>
          
          {/* 오른쪽 영역: col-span-12(전체) -> xl:col-span-8(2/3) */}
          <div className="col-span-12 xl:col-span-8 flex flex-col gap-6 lg:gap-8 w-full min-w-0">
            <TokenomicsHud />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 w-full">
              <SubscriptionPolicyHud />
              <AirdropMonitorHud />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 w-full">
               <div className="w-full min-w-0"><NotificationControlHud /></div>
               <div className="w-full min-w-0"><WinnerVault /></div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}