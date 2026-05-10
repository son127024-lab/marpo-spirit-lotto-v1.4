"use client";
import React, { useState, useEffect } from 'react';
import SubscriptionModal from './subscription-modal';

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
  
  const text = uiText[lang] || uiText.en;

  useEffect(() => {
    const savedTier = localStorage.getItem('marpo_tier');
    if (savedTier) {
      setCurrentTier(savedTier);
      setEnergy(savedTier === 'VIP' ? 10 : 5);
    }
  }, []);

  const handleTierSelect = (tier: string) => {
    localStorage.setItem('marpo_tier', tier);
    setCurrentTier(tier);
    setEnergy(tier === 'VIP' ? 10 : 5);
  };

  const handleAdWatch = async () => {
    if (currentTier === 'BASIC') {
      const nextCount = adCount + 1;
      if (nextCount >= 3) {
        setEnergy(prev => prev + 1);
        setAdCount(0);
        alert("Energy Charged! (3/3)");
      } else {
        setAdCount(nextCount);
        alert(`Ad Watched (${nextCount}/3)`);
      }
    } else {
      setEnergy(prev => prev + 1);
      alert("Energy Charged Instantly!");
    }
  };

  const handleReveal = () => {
    if (marpoBalance < 1000) return alert("Insufficient MARPO.");
    if (confirm("Burn 1,000 MARPO to reveal 1 number?")) {
      setMarpoBalance(prev => prev - 1000);
      setRevealedNumber(Math.floor(Math.random() * 45) + 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1b3e] text-white p-4 pb-40 flex flex-col items-center font-sans">
      {!currentTier && <SubscriptionModal onSelect={handleTierSelect} />}

      <header className="w-full max-w-md flex justify-between items-center py-6">
        <div className="bg-black/40 px-4 py-2 rounded-xl border border-[#f39c12]/30">
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{text.energy}</p>
          <p className="text-white font-black">{energy} / {currentTier === 'VIP' ? '10' : '5'}</p>
        </div>
      </header>

      <section className="w-full max-w-md bg-[#1a2a4e] p-8 rounded-[2.5rem] border border-[#f39c12]/20 mb-8 text-center shadow-2xl">
        <p className="text-[10px] text-zinc-400 uppercase tracking-widest mb-2">{text.pool}</p>
        <p className="text-4xl font-black">3,141.59 <span className="text-[#f39c12] text-2xl">π</span></p>
      </section>

      <div className="w-full max-w-md mb-8">
        <button onClick={handleReveal} className="w-full py-5 bg-black/40 border border-[#f39c12]/50 rounded-2xl flex flex-col items-center active:scale-95 transition-transform">
          <p className="text-[#f39c12] font-black text-sm uppercase tracking-widest mb-1">{text.reveal}</p>
          <p className="text-[10px] text-zinc-500 uppercase">Burn 1,000 MARPO</p>
        </button>
        {revealedNumber && <div className="mt-6 text-5xl font-black text-[#f39c12] animate-bounce text-center">{revealedNumber}</div>}
      </div>

      <div className="w-full max-w-md bg-black/30 border border-zinc-800 p-6 rounded-2xl mb-8 flex justify-between items-center text-left">
        <div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{text.vault}</p>
          <p className="text-xl font-black text-white">{marpoBalance.toLocaleString()} <span className="text-[#f39c12] text-sm">MARPO</span></p>
        </div>
      </div>

      <div className="w-full max-w-md mt-auto">
        <button onClick={handleAdWatch} className="w-full py-4 rounded-2xl font-black text-sm border-2 border-zinc-800 text-zinc-400 uppercase tracking-widest hover:border-[#f39c12] hover:text-[#f39c12] transition-colors active:scale-95">
          {currentTier === 'BASIC' ? `MINE ENERGY (AD ${adCount}/3)` : 'QUICK CHARGE (WATCH AD)'}
        </button>
      </div>
    </div>
  );
}