"use client";
import React, { useState, useEffect } from 'react';
import SubscriptionModal from './subscription-modal';
import { CreditCard, Zap, Target, TrendingUp, Send, RefreshCcw } from 'lucide-react';

const uiText: Record<string, any> = {
  en: { pool: "MAR-Ω Reward Pool", reveal: "Insider Reveal", vault: "Vault Balance", energy: "Energy", board: "Tactical Board", submit: "Submit Draw", reset: "Reset" },
  ko: { pool: "MAR-Ω 보상 매칭 풀", reveal: "인사이더 공개", vault: "나의 Ω 금고", energy: "에너지", board: "전술 보드", submit: "번호 제출", reset: "초기화" }
};

export default function MarpoSpiritPage({ lang }: { lang: string }) {
  const [currentTier, setCurrentTier] = useState<string | null>(null);
  const [energy, setEnergy] = useState(0);
  const [adCount, setAdCount] = useState(0);
  const [ohmBalance, setOhmBalance] = useState(5300.0); // MAR-Ω balance
  const [revealedNumber, setRevealedNumber] = useState<number | null>(null);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
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

  const handleNumberToggle = (num: number) => {
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter(n => n !== num));
    } else if (selectedNumbers.length < 6) {
      setSelectedNumbers([...selectedNumbers, num].sort((a, b) => a - b));
    }
  };

  const handleReveal = () => {
    if (ohmBalance < 1000) return alert("Insufficient MAR-Ω.");
    if (energy < 1) return alert("Low Energy.");
    setOhmBalance(prev => prev - 1000);
    setEnergy(prev => prev - 1);
    setRevealedNumber(Math.floor(Math.random() * 45) + 1);
  };

  const handleSubmit = () => {
    if (selectedNumbers.length < 6) return alert("Select 6 numbers.");
    alert(`Draw Submitted Successfully! Your Numbers: ${selectedNumbers.join(', ')}`);
  };

  if (!isReady) return null;
  if (!currentTier) return <SubscriptionModal onSelect={handleTierSelect} />;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 pb-40 flex flex-col items-center font-sans relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none fixed" 
           style={{ backgroundImage: `radial-gradient(#f39c12 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>

      <header className="w-full max-w-md flex justify-between items-center py-6 relative z-10">
        <div className="bg-zinc-900/50 px-4 py-2 rounded-xl border border-[#f39c12]/30 shadow-lg">
          <p className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.2em] mb-1">Tier Status</p>
          <p className="text-[#f39c12] font-black text-xs italic">{currentTier}</p>
        </div>
        <div className="bg-zinc-900/50 px-4 py-2 rounded-xl border border-emerald-500/30 text-right">
          <p className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.2em] mb-1">{text.energy}</p>
          <p className="text-white font-black text-xs">{energy} / {currentTier === 'VIP' ? '10' : '5'}</p>
        </div>
      </header>

      <section className="w-full max-w-md bg-gradient-to-br from-[#1a1a1a] to-[#050505] p-8 rounded-[3rem] border border-[#f39c12]/20 mb-6 shadow-2xl relative text-center">
        <div className="flex justify-center mb-3 text-[#f39c12]/50"><TrendingUp size={20} /></div>
        <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.3em] mb-2">{text.pool}</p>
        <div className="flex items-center justify-center gap-2">
          <p className="text-4xl font-black text-white tracking-tighter">5,314,159</p>
          <span className="text-[#f39c12] text-3xl font-black italic">Ω</span>
        </div>
      </section>

      <div className="w-full max-w-md mb-6">
        <button onClick={handleReveal} className="w-full py-5 bg-zinc-900/40 border border-[#f39c12]/40 rounded-2xl flex flex-col items-center hover:bg-zinc-800 transition-all active:scale-95 group">
          <div className="flex items-center gap-2 mb-1">
            <Target size={16} className="text-[#f39c12] group-hover:rotate-90 transition-transform" />
            <p className="text-[#f39c12] font-black text-xs uppercase tracking-[0.2em]">{text.reveal}</p>
          </div>
          <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-tighter italic">Burn 1,000 Ω to find a hint</p>
        </button>
        {revealedNumber && (
          <div className="mt-4 flex items-center justify-center gap-4 bg-black/40 py-4 rounded-2xl border border-[#f39c12]/10 animate-in slide-in-from-top-2">
            <span className="text-[9px] text-zinc-500 font-black uppercase tracking-tighter">Insider Hint Data:</span>
            <span className="text-3xl font-black text-[#f39c12] drop-shadow-[0_0_10px_rgba(243,156,18,0.5)]">Ω {revealedNumber}</span>
          </div>
        )}
      </div>

      <div className="w-full max-w-md bg-zinc-900/20 border border-zinc-800 rounded-[2.5rem] p-6 mb-8 shadow-inner">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[10px] font-black text-[#f39c12] uppercase tracking-[0.3em] italic">{text.board}</h3>
          <button onClick={() => setSelectedNumbers([])} className="text-zinc-700 hover:text-zinc-300 transition-colors">
            <RefreshCcw size={14} />
          </button>
        </div>
        
        <div className="flex justify-between gap-2 mb-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`w-11 h-11 rounded-xl border flex items-center justify-center text-sm font-black transition-all ${selectedNumbers[i] ? 'border-[#f39c12] bg-[#f39c12]/10 text-white shadow-[0_0_15px_rgba(243,156,18,0.2)]' : 'border-zinc-900 text-zinc-800 bg-black/20'}`}>
              {selectedNumbers[i] || '?'}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {[...Array(45)].map((_, i) => {
            const num = i + 1;
            const isSelected = selectedNumbers.includes(num);
            const isHint = revealedNumber === num;
            return (
              <button
                key={num}
                onClick={() => handleNumberToggle(num)}
                className={`aspect-square rounded-lg text-[10px] font-black transition-all ${
                  isSelected 
                  ? 'bg-[#f39c12] text-black shadow-lg scale-105' 
                  : isHint 
                  ? 'border-2 border-[#f39c12] text-[#f39c12] animate-pulse' 
                  : 'bg-zinc-900/50 text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-full max-w-md mt-auto flex flex-col gap-4">
        <div className="flex justify-between items-center bg-zinc-900/30 p-5 rounded-3xl border border-zinc-800 shadow-xl">
           <div className="flex items-center gap-4">
             <div className="p-3 bg-zinc-900 rounded-xl flex items-center justify-center"><p className="text-[#f39c12] font-black text-xl italic">Ω</p></div>
             <div>
               <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mb-1">{text.vault}</p>
               <p className="text-lg font-black text-white tracking-tighter">{ohmBalance.toLocaleString()} <span className="text-[#f39c12] text-[10px] italic underline">OHM</span></p>
             </div>
           </div>
           <button 
             onClick={handleSubmit}
             disabled={selectedNumbers.length < 6}
             className={`flex items-center gap-3 px-8 py-3 rounded-2xl font-black text-xs uppercase transition-all transform active:scale-95 ${selectedNumbers.length === 6 ? 'bg-[#f39c12] text-black shadow-[0_10px_20px_rgba(243,156,18,0.3)]' : 'bg-zinc-800 text-zinc-700'}`}
           >
             <Send size={16} /> {text.submit}
           </button>
        </div>
      </div>
    </div>
  );
}