"use client";
import RevenueHud from './components/RevenueHud';
import TokenomicsHud from './components/TokenomicsHud';
import SubscriptionPolicyHud from './components/SubscriptionPolicyHud';
import WinnerVault from './components/WinnerVault';
import NotificationControlHud from './components/NotificationControlHud'; // 알람 위젯 추가

export default function OracleDashboard() {
  return (
    <div className="min-h-screen bg-marpo-bg text-white p-10 font-sans relative">
      <header className="relative z-10 flex justify-between items-end mb-16 border-b border-marpo-zinc pb-8">
        <div>
          <h1 className="text-6xl font-black tracking-tighter text-marpo-amber italic uppercase font-urbanist">
            Marpo Oracle <span className="text-white font-light text-2xl ml-4 not-italic tracking-[0.5em]">Mining Governance</span>
          </h1>
          <p className="text-zinc-500 mt-3 font-bold uppercase tracking-[0.4em] text-sm italic">4-Hour Recharge Cycle | Authorized Network: PI-CORE</p>
        </div>
      </header>

      <main className="relative z-10 grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-4">
          <RevenueHud />
        </div>
        <div className="col-span-12 lg:col-span-8">
          <TokenomicsHud />
        </div>
        
        {/* 정책 관리와 알람 관리를 나란히 배치 */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
          <SubscriptionPolicyHud />
          <NotificationControlHud /> 
        </div>

        <div className="col-span-12 lg:col-span-8">
          <WinnerVault />
        </div>
      </main>
    </div>
  );
}S