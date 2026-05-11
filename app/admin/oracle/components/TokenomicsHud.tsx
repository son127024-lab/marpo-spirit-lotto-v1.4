"use client";
import React from 'react';
import { Zap, Activity } from 'lucide-react';

export default function TokenomicsHud() {
  return (
    <section className="bg-marpo-zinc/30 border border-marpo-zinc rounded-[2.5rem] p-8 backdrop-blur-xl group hover:border-marpo-neon/50 transition-all shadow-2xl">
      {/* 상단 헤더 영역 */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-marpo-neon/10 p-3 rounded-xl border border-marpo-neon/20">
            <Zap className="text-marpo-neon" size={28} />
          </div>
          <h3 className="text-2xl font-black italic text-marpo-amber uppercase tracking-widest font-urbanist">Ω Tokenomics Status</h3>
        </div>
        
        <div className="flex gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-marpo-neon/10 rounded-full border border-marpo-neon/20">
            <div className="w-2 h-2 rounded-full bg-marpo-neon animate-pulse"></div>
            <span className="text-[10px] font-black text-marpo-neon uppercase tracking-tighter">Minting Active</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-marpo-amber/10 rounded-full border border-marpo-amber/20">
            <div className="w-2 h-2 rounded-full bg-marpo-amber"></div>
            <span className="text-[10px] font-black text-marpo-amber uppercase tracking-tighter">Burning Active</span>
          </div>
        </div>
      </div>

      {/* 📊 전술적 유동성 그래프 (Telemetry View) */}
      <div className="h-44 flex items-end gap-1.5 px-2 mb-10 bg-black/20 rounded-3xl p-4 border border-marpo-zinc/50">
        {[55, 70, 40, 90, 65, 80, 50, 100, 75, 85, 60, 95].map((h, i) => (
          <div key={i} className="flex-1 flex flex-col gap-1 group">
            <div 
              className="w-full bg-marpo-neon/20 rounded-t-lg transition-all group-hover:bg-marpo-neon/60 group-hover:shadow-[0_0_15px_rgba(163,230,53,0.4)]" 
              style={{ height: `${h}%` }}
            ></div>
            <div 
              className="w-full bg-marpo-amber/10 rounded-b-lg" 
              style={{ height: `15%` }}
            ></div>
          </div>
        ))}
      </div>

      {/* 실시간 수치 데이터 */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-black/50 p-6 rounded-[2rem] border border-marpo-zinc text-center transition-all hover:bg-marpo-neon/5">
          <p className="text-[10px] text-zinc-600 font-black uppercase mb-1 tracking-widest font-urbanist">Minted Today</p>
          <p className="text-3xl font-black text-marpo-neon italic font-urbanist">+452,100 <span className="text-sm">Ω</span></p>
        </div>
        
        <div className="bg-black/50 p-6 rounded-[2rem] border border-marpo-zinc text-center transition-all hover:bg-marpo-amber/5">
          <p className="text-[10px] text-zinc-600 font-black uppercase mb-1 tracking-widest font-urbanist">Burned Today</p>
          <p className="text-3xl font-black text-marpo-amber italic font-urbanist">-102,400 <span className="text-sm">Ω</span></p>
        </div>
        
        <div className="bg-black/50 p-6 rounded-[2rem] border border-marpo-zinc text-center transition-all hover:bg-white/5">
          <p className="text-[10px] text-zinc-600 font-black uppercase mb-1 tracking-widest font-urbanist">Net Flow Rate</p>
          <p className="text-3xl font-black text-white italic font-urbanist">1.44x <span className="text-zinc-700 text-xs not-italic font-bold">AVG</span></p>
        </div>
      </div>
    </section>
  );
}