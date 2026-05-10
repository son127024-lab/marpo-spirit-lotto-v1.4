"use client";
import React, { useState } from 'react';
import { Zap, Crown, Check, Shield, Loader2 } from 'lucide-react';

interface SubscriptionModalProps {
  onSelect: (tier: string) => void;
}

export default function SubscriptionModal({ onSelect }: SubscriptionModalProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (tier: string, price: number) => {
    setLoading(tier);
    try {
      const Pi = (window as any).Pi;
      if (price > 0 && Pi?.createPayment) {
        await Pi.createPayment({
          amount: price,
          memo: `Marpo Spirit ${tier} Tactical Subscription`,
          metadata: { tier: tier }
        }, {
          onReadyForServerApproval: (pid: string) => {},
          onReadyForServerCompletion: (pid: string, txid: string) => onSelect(tier),
          onCancel: () => setLoading(null),
          onError: (e: Error) => { alert(e.message); setLoading(null); }
        });
      } else {
        setTimeout(() => onSelect(tier), 1200);
      }
    } catch (err) {
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#050505]/98 backdrop-blur-2xl z-[500] flex items-center justify-center p-6 overflow-y-auto font-sans">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `radial-gradient(#f39c12 1px, transparent 1px)`, backgroundSize: '20px 20px' }}></div>
      
      <div className="max-w-6xl w-full grid md:grid-cols-3 gap-8 py-16 relative z-10">
        <div className="group bg-[#0a0a0a] border border-zinc-800 p-10 rounded-[3rem] flex flex-col items-center text-center transition-all hover:border-zinc-600 shadow-2xl">
          <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-8 border border-zinc-800">
            <Zap size={32} className="text-zinc-600" />
          </div>
          <h3 className="text-2xl font-black mb-1 text-white tracking-tighter uppercase italic">Basic Play</h3>
          <p className="text-[10px] text-zinc-600 font-bold tracking-[0.2em] mb-4 uppercase">Free Draw Engine</p>
          <p className="text-4xl font-black mb-10 text-white tracking-tighter">FREE</p>
          <ul className="text-[11px] text-zinc-500 space-y-5 mb-12 text-left w-full font-bold uppercase tracking-widest">
            <li className="flex gap-4 items-start"><Check size={18} className="text-zinc-800" /> <span>1 Energy / 3 Ads Mining</span></li>
            <li className="flex gap-4 items-start"><Check size={18} className="text-zinc-800" /> <span>Standard Match Entry</span></li>
          </ul>
          <button 
            onClick={() => handleSubscribe('BASIC', 0)} 
            className="w-full py-6 bg-zinc-900 text-zinc-500 rounded-[1.8rem] font-black text-xs uppercase tracking-[0.2em] mt-auto hover:bg-white hover:text-black transition-all active:scale-95 shadow-xl"
          >
            Start Free Draw
          </button>
        </div>

        <div className="bg-[#0a0a0a] border-2 border-[#f39c12] p-10 rounded-[3rem] flex flex-col items-center text-center relative scale-110 shadow-[0_0_60px_rgba(243,156,18,0.15)] z-20">
          <div className="absolute -top-5 bg-[#f39c12] text-black text-[11px] font-black px-8 py-2 rounded-full uppercase tracking-tighter shadow-lg shadow-[#f39c12]/20">Recommended</div>
          <div className="w-16 h-16 bg-[#f39c12] rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(243,156,18,0.4)]">
            <Shield size={32} className="text-black" />
          </div>
          <h3 className="text-2xl font-black mb-1 text-white tracking-tighter uppercase italic">Smart Strategy</h3>
          <p className="text-[10px] text-[#f39c12] font-bold tracking-[0.2em] mb-4 uppercase">Tactical Utility Entry</p>
          <p className="text-4xl font-black mb-10 text-white tracking-tighter">1.0 <span className="text-xl text-[#f39c12]">π</span></p>
          <ul className="text-[11px] text-zinc-200 space-y-5 mb-12 text-left w-full font-bold uppercase tracking-widest">
            <li className="flex gap-4 items-start"><Check size={18} className="text-[#f39c12]" /> <span>Auto 5 Energy Daily</span></li>
            <li className="flex gap-4 items-start"><Check size={18} className="text-[#f39c12]" /> <span>1 Energy / 1 Ad Instant</span></li>
            <li className="flex gap-4 items-start"><Check size={18} className="text-[#f39c12]" /> <span>30% Ad Reduction</span></li>
          </ul>
          <button 
            disabled={!!loading} 
            onClick={() => handleSubscribe('PREMIUM', 1.0)} 
            className="w-full py-6 bg-[#f39c12] text-black rounded-[1.8rem] font-black text-xs uppercase tracking-[0.2em] mt-auto shadow-[0_10px_20px_rgba(243,156,18,0.3)] active:scale-95 transition-all flex justify-center items-center"
          >
            {loading === 'PREMIUM' ? <Loader2 className="animate-spin" size={24} /> : 'Tactical Entry'}
          </button>
        </div>

        <div className="group bg-[#0a0a0a] border border-purple-900/30 p-10 rounded-[3rem] flex flex-col items-center text-center transition-all hover:border-purple-600 shadow-2xl">
          <div className="w-16 h-16 bg-purple-950/20 rounded-2xl flex items-center justify-center mb-8 border border-purple-900/50">
            <Crown size={32} className="text-purple-500" />
          </div>
          <h3 className="text-2xl font-black mb-1 text-white tracking-tighter uppercase italic">Supreme Insider</h3>
          <p className="text-[10px] text-purple-400 font-bold tracking-[0.2em] mb-4 uppercase">Elite Ecosystem Access</p>
          <p className="text-4xl font-black mb-10 text-white tracking-tighter">3.0 <span className="text-xl text-purple-500">π</span></p>
          <ul className="text-[11px] text-zinc-500 space-y-5 mb-12 text-left w-full font-bold uppercase tracking-widest">
            <li className="flex gap-4 items-start"><Check size={18} className="text-purple-900" /> <span>Auto 10 Energy Daily</span></li>
            <li className="flex gap-4 items-start"><Check size={18} className="text-purple-900" /> <span>90% Ultra-Ad Reduction</span></li>
            <li className="flex gap-4 items-start"><Check size={18} className="text-purple-900" /> <span>Spirit Booster Access</span></li>
          </ul>
          <button 
            disabled={!!loading} 
            onClick={() => handleSubscribe('VIP', 3.0)} 
            className="w-full py-6 bg-purple-600 text-white rounded-[1.8rem] font-black text-xs uppercase tracking-[0.2em] mt-auto hover:bg-purple-500 transition-all active:scale-95 shadow-lg shadow-purple-900/20 flex justify-center items-center"
          >
             {loading === 'VIP' ? <Loader2 className="animate-spin" size={24} /> : 'Elite Access'}
          </button>
        </div>
      </div>
    </div>
  );
}