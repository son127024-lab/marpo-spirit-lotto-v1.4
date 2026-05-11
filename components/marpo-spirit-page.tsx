"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Target, Send, RefreshCcw, Lock, Clock } from 'lucide-react';

// 🚩 45개 원소 아이콘 매핑 (36번 추가 및 43번 수정 완료)
const iconMap: Record<number, string> = {
  1: "1-In.png", 2: "2-.png", 3: "3-.png", 4: "4-Y.png", 5: "5-.png",
  6: "6-As.png", 7: "7-.png", 8: "8-Th.png", 9: "9-Na.png", 10: "10-.png",
  11: "11-H.png", 12: "12-He.png", 13: "13-Ba.png", 14: "14-O.png", 15: "15-.png",
  16: "16-Li.png", 17: "17-.png", 18: "18-Ni.png", 19: "19-Co.png", 20: "20-Mn.png",
  21: "21-Fe.png", 22: "22-P.png", 23: "23-C.png", 24: "24-Si.png", 25: "25-S.png",
  26: "26-Se.png", 27: "27-Gu.png", 28: "28-.png", 29: "29-Te.png", 30: "30-Cd.png",
  31: "31-Ti.png", 32: "32-.png", 33: "33-Nb.png", 34: "34-H2.png", 35: "35-H2O.png",
  36: "36-.png", 37: "37-O2.png", 38: "38-H2O2.png", 39: "39-Li-ion.png",
  40: "40-na-ion.png", 41: "41-Li-S.png", 42: "42-.png", 
  43: "43-.png", // 대표님 수정 최종본 고정
  44: "44-.png", 45: "45-CH4+O2.png"
};

const getElementIcon = (num: number) => `/elements/${iconMap[num] || `${num}-.png`}`;

// 🚩 시간 추격자 토끼 가이드 대사 로직 (이상한 나라의 토끼 세계관)
const rabbitGuides: Record<string, any> = {
  ko: [
    { stage: "Ω Gold Rush", msg: "파이오니어님, Ω의 가치가 고갈되기 전에 잡으세요! MAR 에너지를 채굴 할 시간 입니다!", color: "border-amber-500", text: "text-amber-500", fallback: "🐇" },
    { stage: "Industrial Era", msg: "산업 혁명 가동! 인사이더 Reveal로 더 정교하게 Ω를 예측하세요.", color: "border-blue-500", text: "text-blue-400", fallback: "⚙️" },
    { stage: "Web3 Protocol", msg: "진정한 경제적 저항의 시대입니다. MARPO 스왑으로 프로토콜의 주인이 되십시오.", color: "border-emerald-500", text: "text-emerald-400", fallback: "💻" }
  ],
  en: [
    { stage: "Ω Gold Rush", msg: "CEO, mine Ω before it depreciates! Time in the gold fields is ticking!", color: "border-amber-500", text: "text-amber-500", fallback: "🐇" },
    { stage: "Industrial Era", msg: "Industrial revolution active! Strategic precise logic with Insider Reveal.", color: "border-blue-500", text: "text-blue-400", fallback: "⚙️" },
    { stage: "Web3 Protocol", msg: "Web3 is the protocol. True economical resistance starts now. Prepare for MARPO Swap.", color: "border-emerald-500", text: "text-emerald-400", fallback: "💻" }
  ]
};

const uiText: Record<string, any> = {
  en: { pool: "MAR-Ω Reward Matching", reveal: "Insider Reveal", vault: "Vault Authorized", board: "Tactical Board", submit: "Submit Draw", adMine: "Watch 3 Ads to Unlock Board" },
  ko: { pool: "MAR-Ω 보상 매칭", reveal: "인사이더 공개", vault: "인증된 금고 상태", board: "전술 보드", submit: "번호 제출", adMine: "광고 3회 시청 후 보드 잠금해제" }
};

export default function MarpoSpiritPage({ lang }: { lang: string }) {
  const [currentTier, setCurrentTier] = useState<string | null>(null);
  const [adCount, setAdCount] = useState(0); 
  const [ohmBalance, setOhmBalance] = useState(5300.0);
  const [revealedNumber, setRevealedNumber] = useState<number | null>(null);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  
  const text = uiText[lang] || uiText.en;
  const stageIdx = ohmBalance > 50000 ? 2 : ohmBalance > 10000 ? 1 : 0;
  const rabbit = rabbitGuides[lang === 'ko' ? 'ko' : 'en'][stageIdx];
  const rabbitImgPath = `/marpo-stage-${stageIdx}.png`;

  useEffect(() => {
    console.log("Rabbit Guide Active Path:", rabbitImgPath);
    const savedTier = localStorage.getItem('marpo_tier');
    if (savedTier) setCurrentTier(savedTier);
  }, [rabbitImgPath]);

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
    <div className="min-h-screen bg-[#050505] text-white p-6 pb-48 flex flex-col items-center font-sans relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none fixed" style={{ backgroundImage: `radial-gradient(#f39c12 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>

      {/* 🐇 캐릭터 가이드 & 말풍선 섹션 (이상한 나라의 토끼) */}
      <div className="w-full max-w-md mt-4 mb-8 flex items-start gap-6 relative z-20">
        <div className={`relative w-28 h-28 shrink-0 bg-gradient-to-tr from-black to-zinc-900 rounded-full border-4 ${rabbit.color} shadow-[0_0_30px_rgba(243,156,18,0.3)] flex items-center justify-center overflow-hidden animate-bounce-slow`}>
           <Image 
             src={rabbitImgPath} 
             alt="Guide Rabbit" 
             fill 
             className="object-cover scale-110"
             priority
             unoptimized
             onError={(e) => { e.currentTarget.style.display = 'none'; }}
           />
           <div className="absolute inset-0 flex items-center justify-center text-5xl select-none bg-black z-[-1]">
             {rabbit.fallback}
           </div> 
        </div>

        <div className="relative flex-1 bg-zinc-900/70 border border-zinc-800 rounded-[2.5rem] p-7 shadow-2xl backdrop-blur-xl">
          <div className="absolute top-10 -left-4 w-0 h-0 border-t-[12px] border-t-transparent border-r-[20px] border-r-zinc-800 border-b-[12px] border-b-transparent"></div>
          <div className="absolute top-10 -left-[14px] w-0 h-0 border-t-[12px] border-t-transparent border-r-[20px] border-r-zinc-900/70 border-b-[12px] border-b-transparent"></div>
          <div className="flex items-center gap-3 mb-2 px-2">
            <Clock size={18} className={rabbit.text} />
            <span className={`text-[11px] font-black uppercase tracking-[0.4em] ${rabbit.text}`}>{rabbit.stage}</span>
          </div>
          <p className="text-[18px] font-bold text-zinc-200 leading-relaxed italic px-2">"{rabbit.msg}"</p>
        </div>
      </div>

      <header className="w-full max-w-md flex justify-between items-center py-6 z-10">
        <div className="bg-zinc-900/50 px-6 py-4 rounded-2xl border border-[#f39c12]/30 shadow-xl text-center">
          <p className="text-[11px] text-zinc-600 font-black mb-1 uppercase tracking-widest italic tracking-tighter">Partner</p>
          <p className="text-[#f39c12] font-black text-base italic uppercase">K1 MANAGEMENT</p>
        </div>
        <div className="bg-zinc-900/50 px-6 py-4 rounded-2xl border border-emerald-500/30 text-right">
          <p className="text-[11px] text-zinc-600 font-black mb-1 uppercase tracking-widest italic tracking-tighter">Vault Status</p>
          <p className="text-white font-black text-base uppercase tracking-tighter">Authorized</p>
        </div>
      </header>

      <section className="w-full max-w-md bg-gradient-to-br from-[#1a1a1a] to-[#050505] p-12 rounded-[3.5rem] border border-[#f39c12]/20 mb-10 shadow-2xl text-center">
        <p className="text-xs text-zinc-600 font-black uppercase tracking-[0.4em] mb-3">{text.pool}</p>
        <div className="flex items-center justify-center gap-4">
          <p className="text-6xl font-black text-white tracking-tighter">5,314,159</p>
          <span className="text-[#f39c12] text-4xl font-black italic">Ω</span>
        </div>
      </section>

      {/* 🚩 인사이더 리빌 버튼 (네온 블링킹 + 50% 확대) */}
      <button onClick={handleReveal} className="w-full max-w-md py-7 bg-zinc-900/40 border border-[#f39c12]/40 rounded-3xl flex flex-col items-center mb-10 active:scale-95 transition-all">
        <div className="flex items-center gap-3 mb-1.5"><Target size={20} className="text-[#f39c12]" /><p className="text-[#f39c12] font-black text-sm uppercase tracking-[0.2em]">{text.reveal}</p></div>
        <p className="text-[16px] font-black uppercase tracking-widest italic text-lime-300 drop-shadow-[0_0_15px_rgba(163,230,53,0.9)] animate-infinite-blink">
          Burn 1,000 Ω for a hint
        </p>
      </button>

      <div className={`w-full max-w-md bg-zinc-900/30 border border-zinc-800 rounded-[3.5rem] p-8 mb-12 relative shadow-2xl ${!isUnlocked && 'opacity-50 grayscale'}`}>
        {!isUnlocked && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md rounded-[3.5rem] p-8 text-center">
            <Lock size={60} className="text-[#f39c12] mb-6 animate-pulse" />
            <p className="text-[#f39c12] font-black text-xl uppercase mb-8 leading-tight tracking-tighter">{text.adMine}</p>
            <button onClick={handleAdWatch} className="px-10 py-5 bg-[#f39c12] text-black rounded-2xl font-black text-sm uppercase shadow-2xl active:scale-95 transition-all">Watch Ad ({adCount}/3)</button>
          </div>
        )}
        
        <div className="flex justify-between items-center mb-10 px-2 text-sm font-bold">
          <h3 className="font-black text-[#f39c12] uppercase tracking-[0.3em] italic">{text.board}</h3>
          <button onClick={() => setSelectedNumbers([])} className="text-zinc-700 hover:text-white"><RefreshCcw size={22} /></button>
        </div>
        
        <div className="flex justify-between gap-3 mb-12">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-2xl font-black transition-all ${selectedNumbers[i] ? 'border-[#f39c12] text-[#f39c12] bg-[#f39c12]/10 shadow-[0_0_20px_rgba(243,156,18,0.3)]' : 'border-zinc-800 text-zinc-800 bg-black/40'}`}>
              {selectedNumbers[i] || '?'}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-6 gap-3">
          {[...Array(45)].map((_, i) => {
            const num = i + 1;
            const isSelected = selectedNumbers.includes(num);
            const isHint = revealedNumber === num;
            return (
              <button key={num} onClick={() => handleNumberToggle(num)} className={`relative aspect-square rounded-xl overflow-hidden transition-all duration-300 transform ${isSelected ? 'border-2 border-[#f39c12] scale-110 z-10' : isHint ? 'border-2 border-[#f39c12] animate-pulse scale-105' : 'border border-zinc-800'}`}>
                <div className={`absolute inset-0 bg-cover bg-center transition-opacity ${isSelected ? 'opacity-0' : 'opacity-100'}`} style={{ backgroundImage: `url('${getElementIcon(num)}')` }} />
                <div className={`absolute inset-0 flex items-center justify-center bg-[#f39c12]/20 ${isSelected ? 'opacity-100' : 'opacity-0'}`}>
                  <span className="text-2xl font-black text-[#f39c12] drop-shadow-[0_0_10px_rgba(243,156,18,1)]">{num}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-full max-w-md mt-auto bg-zinc-900/50 p-8 rounded-[3rem] border border-zinc-800 flex justify-between items-center shadow-2xl z-10">
         <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 text-[#f39c12] font-black text-3xl italic">Ω</div>
           <div>
             <p className="text-xs text-zinc-600 font-black mb-1 uppercase tracking-widest italic tracking-tighter">Vault authorized</p>
             <p className="text-3xl font-black text-white tracking-tighter italic">{ohmBalance.toLocaleString()} <span className="text-[#f39c12] text-sm underline font-black italic">OHM</span></p>
           </div>
         </div>
         <button disabled={selectedNumbers.length < 6} className={`flex items-center gap-3 px-12 py-5 rounded-3xl font-black text-base uppercase transition-all transform active:scale-95 ${selectedNumbers.length === 6 ? 'bg-[#f39c12] text-black shadow-2xl' : 'bg-zinc-800 text-zinc-700'}`}>
           <Send size={24} /> Submit
         </button>
      </div>

      <style jsx global>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes neon-blink {
          0%, 100% { opacity: 1; text-shadow: 0 0 15px rgba(163,230,53,1), 0 0 30px rgba(163,230,53,0.5); }
          50% { opacity: 0.1; text-shadow: none; }
        }
        .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
        .animate-infinite-blink { animation: neon-blink 1s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>
    </div>
  );
}