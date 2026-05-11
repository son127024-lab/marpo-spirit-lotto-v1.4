"use client";
import React from 'react';
// 아래 경로들이 실제 파일명(대소문자 포함)과 100% 일치해야 합니다.
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
    <div className="min-h-screen bg-marpo-bg text-white p-10 font-sans relative">
      <header className="relative z-10 flex justify-between items-end mb-16 border-b border-marpo-zinc pb-8">
        <div>
          <h1 className="text-6xl font-black tracking-tighter text-marpo-amber italic uppercase font-urbanist">
            Marpo Oracle <span className="text-white font-light text-2xl ml-4 not-italic tracking-[0.5em]">Pi Command</span>
          </h1>
        </div>
      </header>

      <main className="relative z-10 grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
          <RevenueHud />
          <GlobalSupplyHud />
          <PiPaymentLogHud />
        </div>
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
          <TokenomicsHud />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SubscriptionPolicyHud />
            <AirdropMonitorHud />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <NotificationControlHud />
             <WinnerVault />
          </div>
        </div>
      </main>
    </div>
  );
}