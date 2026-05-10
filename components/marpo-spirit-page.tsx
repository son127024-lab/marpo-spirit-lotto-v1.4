"use client";
import React, { useState, useEffect } from 'react';
import { CreditCard, Zap, Target, TrendingUp, Send, RefreshCcw, Lock } from 'lucide-react';

// 🚩 준비된 45개 자원소 아이콘 파일명 매핑 (image_ce39fd.png 기준)
// 파일명이 숫자로 시작하므로 동적으로 매칭합니다.
const getElementIcon = (num: number) => {
  const iconMap: Record<number, string> = {
    1: "1-In.png", 2: "2-.png", 3: "3-.png", 4: "4-Y.png", 5: "5-.png",
    6: "6-As.png", 7: "7-.png", 8: "8-Th.png", 9: "9-Na.png", 10: "10-.png",
    11: "11-H.png", 12: "12-He.png", 13: "13-Ba.png", 14: "14-O.png", 15: "15-.png",
    16: "16-Li.png", 17: "17-.png", 18: "18-Ni.png", 19: "19-Co.png", 20: "20-Mn.png",
    21: "21-Fe.png", 22: "22-P.png", 23: "23-C.png", 24: "24-Si.png", 25: "25-S.png",
    26: "26-Se.png", 27: "27-Gu.png", 28: "28-.png", 29: "29-Te.png", 30: "30-Cd.png",
    31: "31-Ti.png", 32: "32-.png", 33: "33-Nb.png", 34: "34-H2.png", 35: "35-H2O.png",
    36: "2-.png", /* 36번 부재시 대용 */ 37: "37-O2.png", 38: "38-H2O2.png", 39: "39-Li-ion.png", 
    40: "40-na-ion.png", 41: "41-Li-S.png", 42: "42-.png", 43: "43-LiCoO2.png", 44: "44-.png", 45: "45-CH4+O2.png"
  };
  return `/elements/${iconMap[num] || `${num}-.png`}`;
};

const uiText: Record<string, any> = {
  en: { pool: "MAR-Ω Reward Pool", reveal: "Insider Reveal", vault: "My Vault", board: "Tactical Board", submit: "Submit Draw", adMine: "Watch Ad to Unlock Board" },
  ko: { pool: "MAR-Ω 보상 매칭 풀", reveal: "인사이더 공개", vault: "나의 Ω 금고", board: "전술 보드", submit: "번호 제출", adMine: "광고 시청 후 보드 잠금해제" }
};

export default function MarpoSpiritPage({ lang }: { lang: string }) {
  const [currentTier, setCurrentTier] = useState<string | null>(null);
  const [adCount, setAdCount] = useState(0);
  const [ohmBalance, setOhmBalance] = useState(5300.0);
  const [revealedNumber, setRevealedNumber] = useState<number | null>(null);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  
  const text = uiText[lang] || uiText.en;

  useEffect(() => {
    const savedTier = localStorage.getItem('marpo_tier');
    if (savedTier) setCurrentTier(savedTier);
  }, []);

  const isUnlocked = currentTier !== 'BASIC' || adCount >= 3;

  const handleAdWatch = () => {
    if (adCount < 3) {
      setAdCount(prev => prev + 1);
      alert(`Ad Session Complete (${adCount + 1}/3)`);
    }
  };

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
      {/* 사이버-럭셔리 배경 효과 */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none fixed" style={{ backgroundImage: `radial-gradient(#f39c12 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>

      <header className="w-full max-w-md flex justify-between items-center py-8 z-10">
        <div className="bg-zinc-900/50 px-6 py-4 rounded-2xl border border-[#f39c12]/30 shadow-xl">
          <p className="text-[11px] text-zinc-600 font-black mb-1 uppercase tracking-widest">Tier Status</p>
          <p className="text-[#f39c12] font-black text-base italic uppercase tracking-tighter">{currentTier}</p>
        </div>
        <div className="bg-zinc-900/50 px-6 py-4 rounded-2xl border border-emerald-500/30 text-right">
          <p className="text-[11px] text-zinc-600 font-black mb-1 uppercase tracking-widest">Energy</p>
          <p className="text-white font-black text-base uppercase">100%</p>
        </div>
      </header>

      {/* 리워드 풀 (20% 크게) */}
      <section className="w-full max-w-md bg-gradient-to-br from-[#1a1a1a] to-[#050505] p-12 rounded-[3.5rem] border border-[#f39c12]/20 mb-10 shadow-[0_0_50px_rgba(243,156,18,0.1)] text-center">
        <p className="text-sm text-zinc-600 font-black uppercase tracking-[0.3em] mb-4">{text.pool}</p>
        <div className="flex items-center justify-center gap-4">
          <p className="text-6xl font-black text-white tracking-tighter">5,314,159</p>
          <span className="text-[#f39c12] text-4xl font-black italic">Ω</span>
        </div>
      </section>

      {/* 인사이더 리빌 (20% 크게) */}
      <button onClick={handleReveal} className="w-full max-w-md py-7 bg-zinc-900/40 border border-[#f39c12]/40 rounded-[2rem] flex flex-col items-center mb-10 active:scale-95 transition-all group shadow-xl">
        <div className="flex items-center gap-3 mb-1">
          <Target size={24} className="text-[#f39c12] group-hover:rotate-90 transition-transform" />
          <p className="text-[#f39c12] font-black text-base uppercase tracking-widest">{text.reveal}</p>
        </div>
        <p className="text-xs text-zinc-600 font-bold uppercase italic tracking-wider">Burn 1,000 Ω for a hint</p>
      </button>

      {/* 🚩 전술 드로우 보드 (원소 아이콘 -> 번호 변환) */}
      <div className={`w-full max-w-md bg-zinc-900/30 border border-zinc-800 rounded-[3.5rem] p-8 mb-12 relative shadow-2xl ${!isUnlocked && 'opacity-50 grayscale'}`}>
        {!isUnlocked && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md rounded-[3.5rem] p-8 text-center">
            <Lock size={56} className="text-[#f39c12] mb-6 animate-pulse" />
            <p className="text-[#f39c12] font-black text-lg uppercase mb-8 leading-tight">{text.adMine}</p>
            <button onClick={handleAdWatch} className="px-10 py-5 bg-[#f39c12] text-black rounded-2xl font-black text-sm uppercase shadow-[0_0_30px_rgba(243,156,18,0.4)] active:scale-95 transition-all">Watch Ad ({adCount}/3)</button>
          </div>
        )}
        
        <div className="flex justify-between items-center mb-10">
          <h3 className="text-sm font-black text-[#f39c12] uppercase tracking-[0.3em] italic">{text.board}</h3>
          <button onClick={() => setSelectedNumbers([])} className="text-zinc-700 hover:text-white transition-colors"><RefreshCcw size={20} /></button>
        </div>
        
        {/* 상단 선택된 번호 표시 영역 (20% 크게) */}
        <div className="flex justify-between gap-3 mb-12">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-2xl font-black transition-all bg-cover bg-center ${selectedNumbers[i] ? 'border-[#f39c12] text-[#f39c12] bg-[#f39c12]/10 shadow-[0_0_20px_rgba(243,156,18,0.3)]' : 'border-zinc-800 text-zinc-800 bg-black/40'}`}>
              {selectedNumbers[i] || '?'}
            </div>
          ))}
        </div>

        {/* 1-45 원소 아이콘 그리드 (선택 시 번호 변환) */}
        <div className="grid grid-cols-6 gap-3">
          {[...Array(45)].map((_, i) => {
            const num = i + 1;
            const isSelected = selectedNumbers.includes(num);
            const isHint = revealedNumber === num;
            return (
              <button
                key={num}
                onClick={() => handleNumberToggle(num)}
                className={`relative aspect-square rounded-xl overflow-hidden transition-all duration-300 transform ${
                  isSelected ? 'border-2 border-[#f39c12] scale-110 z-10' : isHint ? 'border-2 border-[#f39c12] animate-pulse scale-105' : 'border border-zinc-800 hover:border-zinc-500'
                }`}
              >
                {/* 1. 기본 상태: 원소 아이콘 표시 */}
                <div 
                  className={`absolute inset-0 bg-cover bg-center transition-opacity duration-300 ${isSelected ? 'opacity-0' : 'opacity-100'}`}
                  style={{ backgroundImage: `url('${getElementIcon(num)}')` }}
                />
                
                {/* 2. 선택 상태: 황금색 번호로 변환 */}
                <div className={`absolute inset-0 flex items-center justify-center bg-[#f39c12]/20 transition-opacity duration-300 ${isSelected ? 'opacity-100' : 'opacity-0'}`}>
                  <span className="text-xl font-black text-[#f39c12] drop-shadow-[0_0_10px_rgba(243,156,18,1)]">{num}</span>
                </div>

                {/* 힌트 상태 표시 */}
                {isHint && !isSelected && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,1)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 하단 금고 (20% 크게) */}
      <div className="w-full max-w-md mt-auto bg-zinc-900/50 p-8 rounded-[3rem] border border-zinc-800 flex justify-between items-center shadow-2xl z-10">
         <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800"><p className="text-[#f39c12] font-black text-3xl italic">Ω</p></div>
           <div>
             <p className="text-xs text-zinc-600 font-black mb-1 uppercase tracking-widest">{text.vault}</p>
             <p className="text-2xl font-black text-white tracking-tighter">{ohmBalance.toLocaleString()} <span className="text-[#f39c12] text-sm underline font-black italic">OHM</span></p>
           </div>
         </div>
         <button 
           disabled={selectedNumbers.length < 6} 
           className={`flex items-center gap-4 px-12 py-5 rounded-2xl font-black text-base uppercase transition-all transform active:scale-95 ${selectedNumbers.length === 6 ? 'bg-[#f39c12] text-black shadow-[0_10px_30px_rgba(243,156,18,0.4)]' : 'bg-zinc-800 text-zinc-700'}`}
         >
           <Send size={24} /> {text.submit}
         </button>
      </div>
    </div>
  );
}