"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Target, Send, RefreshCcw, Lock, Clock, Pickaxe, Loader2 } from 'lucide-react';

// 🚩 45개 원소 아이콘 매핑 (대표님 수정 최종본 유지)
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
  43: "43-.png", // 43번 매핑 고정
  44: "44-.png", 45: "45-CH4+O2.png"
};

const getElementIcon = (num: number) => `/elements/${iconMap[num] || `${num}-.png`}`;

// 가이드 대사
const guideLines = [
  "파이오니어님 이제 MAR 에너지 채굴 탐색을 시작합니다.",
  "아래의 원소 중 6개의 원소 샘플을 선택하세요.",
  "광부가 채굴한 원소가 샘플과 일치하면, Ω 에너지 크레딧을 획득합니다.",
  "자 샘플 선택 후 채굴 버튼을 누르세요!"
];

export default function MarpoSpiritPage({ lang }: { lang: string }) {
  const [gameState, setGameState] = useState<'idle' | 'mining' | 'result'>('idle');
  const [adCount, setAdCount] = useState(0); 
  const [ohmBalance, setOhmBalance] = useState(5300.0);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [minedNumbers, setMinedNumbers] = useState<number[]>([]);
  const [matchCount, setMatchCount] = useState(0);
  const [wonAmount, setWonAmount] = useState(0);
  const [lineIdx, setLineIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setLineIdx((p) => (p + 1) % guideLines.length), 4000);
    return () => clearInterval(interval);
  }, []);

  const isUnlocked = adCount >= 3;

  const handleMining = () => {
    if (selectedNumbers.length < 6) return alert("원소 샘플 6개를 선택해주세요!");
    setGameState('mining');

    // 영상 재생 시간에 맞춘 6초 대기
    setTimeout(() => {
      const results: number[] = [];
      while (results.length < 6) {
        const n = Math.floor(Math.random() * 45) + 1;
        if (!results.includes(n)) results.push(n);
      }
      const matches = selectedNumbers.filter(n => results.includes(n)).length;
      const rewards: Record<number, number> = { 0:0, 1:10, 2:100, 3:1000, 4:4000, 5:8000, 6:314159 };
      const reward = rewards[matches] || 0;

      setMinedNumbers(results);
      setMatchCount(matches);
      setWonAmount(reward);
      setOhmBalance(prev => prev + reward);
      setGameState('result');
    }, 6000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 pb-48 flex flex-col items-center font-sans relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none fixed" style={{ backgroundImage: `radial-gradient(#f39c12 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>

      {/* 가이드 내비게이터 */}
      <div className="w-full max-w-md mt-4 mb-8 flex items-start gap-6 relative z-20">
        <div className="relative w-28 h-28 shrink-0 bg-gradient-to-tr from-black to-zinc-900 rounded-full border-4 border-amber-500 shadow-[0_0_30px_rgba(243,156,18,0.3)] flex items-center justify-center overflow-hidden animate-bounce-slow">
           <Image src="/marpo-stage-1.png" alt="Rabbit" fill className="object-cover scale-110" priority unoptimized />
        </div>
        <div className="relative flex-1 bg-zinc-900/70 border border-zinc-800 rounded-[2.5rem] p-7 shadow-2xl backdrop-blur-xl min-h-[120px] flex items-center">
          <div className="absolute top-10 -left-4 w-0 h-0 border-t-[12px] border-t-transparent border-r-[20px] border-r-zinc-800 border-b-[12px] border-b-transparent"></div>
          <p className="text-[18px] font-bold text-zinc-200 leading-relaxed italic px-2">"{guideLines[lineIdx]}"</p>
        </div>
      </div>

      {/* 🚩 [핵심 수정] 시네마틱 채굴 영상 오버레이 */}
      {gameState === 'mining' && (
        <div className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center p-0 animate-in fade-in duration-700">
          <div className="relative w-full h-full flex flex-col items-center justify-center">
             {/* 🚩 채굴 비디오 재생 (자동재생, 무음, 반복) */}
             <video 
               autoPlay 
               muted 
               loop 
               playsInline 
               className="absolute inset-0 w-full h-full object-cover opacity-80"
             >
               <source src="/mining-video.mp4" type="video/mp4" />
             </video>
             
             {/* 영상 위 오버레이 효과 */}
             <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-60"></div>
             
             <div className="relative z-10 flex flex-col items-center gap-6">
                <div className="w-24 h-24 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-4xl font-black text-amber-500 uppercase tracking-[0.4em] drop-shadow-[0_0_20px_rgba(243,156,18,0.8)]">
                  Mining In Progress
                </p>
                <p className="text-zinc-400 font-bold italic animate-pulse text-lg">대표님, 화성에서 Ω 에너지를 정밀 추출 중입니다...</p>
             </div>
          </div>
        </div>
      )}

      {/* 결과 보고 모달 (이전과 동일) */}
      {gameState === 'result' && (
        <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 animate-in zoom-in duration-300">
          <div className="bg-zinc-900 border-2 border-amber-600 rounded-[4rem] p-12 w-full max-w-md text-center shadow-2xl">
            <div className="w-28 h-28 bg-black rounded-full mx-auto mb-8 border-2 border-amber-500 flex items-center justify-center overflow-hidden">
               <Image src="/miner-character.png" alt="Miner" width={100} height={100} unoptimized />
            </div>
            <h2 className="text-3xl font-black text-white mb-6 italic uppercase">Exploration Report!</h2>
            <div className="bg-black/60 rounded-3xl p-6 mb-10 border border-zinc-800 text-center">
              <div className="flex justify-center gap-2 mb-6">
                {minedNumbers.map(n => (
                  <div key={n} className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-black ${selectedNumbers.includes(n) ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-600'}`}>
                    {n}
                  </div>
                ))}
              </div>
              <p className="text-amber-500 text-2xl font-black italic">{matchCount} Elements Matched!</p>
            </div>
            <div className="mb-12">
              <p className="text-5xl font-black text-white tracking-tighter">+{wonAmount.toLocaleString()} <span className="text-amber-500 italic">Ω</span></p>
            </div>
            <button onClick={() => { setGameState('idle'); setSelectedNumbers([]); }} className="w-full py-6 bg-amber-500 text-black rounded-2xl font-black text-xl uppercase shadow-2xl active:scale-95 transition-all">
              Confirm & Return
            </button>
          </div>
        </div>
      )}

      {/* 리워드 풀 & 드로우 보드 (기존 UI 유지) */}
      <section className="w-full max-w-md bg-gradient-to-br from-[#1a1a1a] to-[#050505] p-12 rounded-[3.5rem] border border-[#f39c12]/20 mb-10 shadow-2xl text-center">
        <p className="text-xs text-zinc-600 font-black uppercase tracking-[0.4em] mb-3">MAR-Ω Reward Pool Matching</p>
        <div className="flex items-center justify-center gap-4">
          <p className="text-6xl font-black text-white tracking-tighter font-mono">5,314,159</p>
          <span className="text-[#f39c12] text-4xl font-black italic">Ω</span>
        </div>
      </section>

      {/* 🚩 인사이더 리빌 (무한 깜빡임) */}
      <button onClick={handleReveal} className="w-full max-w-md py-7 bg-zinc-900/40 border border-[#f39c12]/40 rounded-3xl flex flex-col items-center mb-10 active:scale-95 transition-all">
        <div className="flex items-center gap-3 mb-1.5"><Target size={20} className="text-[#f39c12]" /><p className="text-[#f39c12] font-black text-sm uppercase tracking-[0.2em]">Insider Reveal</p></div>
        <p className="text-[16px] font-black uppercase tracking-widest italic text-lime-300 animate-infinite-blink">
          Burn 1,000 Ω for a hint
        </p>
      </button>

      {/* 전술 보드 */}
      <div className={`w-full max-w-md bg-zinc-900/30 border border-zinc-800 rounded-[3.5rem] p-8 mb-12 relative shadow-2xl ${!isUnlocked && 'opacity-50 grayscale'}`}>
        {!isUnlocked && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md rounded-[3.5rem] p-8 text-center">
            <Lock size={56} className="text-[#f39c12] mb-6 animate-pulse" />
            <p className="text-[#f39c12] font-black text-lg uppercase mb-8">Watch 3 Ads to Unlock</p>
            <button onClick={() => setAdCount(3)} className="px-10 py-5 bg-[#f39c12] text-black rounded-2xl font-black text-sm uppercase">Unlock (Debug)</button>
          </div>
        )}
        <div className="grid grid-cols-6 gap-3">
          {[...Array(45)].map((_, i) => {
            const num = i + 1;
            const isSelected = selectedNumbers.includes(num);
            return (
              <button key={num} onClick={() => isUnlocked && setSelectedNumbers(prev => isSelected ? prev.filter(n => n !== num) : (prev.length < 6 ? [...prev, num].sort((a,b)=>a-b) : prev))} className={`relative aspect-square rounded-xl overflow-hidden transition-all duration-300 transform ${isSelected ? 'border-2 border-amber-500 scale-110 z-10' : 'border border-zinc-800'}`}>
                <div className={`absolute inset-0 bg-cover bg-center transition-opacity ${isSelected ? 'opacity-0' : 'opacity-100'}`} style={{ backgroundImage: `url('${getElementIcon(num)}')` }} />
                <div className={`absolute inset-0 flex items-center justify-center bg-amber-500/20 ${isSelected ? 'opacity-100' : 'opacity-0'}`}>
                  <span className="text-2xl font-black text-amber-500">{num}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 하단 금고 & 채굴 시작 */}
      <div className="w-full max-w-md mt-auto bg-zinc-900/50 p-8 rounded-[3.5rem] border border-zinc-800 flex justify-between items-center shadow-2xl">
         <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 text-amber-500 font-black text-3xl">Ω</div>
           <div>
             <p className="text-xs text-zinc-600 font-black mb-1 uppercase tracking-widest tracking-tighter">Vault Authorized</p>
             <p className="text-2xl font-black text-white italic">{ohmBalance.toLocaleString()} <span className="text-amber-500 text-sm">OHM</span></p>
           </div>
         </div>
         <button onClick={handleMining} disabled={selectedNumbers.length < 6} className={`flex items-center gap-4 px-12 py-5 rounded-3xl font-black text-base uppercase transition-all transform active:scale-95 ${selectedNumbers.length === 6 ? 'bg-amber-500 text-black shadow-2xl' : 'bg-zinc-800 text-zinc-700'}`}>
           <Pickaxe size={24} /> Mining Start
         </button>
      </div>

      <style jsx global>{`
        @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        @keyframes neon-blink { 0%, 100% { opacity: 1; text-shadow: 0 0 15px rgba(163,230,53,1); } 50% { opacity: 0.1; } }
        .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
        .animate-infinite-blink { animation: neon-blink 1s linear infinite; }
      `}</style>
    </div>
  );
}