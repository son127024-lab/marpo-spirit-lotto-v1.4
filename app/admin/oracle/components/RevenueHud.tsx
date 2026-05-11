"use client";
import React from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';

export default function RevenueHud() {
  return (
    <section className="bg-marpo-zinc/30 border border-marpo-zinc rounded-[2.5rem] p-8 backdrop-blur-xl group hover:border-marpo-amber/50 transition-all shadow-2xl">
      <div className="flex justify-between items-start mb-8 text-marpo-amber">
        <div className="bg-marpo-amber/10 p-4 rounded-2xl border border-marpo-amber/20">
          <DollarSign size={32} />
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-marpo-neon justify-end">
            <TrendingUp size={14} />
            <span className="font-black text-sm">+12.4%</span>
          </div>
          <p className="text-[10px] text-zinc-600 font-black uppercase">vs Yesterday</p>
        </div>
      </div>
      <p className="text-zinc-500 font-black text-xs uppercase tracking-[0.4em] mb-2 font-urbanist">Daily Fiat Revenue</p>
      <div className="flex items-baseline gap-3 mb-10">
        <h2 className="text-7xl font-black tracking-tighter text-white italic font-urbanist">$12,840.50</h2>
      </div>
      <div className="grid grid-cols-2 gap-4 pt-8 border-t border-marpo-zinc/50 text-white">
        <div>
          <p className="text-[10px] text-zinc-600 font-black uppercase mb-1">Unlock Rate</p>
          <p className="text-2xl font-black italic">64.2%</p>
        </div>
        <div>
          <p className="text-[10px] text-zinc-600 font-black uppercase mb-1">Impressions</p>
          <p className="text-2xl font-black italic">1.67M</p>
        </div>
      </div>
    </section>
  );
}