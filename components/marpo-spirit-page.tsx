"use client";
import React, { useState, useEffect } from 'react';
import SubscriptionModal from './subscription-modal';
import { CreditCard, Zap, Target, TrendingUp } from 'lucide-react';

const uiText: Record<string, any> = {
  en: { pool: "Eco-Credit Matching Pool", reveal: "Insider Reveal", vault: "Vault Balance", energy: "Energy" },
  ko: { pool: "에코 크레딧 매칭 풀", reveal: "인사이더 공개", vault: "금고 잔액", energy: "에너지" }
};

export default function MarpoSpiritPage({ lang }: { lang: string }) {
  const [currentTier, setCurrentTier] = useState<string | null>(null);
  const [energy, setEnergy] = useState(0);
  const [adCount, setAdCount] = useState(0);
  const [marpoBalance, setMarpoBalance] = useState(5300.0);
  const [revealedNumber, setRevealedNumber] = useState<number | null>(null);
  const [isReady, setIsReady] = useState(false);

  const text = uiText[lang] || uiText.en;

  useEffect(() => {
    const savedTier = localStorage.getItem('marpo_tier');
    if (savedTier) {
      setCurrentTier(savedTier);
      setEnergy(savedTier === 'VIP' ? 10 : 5);
    }
    setIsReady(true);
  }, []);

  const handleTierSelect = (tier: string) => {
    localStorage.setItem('marpo_tier', tier);
    setCurrentTier(tier);
    setEnergy(tier === 'VIP' ? 10 : 5);
  };

  const handleAdWatch = async () => {
    const Pi = (window as any).Pi;
    if (Pi?.Ads?.showAd) await Pi.Ads.showAd("interstitial");

    if (currentTier === 'BASIC') {
      const nextCount = adCount + 1;
      if (nextCount >= 3) {
        setEnergy(prev => prev + 1);
        setAdCount(0);
        alert("Energy Charged! (3/3)");
      } else {
        setAdCount(nextCount);
      }
    } else {
      setEnergy(prev => prev + 1);
      alert("Energy Charged Instantly!");
    }
  };

  const handleReveal = () => {
    if (marpoBalance < 1000) return alert("Insufficient MARPO.");
    setMarpoBalance(prev => prev - 1000);
    setRevealedNumber(Math.floor(Math.random() * 45) + 1);
  };

  if (!isReady) return null;
  if (!currentTier) return <SubscriptionModal onSelect={handleTierSelect} />;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 pb-40 flex flex-col items-center font-sans relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
           style={{ backgroundImage: `radial-gradient(#f39c12 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>

      <header className="w-full max-w-md flex justify-between items-center py-8 relative z-10">
        <div className="bg-zinc-900/50 px-5 py-3 rounded-2xl border border-[#f39c12]/30 shadow-[0_0_20px_rgba(243,156,18,0.05)]">
          <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.2em] mb-1">Tier Status</p>
          <p className="text-[#f39c12] font-black text-sm italic uppercase">{currentTier}</p>
        </div>
        <div className="bg-zinc-900/50 px-5 py-3 rounded-2xl border border-emerald-500/30 text-right shadow-[0_0_20px_rgba(16,185,129,0.05)]">
          <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.2em] mb-1">{text.energy}</p>
          <div className="flex items-center justify-end gap-2">
            <Zap size={14} className="text-emerald-500 animate-pulse" />
            <p className="text-white font-black text-sm">{energy} <span className="text-zinc-600">/ {currentTier === 'VIP' ? '10' : '5'}</span></p>
          </div>
        </div>
      </header>

      <section className="w-full max-w-md bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] p-10 rounded-[3rem] border border-[#f39c12]/20 mb-10 text-center shadow-2xl relative">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-1 bg-[#f39c12]/20 rounded-full"></div>
        <div className="flex justify-center mb-4 text-[#f39c12]/40"><TrendingUp size={20} /></div>
        <p className="text-[10px] text-zinc-600 uppercase font-black tracking-[0.3em] mb-3">{text.pool}</p>
        <p className="text-5xl font-black tracking-tighter text-white">3,141.59 <span className="text-[#f39c12] text-3xl font-black italic">π</span></p>
      </section>

      <div className="w-full max-w-md mb-10">
        <button onClick={handleReveal} className="w-full py-6 bg-zinc-900/40 border border-[#f39c12]/40 rounded-3xl flex flex-col items-center hover:bg-zinc-800 transition-all active:scale-95 group">
          <div className="flex items-center gap-2 mb-1">
            <Target size={16} className="text-[#f39c12] group-hover:rotate-90 transition-transform" />
            <p className="text-[#f39c12] font-black text-xs uppercase tracking-[0.2em]">{text.reveal}</p>
          </div>
          <p className="text-[9px] text-zinc-600 font-bold uppercase">Burn 1,000 MARPO Token</p>
        </button>
        {revealedNumber && <div className="mt-8 text-7xl font-black text-white text-center italic drop-shadow-[0_0_30px_rgba(243,156,18,0.5)]">{revealedNumber}</div>}
      </div>

      <div className="w-full max-w-md bg-zinc-900/20 border border-zinc-800/50 p-6 rounded-3xl mb-10 flex justify-between items-center text-left">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-zinc-800/50 rounded-xl text-[#f39c12]"><CreditCard size={20} /></div>
          <div>
            <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">{text.vault}</p>
            <p className="text-xl font-black text-white tracking-tighter">{marpoBalance.toLocaleString()} <span className="text-[#f39c12] text-xs">MARPO</span></p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-md mt-auto pb-6">
        <button 
          onClick={handleAdWatch} 
          className="w-full py-5 rounded-2xl font-black text-xs border-2 border-zinc-800 text-zinc-500 uppercase tracking-[0.3em] hover:border-[#f39c12] hover:text-[#f39c12] transition-all active:scale-95 bg-black/40 shadow-xl"
        >
          {currentTier === 'BASIC' ? `Mine Energy [AD ${adCount}/3]` : 'Quick Charge [Watch Ad]'}
        </button>
      </div>
    </div>
  );
}