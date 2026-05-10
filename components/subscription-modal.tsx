"use client";
import React, { useState } from 'react';
import { Zap, Crown, Check, Shield, Loader2 } from 'lucide-react';

export default function SubscriptionModal({ onSelect }: { onSelect: (tier: string) => void }) {
  const [loading, setLoading] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 bg-[#050505]/98 backdrop-blur-2xl z-[500] flex flex-col items-center justify-start p-6 overflow-y-auto font-sans">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 gap-8 py-20 relative z-10">
        
        {/* BASIC PLAY */}
        <div className="bg-[#0a0a0a] border border-zinc-800 p-10 rounded-[3rem] flex flex-col items-center text-center shadow-2xl">
          <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-8 border border-zinc-800"><Zap size={32} className="text-zinc-600" /></div>
          <h3 className="text-2xl font-black mb-1 text-white tracking-tighter uppercase italic">Basic Play</h3>
          <p className="text-xs text-zinc-600 font-bold tracking-[0.2em] mb-4 uppercase">Free Draw Engine</p>
          <p className="text-4xl font-black mb-10 text-white tracking-tighter">FREE</p>
          <ul className="text-sm text-zinc-500 space-y-5 mb-12 text-left w-full font-bold uppercase tracking-widest">
            <li className="flex gap-4 items-start"><Check size={20} className="text-zinc-800" /> <span>1 Energy / 3 Ads Mining</span></li>
            <li className="flex gap-4 items-start"><Check size={20} className="text-zinc-800" /> <span>Standard Match Entry</span></li>
          </ul>
          <button onClick={() => onSelect('BASIC')} className="w-full py-6 bg-zinc-900 text-zinc-500 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] mt-auto hover:bg-white hover:text-black transition-all shadow-xl">Start Free Draw</button>
        </div>

        {/* SMART STRATEGY */}
        <div className="bg-[#0a0a0a] border-2 border-[#f39c12] p-10 rounded-[3rem] flex flex-col items-center text-center relative shadow-[0_0_60px_rgba(243,156,18,0.15)] z-20 md:scale-105">
          <div className="absolute -top-5 bg-[#f39c12] text-black text-xs font-black px-8 py-2 rounded-full uppercase tracking-tighter">Recommended</div>
          <div className="w-16 h-16 bg-[#f39c12] rounded-2xl flex items-center justify-center mb-8"><Shield size={32} className="text-black" /></div>
          <h3 className="text-2xl font-black mb-1 text-white tracking-tighter uppercase italic">Smart Strategy</h3>
          <p className="text-xs text-[#f39c12] font-bold tracking-[0.2em] mb-4 uppercase">Tactical Utility Entry</p>
          <p className="text-4xl font-black mb-10 text-white tracking-tighter">1.0 <span className="text-2xl text-[#f39c12]">π</span></p>
          <ul className="text-sm text-zinc-200 space-y-5 mb-12 text-left w-full font-bold uppercase tracking-widest">
            <li className="flex gap-4 items-start"><Check size={20} className="text-[#f39c12]" /> <span>Auto 5 Energy Daily</span></li>
            <li className="flex gap-4 items-start"><Check size={20} className="text-[#f39c12]" /> <span>30% Ad Reduction</span></li>
          </ul>
          <button onClick={() => onSelect('PREMIUM')} className="w-full py-6 bg-[#f39c12] text-black rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] mt-auto shadow-2xl transition-all">Tactical Entry</button>
        </div>

        {/* SUPREME INSIDER */}
        <div className="bg-[#0a0a0a] border border-purple-900/30 p-10 rounded-[3rem] flex flex-col items-center text-center shadow-2xl">
          <div className="w-16 h-16 bg-purple-950/20 rounded-2xl flex items-center justify-center mb-8 border border-purple-900/50"><Crown size={32} className="text-purple-500" /></div>
          <h3 className="text-2xl font-black mb-1 text-white tracking-tighter uppercase italic">Supreme Insider</h3>
          <p className="text-xs text-purple-400 font-bold tracking-[0.2em] mb-4 uppercase">Elite Ecosystem Access</p>
          <p className="text-4xl font-black mb-10 text-white tracking-tighter">3.0 <span className="text-2xl text-purple-500">π</span></p>
          <ul className="text-sm text-zinc-500 space-y-5 mb-12 text-left w-full font-bold uppercase tracking-widest">
            <li className="flex gap-4 items-start"><Check size={20} className="text-purple-900" /> <span>Auto 10 Energy Daily</span></li>
            <li className="flex gap-4 items-start"><Check size={20} className="text-purple-900" /> <span>90% Ad Reduction</span></li>
          </ul>
          <button onClick={() => onSelect('VIP')} className="w-full py-6 bg-purple-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] mt-auto hover:bg-purple-500 transition-all shadow-xl">Elite Access</button>
        </div>

      </div>
    </div>
  );
}