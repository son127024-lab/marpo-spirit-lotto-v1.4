"use client";
import React, { useState } from 'react';
import Image from 'next/image';

export default function MarpoSpiritPage() {
  const [marpoBalance, setMarpoBalance] = useState(5300.0);
  const [revealedNumber, setRevealedNumber] = useState<number | null>(null);

  // 🚩 핵심: 1,000 MARPO 소각하여 번호 1개 미리보기
  const handleReveal = () => {
    if (marpoBalance < 1000) return alert("토큰이 부족합니다.");
    if (confirm("1,000 MARPO를 소각하시겠습니까?")) {
      setMarpoBalance(prev => prev - 1000);
      setRevealedNumber(Math.floor(Math.random() * 45) + 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1b3e] text-white flex flex-col items-center p-4 text-center">
      <header className="pt-10 mb-10">
        <h1 className="text-[#f39c12] text-5xl font-black italic">SPIRIT DRAW</h1>
        <p className="text-zinc-500 text-xs tracking-widest mt-2">lottoworld.pi (Infrastructure)</p>
      </header>

      {/* 에코 크레딧 풀 */}
      <section className="w-full max-w-md bg-[#1a2a4e] p-8 rounded-[2.5rem] border border-[#f39c12]/20 mb-8">
        <p className="text-[10px] text-zinc-400 uppercase tracking-widest mb-2">Eco-Credit Matching Pool</p>
        <p className="text-4xl font-black">3,141.59 π</p>
      </section>

      {/* Insider Reveal (토큰 소각) */}
      <div className="w-full max-w-md mb-8">
        <button onClick={handleReveal} className="w-full py-4 bg-black/40 border border-[#f39c12]/50 rounded-2xl">
          <p className="text-[#f39c12] font-black text-xs uppercase">Insider Reveal</p>
          <p className="text-[10px] text-zinc-500">Burn 1,000 MARPO to reveal 1 number</p>
        </button>
        {revealedNumber && <div className="mt-4 text-4xl font-black text-[#f39c12] animate-bounce">{revealedNumber}</div>}
      </div>

      <p className="text-zinc-600 text-[10px]">Your Vault: {marpoBalance.toLocaleString()} MARPO</p>
      {/* 여기에 기존 번호 선택 UI 로직을 붙여넣으시면 됩니다 */}
    </div>
  );
}