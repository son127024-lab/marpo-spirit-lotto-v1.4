"use client";
import { DollarSign, TrendingUp } from 'lucide-react';

export default function RevenueHud() {
  return (
    <section className="bg-marpo-zinc/30 border border-marpo-zinc rounded-[2.5rem] p-8 backdrop-blur-xl group hover:border-marpo-amber/50 transition-all">
      <div className="flex justify-between items-start mb-8 text-marpo-amber">
        <div className="bg-marpo-amber/10 p-4 rounded-2xl border border-marpo-amber/20"><DollarSign size={32} /></div>
        <div className="text-right text-marpo-neon"><TrendingUp size={14} /><span className="font-black text-sm ml-1">+12.4%</span></div>
      </div>
      <p className="text-zinc-500 font-black text-xs uppercase tracking-[0.4em] mb-2 font-urbanist">Daily Fiat Revenue</p>
      <h2 className="text-6xl font-black tracking-tighter text-white italic font-urbanist">$12,840.50</h2>
      <div className="grid grid-cols-2 gap-4 pt-8 border-t border-marpo-zinc/50 mt-8">
        <div><p className="text-[10px] text-zinc-600 font-black uppercase">Unlock Rate</p><p className="text-2xl font-black italic text-white">64.2%</p></div>
        <div><p className="text-[10px] text-zinc-600 font-black uppercase">Impressions</p><p className="text-2xl font-black italic text-white">1.67M</p></div>
      </div>
    </section>
  );
}