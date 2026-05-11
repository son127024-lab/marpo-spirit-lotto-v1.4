"use client";
import { Globe } from 'lucide-react';

export default function GlobalSupplyHud() {
  return (
    <section className="bg-marpo-zinc/30 border border-marpo-zinc rounded-[2.5rem] p-8 backdrop-blur-xl group hover:border-marpo-amber/50 transition-all">
      <div className="flex items-center gap-4 mb-8"><Globe className="text-marpo-amber" size={28} /><h3 className="text-2xl font-black italic text-white uppercase tracking-widest font-urbanist">Ecosystem Supply</h3></div>
      <div className="space-y-6">
        <div className="bg-black/40 p-6 rounded-3xl border border-marpo-zinc">
          <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mb-2">Main Token (MARPO)</p>
          <p className="text-3xl font-black italic text-white tracking-tighter">5,300,000,000 <span className="text-sm text-zinc-500 font-bold not-italic">MARPO</span></p>
        </div>
        <div className="bg-black/40 p-6 rounded-3xl border border-marpo-zinc">
          <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mb-2">Mining Resource (Ω)</p>
          <p className="text-3xl font-black italic text-marpo-neon tracking-tighter">314,159,265 <span className="text-sm text-zinc-500 font-bold not-italic">Ω</span></p>
        </div>
      </div>
    </section>
  );
}