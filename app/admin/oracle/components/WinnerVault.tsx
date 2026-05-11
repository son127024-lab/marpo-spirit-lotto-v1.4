"use client";
import React from 'react';
import { ShieldCheck, Eye, CheckCircle, AlertTriangle } from 'lucide-react';

const mockWinners = [
  { id: 1, node: "0x7F...3B2", prize: 314159, risk: "LOW", time: "10:24:05" },
  { id: 2, node: "0x9A...F1C", prize: 8000, risk: "HIGH", time: "11:05:42" },
  { id: 3, node: "0x1C...E4A", prize: 4000, risk: "LOW", time: "11:15:20" },
];

export default function WinnerVault() {
  return (
    <section className="bg-marpo-zinc/20 border border-marpo-zinc rounded-[2.5rem] p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
          <ShieldCheck className="text-marpo-neon" size={32} />
          <h3 className="text-2xl font-black italic uppercase tracking-widest font-urbanist text-white">Authorized Winner Vault</h3>
        </div>
        <span className="bg-marpo-amber/10 text-marpo-amber px-6 py-2 rounded-full border border-marpo-amber/30 text-xs font-black uppercase tracking-[0.2em] animate-pulse">
          {mockWinners.length} Approvals Pending
        </span>
      </div>

      <div className="space-y-4 flex-grow overflow-y-auto pr-2 custom-scrollbar">
        {mockWinners.map((w) => (
          <div key={w.id} className="bg-black/40 border border-marpo-zinc p-6 rounded-3xl flex justify-between items-center hover:bg-white/5 transition-all group">
            <div className="flex gap-12 items-center">
              <div>
                <p className="text-[10px] text-zinc-600 font-black uppercase mb-1">Node Identity</p>
                <p className="text-marpo-amber font-black italic text-lg">{w.node}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-600 font-black uppercase mb-1">Prize Amount</p>
                <p className="text-white font-black text-2xl tracking-tighter">
                  {w.prize.toLocaleString()} <span className="text-zinc-600 text-sm italic">Ω</span>
                </p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-600 font-black uppercase mb-1">Risk Score</p>
                <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${
                  w.risk === 'LOW' ? 'bg-marpo-neon/10 text-marpo-neon border-marpo-neon/30' : 'bg-red-500/10 text-red-500 border-red-500/30'
                }`}>
                  {w.risk}
                </span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button className="p-3 bg-zinc-800 text-zinc-400 rounded-xl hover:text-white transition-all">
                <Eye size={20} />
              </button>
              <button className="px-8 py-3 bg-marpo-neon text-black rounded-xl text-xs font-black uppercase shadow-lg hover:scale-105 active:scale-95 transition-all">
                Approve
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}