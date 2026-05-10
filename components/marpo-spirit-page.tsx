"use client";
import React, { useState } from 'react';
import SubscriptionModal from './subscription-modal';

const uiText: Record<string, any> = {
  en: { pool: "Eco-Credit Matching Pool", reveal: "Insider Reveal", vault: "Vault Balance", energy: "Energy" },
  ko: { pool: "에코 크레딧 매칭 풀", reveal: "인사이더 공개", vault: "금고 잔액", energy: "에너지" }
};

// 🚩 lang 프로퍼티 추가
export default function MarpoSpiritPage({ lang }: { lang: string }) {
  const [currentTier, setCurrentTier] = useState<string | null>(null);
  const [marpoBalance, setMarpoBalance] = useState(5300.0);
  const [revealedNumber, setRevealedNumber] = useState<number | null>(null);
  
  // 🚩 선택된 언어에 맞는 텍스트 세트 선택
  const text = uiText[lang] || uiText.en;

  const handleReveal = () => {
    if (marpoBalance < 1000) return alert("Insufficient MARPO.");
    setMarpoBalance(prev => prev - 1000);
    setRevealedNumber(Math.floor(Math.random() * 45) + 1);
  };

  return (
    <div className="min-h-screen bg-[#0d1b3e] text-white p-4 flex flex-col items-center">
      {!currentTier && <SubscriptionModal onSelect={setCurrentTier} />}

      <header className="w-full max-w-md flex justify-between py-6">
        <div className="bg-black/40 px-4 py-2 rounded-xl border border-[#f39c12]/30">
          <p className="text-[9px] text-zinc-500 font-bold uppercase">{text.energy}</p>
          <p className="text-white font-black">10 / 10</p>
        </div>
      </header>

      <section className="w-full max-w-md bg-[#1a2a4e] p-8 rounded-[2.5rem] border border-[#f39c12]/20 mb-8 text-center">
        <p className="text-[10px] text-zinc-400 uppercase tracking-widest mb-2">{text.pool}</p>
        <p className="text-4xl font-black">3,141.59 π</p>
      </section>

      <button onClick={handleReveal} className="w-full max-w-md py-5 bg-black/40 border border-[#f39c12]/50 rounded-2xl mb-8">
        <p className="text-[#f39c12] font-black text-xs uppercase">{text.reveal}</p>
        <p className="text-[9px] text-zinc-500 uppercase">Burn 1,000 MARPO</p>
      </button>

      <div className="w-full max-w-md bg-black/30 p-6 rounded-2xl flex justify-between items-center text-left">
        <div>
          <p className="text-[9px] text-zinc-500 font-bold uppercase">{text.vault}</p>
          <p className="text-xl font-black">{marpoBalance.toLocaleString()} MARPO</p>
        </div>
      </div>
    </div>
  );
}