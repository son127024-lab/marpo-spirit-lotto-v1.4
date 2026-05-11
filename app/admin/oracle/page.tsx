"use client";
import RevenueHud from './components/RevenueHud';
import TokenomicsHud from './components/TokenomicsHud';
import SubscriptionPolicyHud from './components/SubscriptionPolicyHud';
import NotificationControlHud from './components/NotificationControlHud';
import AirdropMonitorHud from './components/AirdropMonitorHud';
import GlobalSupplyHud from './components/GlobalSupplyHud';
import WinnerVault from './components/WinnerVault';

export default function OracleDashboard() {
  return (
    <div className="min-h-screen bg-marpo-bg text-white p-10 font-sans relative overflow-x-hidden">
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `radial-gradient(#f39c12 1px, transparent 1px)`, backgroundSize: '50px 50px' }}></div>
      
      <header className="relative z-10 flex justify-between items-end mb-16 border-b border-marpo-zinc pb-8">
        <div>
          <h1 className="text-6xl font-black tracking-tighter text-marpo-amber italic uppercase font-urbanist">
            Marpo Oracle <span className="text-white font-light text-2xl ml-4 not-italic tracking-[0.5em]">Command Center</span>
          </h1>
          <p className="text-zinc-500 mt-3 font-bold uppercase tracking-[0.4em] text-sm">4-Hour Cycle Mining Governance | 5.3B MARPO & 314M Ω</p>
        </div>
        <div className="text-right">
          <p className="text-marpo-neon font-black text-lg animate-pulse tracking-widest">● LIVE SYSTEM ACTIVE</p>
          <p className="text-zinc-500 font-mono text-sm mt-1">2026.05.11 UTC</p>
        </div>
      </header>

      <main className="relative z-10 grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
          <RevenueHud />
          <GlobalSupplyHud /> 
        </div>
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
          <TokenomicsHud />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SubscriptionPolicyHud />
            <AirdropMonitorHud />
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4"><NotificationControlHud /></div>
        <div className="col-span-12 lg:col-span-8"><WinnerVault /></div>
      </main>
    </div>
  );
}