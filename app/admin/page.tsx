"use client";
import RevenueHud from './components/RevenueHud';
import TokenomicsHud from './components/TokenomicsHud';
import SubscriptionPolicyHud from './components/SubscriptionPolicyHud'; // 새 컴포넌트
import WinnerVault from './components/WinnerVault';

export default function OracleDashboard() {
  return (
    <div className="min-h-screen bg-marpo-bg text-white p-10 font-sans relative">
      <header className="relative z-10 flex justify-between items-end mb-16 border-b border-marpo-zinc pb-8">
        <div>
          <h1 className="text-6xl font-black tracking-tighter text-marpo-amber italic uppercase font-urbanist">
            Marpo Oracle <span className="text-white font-light text-2xl ml-4 not-italic tracking-[0.5em]">Mining Center</span>
          </h1>
          <p className="text-zinc-500 mt-3 font-bold uppercase tracking-[0.4em] text-sm">Subscription & Mining Governance | Node: PI-CORE</p>
        </div>
      </header>

      <main className="relative z-10 grid grid-cols-12 gap-8">
        {/* Task 1: 현금 흐름 (구독료 + 광고 수익) */}
        <div className="col-span-12 lg:col-span-4">
          <RevenueHud />
        </div>
        
        {/* Task 2: 토크노믹스 */}
        <div className="col-span-12 lg:col-span-8">
          <TokenomicsHud />
        </div>
        
        {/* 신규: 구독 정책 관리 (기존 페깅 컨트롤러 자리에 배치) */}
        <div className="col-span-12 lg:col-span-4">
          <SubscriptionPolicyHud />
        </div>

        {/* 잭팟 검증 (구독형 마이닝 결과 검증) */}
        <div className="col-span-12 lg:col-span-8">
          <WinnerVault />
        </div>
      </main>
    </div>
  );
}