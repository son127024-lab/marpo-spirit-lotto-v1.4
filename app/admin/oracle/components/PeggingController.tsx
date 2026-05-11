"use client";
import React from 'react';
import { Zap, ArrowUpRight } from 'lucide-react';

export default function PeggingController() {
  return (
    <section className="bg-marpo-zinc/20 border border-marpo-zinc rounded-[2.5rem] p-8 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-marpo-amber/10 p-3 rounded-xl border border-marpo-amber/20">
            <Zap className="text-marpo-amber" size={24} />
          </div>
          <h3 className="text-2xl font-black italic uppercase tracking-widest font-urbanist text-white">Pegging Control</h3>
        </div>
        <p className="text-zinc-500 font-bold leading-relaxed mb-8">
          Ω 에너지의 실물 자산(USD) 페깅 비율을 실시간 조정하여 생태계 인플레이션을 제어합니다.
        </p>
      </div>

      <div className="bg-black/50 p-8 rounded-[2rem] border border-marpo-zinc mb-10">
        <div className="flex justify-between items-center mb-2">
          <span className="text-zinc-600 text-xs font-black uppercase tracking-widest">Active Exchange Rate</span>
          <ArrowUpRight className="text-marpo-neon" size={16} />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-black italic text-white">$0.24</span>
          <span className="text-marpo-amber font-black text-sm uppercase">/ Ω Unit</span>
        </div>
      </div>

      <button className="w-full py-6 bg-marpo-amber text-black rounded-2xl font-black uppercase text-base shadow-[0_0_30px_rgba(243,156,18,0.2)] hover:shadow-[0_0_50px_rgba(243,156,18,0.4)] active:scale-95 transition-all">
        Update Market Rate
      </button>
    </section>
  );
}