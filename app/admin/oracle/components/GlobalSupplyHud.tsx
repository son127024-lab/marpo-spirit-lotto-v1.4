"use client";
import { Globe } from 'lucide-react';
export default function GlobalSupplyHud() {
  return (
    <section className="bg-marpo-zinc/30 border border-marpo-zinc rounded-[2.5rem] p-8 backdrop-blur-xl group hover:border-marpo-amber/50 transition-all">
      <div className="flex items-center gap-4 mb-8 text-marpo-amber"><Globe size={28} /><h3 className="text-2xl font-black italic text-white uppercase font-urbanist">Ecosystem Supply</h3></div>
      <div className="space-y-4">
        <div className="bg-black/40 p-5 rounded-3xl border border-marpo-zinc">
          <p className="text-[10px] text-zinc-600 font-black mb-1">MARPO TOKEN</p>
          <p className="text-3xl font-black italic text-white">5.3B</p>
        </div>
        <div className="bg-black/40 p-5 rounded-3xl border border-marpo-zinc">
          <p className="text-[10px] text-zinc-600 font-black mb-1">Ω ENERGY</p>
          <p className="text-3xl font-black italic text-marpo-neon">314M</p>
        </div>
      </div>
    </section>
  );
}