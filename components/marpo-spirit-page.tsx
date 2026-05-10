"use client";
import React, { useState, useEffect } from 'react';
import { CreditCard, Zap, Target, TrendingUp, Send, RefreshCcw, Lock } from 'lucide-react';

const uiText: Record<string, any> = {
  en: { pool: "MAR-Ω Reward Pool", reveal: "Insider Reveal", vault: "My Vault", energy: "Energy", board: "Tactical Board", submit: "Submit Draw", adMine: "Watch Ad to Unlock Board" },
  ko: { pool: "MAR-Ω 보상 매칭 풀", reveal: "인사이더 공개", vault: "나의 Ω 금고", energy: "에너지", board: "전술 보드", submit: "번호 제출", adMine: "광고 시청 후 보드 잠금해제" }
};

export default function MarpoSpiritPage({ lang }: { lang: string }) {
  const [currentTier, setCurrentTier] = useState<string | null>(null);
  const [energy, setEnergy] = useState(0);
  const [adCount, setAdCount] = useState(0); // 광고 시청 횟수
  const [ohmBalance, setOhmBalance] = useState(5300.0);
  const [revealedNumber, setRevealedNumber] = useState<number | null>(null);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  
  const text = uiText[lang] || uiText.en;

  useEffect(() => {
    const savedTier = localStorage.getItem('marpo_tier');
    if (savedTier) setCurrentTier(savedTier);
  }, []);

  const handleAdWatch = () => {
    if (adCount < 3) {
      setAdCount(prev => prev + 1);
      alert(`Ad Session Complete (${adCount + 1}/3)`);
    }
  };

  const isUnlocked = currentTier !== 'BASIC' || adCount >= 3;

  const handleNumberToggle = (num: number) => {
    if (!isUnlocked) return;
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter(n => n !== num));
    } else if (selectedNumbers.length < 6) {
      setSelectedNumbers([...selectedNumbers, num].sort((a, b) => a - b));
    }
  };

  const handleReveal = () => {
    if (ohmBalance < 1000) return alert("Insufficient MAR-Ω.");
    setOhmBalance(prev => prev - 1000);
    setRevealedNumber(Math.floor(Math.random() * 45) + 1);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 pb-44 flex flex-col items-center font-sans relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none fixed" style={{ backgroundImage: `radial-gradient(#f39c12 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>

      <header className="w-full max-w-md flex justify-between items-center py-8 z-10">
        <div className="bg-zinc-900/50 px-5 py-3 rounded-2xl border border-[#f39c12]/30 shadow-xl">
          <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em] mb-1">Tier Status</p>
          <p className="text-[#f39c12] font-black text-sm italic uppercase">{currentTier}</p>
        </div>
        <div className="bg-zinc-900/50 px-5 py-3 rounded-2xl border border-emerald-500/30 text-right">
          <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em] mb-1">{text.energy}</p>
          <p className="text-white font-black text-sm">{energy} / {currentTier === 'VIP' ? '10' : '5'}</p>
        </div>
      </header>

      {/* 중앙 리워드 풀 - MAR-Ω 적용 */}
      <section className="w-full max-w-md bg-gradient-to-br from-[#1a1a1a] to-[#050505] p-10 rounded-[3.5rem] border border-[#f39c12]/20 mb-8 shadow-2xl text-center">
        <div className="flex justify-center mb-4 text-[#f39c12]/50"><TrendingUp size={24} /></div>
        <p className="text-xs text-zinc-600 font-black uppercase tracking-[0.3em] mb-3">{text.pool}</p>
        <div className="flex items-center justify-center gap-3">
          <p className="text-5xl font-black text-white tracking-tighter">5,314,159</p>
          <span className="text-[#f39c12] text-3xl font-black italic">Ω</span>
        </div>
      </section>

      {/* 인사이더 리빌 버튼 */}
      <button onClick={handleReveal} className="w-full max-w-md py-6 bg-zinc-900/40 border border-[#f39c12]/40 rounded-3xl flex flex-col items-center mb-8 active:scale-95 transition-all group">
        <div className="flex items-center gap-3 mb-1">
          <Target size={20} className="text-[#f39c12] group-hover:rotate-90 transition-transform" />
          <p className="text-[#f39c12] font-black text-sm uppercase tracking-[0.2em]">{text.reveal}</p>
        </div>
        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest italic">Burn 1,000 Ω for a hint</p>
      </button>

      {/* 🚩 전술 드로우 보드 (잠금 로직 포함) */}
      <div className={`w-full max-w-md bg-zinc-900/20 border border-zinc-800 rounded-[3rem] p-8 mb-10 relative ${!isUnlocked && 'opacity-40 grayscale'}`}>
        {!isUnlocked && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-[3rem] p-6 text-center">
            <Lock size={48} className="text-[#f39c12] mb-4 animate-bounce" />
            <p className="text-[#f39c12] font-black text-base uppercase mb-6 tracking-tighter">{text.adMine}</p>
            <button onClick={handleAdWatch} className="px-8 py-4 bg-[#f39c12] text-black rounded-2xl font-black text-sm uppercase shadow-2xl active:scale-95 transition-all">
              Watch Ad ({adCount}/3)
            </button>
          </div>
        )}
        
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xs font-black text-[#f39c12] uppercase tracking-[0.3em] italic">{text.board}</h3>
          <button onClick={() => setSelectedNumbers([])} className="text-zinc-700 hover:text-white"><RefreshCcw size={18} /></button>
        </div>
        
        {/* 황금색 번호 슬롯 */}
        <div className="flex justify-between gap-3 mb-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-lg font-black transition-all ${selectedNumbers[i] ? 'border-[#f39c12] bg-[#f39c12]/20 text-[#f39c12] shadow-[0_0_20px_rgba(243,156,18,0.3)]' : 'border-zinc-800 text-zinc-800 bg-black/20'}`}>
              {selectedNumbers[i] || '?'}
            </div>
          ))}
        </div>

        {/* 1-45 황금색 그리드 */}
        <div className="grid grid-cols-7 gap-2">
          {[...Array(45)].map((_, i) => {
            const num = i + 1;
            const isSelected = selectedNumbers.includes(num);
            const isHint = revealedNumber === num;
            return (
              <button
                key={num}
                onClick={() => handleNumberToggle(num)}
                className={`aspect-square rounded-xl text-xs font-black transition-all ${
                  isSelected 
                  ? 'bg-[#f39c12] text-black shadow-2xl scale-110' 
                  : isHint 
                  ? 'border-2 border-[#f39c12] text-[#f39c12] animate-pulse' 
                  : 'bg-zinc-900/50 text-zinc-600 hover:bg-zinc-800'
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>
      </div>

      {/* 하단 금고 및 제출 */}
      <div className="w-full max-w-md mt-auto bg-zinc-900/40 p-6 rounded-[2.5rem] border border-zinc-800 shadow-2xl flex justify-between items-center">
         <div className="flex items-center gap-5">
           <div className="p-4 bg-zinc-900 rounded-2xl flex items-center justify-center"><p className="text-[#f39c12] font-black text-2xl italic">Ω</p></div>
           <div>
             <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mb-1">{text.vault}</p>
             <p className="text-xl font-black text-white tracking-tighter">{ohmBalance.toLocaleString()} <span className="text-[#f39c12] text-xs underline">OHM</span></p>
           </div>
         </div>
         <button disabled={selectedNumbers.length < 6} className={`flex items-center gap-3 px-10 py-4 rounded-2xl font-black text-sm uppercase transition-all transform active:scale-95 ${selectedNumbers.length === 6 ? 'bg-[#f39c12] text-black shadow-2xl' : 'bg-zinc-800 text-zinc-700'}`}>
           <Send size={20} /> {text.submit}
         </button>
      </div>
    </div>
  );
}