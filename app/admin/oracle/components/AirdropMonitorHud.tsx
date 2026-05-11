"use client";
import { Gift } from 'lucide-react';
export default function AirdropMonitorHud() {
  return (
    <section className="bg-marpo-zinc/30 border border-marpo-zinc rounded-[2.5rem] p-8 backdrop-blur-xl group hover:border-marpo-amber/50 transition-all">
      <div className="flex justify-between items-start mb-8 text-marpo-amber">
        <Gift size={32} />
        <div className="text-right text-marpo-neon font-black italic">JUNE 1st DROP</div>
      </div>
      <p className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.4em] mb-2">Monthly Streak Bonus</p>
      <h2 className="text-4xl font-black italic text-white font-urbanist">314 Ω</h2>
    </section>
  );
}