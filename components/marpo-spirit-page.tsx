"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Target, Send, RefreshCcw, Lock, Clock, Pickaxe, Loader2 } from 'lucide-react';

// 🚩 아이콘 매핑 (36, 43번 수정본 포함 고정)
const iconMap: Record<number, string> = {
  1: "1-In.png", 2: "2-.png", 3: "3-.png", 4: "4-Y.png", 5: "5-.png",
  6: "6-As.png", 7: "7-.png", 8: "8-Th.png", 9: "9-Na.png", 10: "10-.png",
  11: "11-H.png", 12: "12-He.png", 13: "13-Ba.png", 14: "14-O.png", 15: "15-.png",
  16: "16-Li.png", 17: "17-.png", 18: "18-Ni.png", 19: "19-Co.png", 20: "20-Mn.png",
  21: "21-Fe.png", 22: "22-P.png", 23: "23-C.png", 24: "24-Si.png", 25: "25-S.png",
  26: "26-Se.png", 27: "27-Gu.png", 28: "28-.png", 29: "29-Te.png", 30: "30-Cd.png",
  31: "31-Ti.png", 32: "32-.png", 33: "33-Nb.png", 34: "34-H2.png", 35: "35-H2O.png",
  36: "36-.png", 37: "37-O2.png", 38: "38-H2O2.png", 39: "39-Li-ion.png",
  40: "40-na-ion.png", 41: "41-Li-S.png", 42: "42-.png", 43: "43-.png",
  44: "44-.png", 45: "45-CH4+O2.png"
};

const getElementIcon = (num: number) => `/elements/${iconMap[num] || `${num}-.png`}`;

export default function MarpoSpiritPage({ lang }: { lang: string }) {
  const [gameState, setGameState] = useState<'idle' | 'mining' | 'result'>('idle');
  const [adCount, setAdCount] = useState(0); 
  const [ohmBalance, setOhmBalance] = useState(5300.0);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [minedNumbers, setMinedNumbers] = useState<number[]>([]);
  const [matchCount, setMatchCount] = useState(0);
  const [wonAmount, setWonAmount] = useState(0);

  // 🚩 가이드 대사 순차 노출 로직
  const guideLines = [
    "파이오니어님 이제 MAR 에너지 채굴 탐색을 시작합니다.",
    "아래의 원소 중 6개의 원소 샘플을 선택하세요.",
    "광부가 채굴한 원소가 샘플과 일치하면, Ω 에너지 크레딧을 획득합니다.",
    "자 샘플 선택 후 채굴 버튼을 누르세요!"
  ];
  const [lineIdx, setLineIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLineIdx((prev) => (prev + 1) % guideLines.length);
    }, 4000); // 4초마다 다음 문장
    return () => clearInterval(interval);
  }, []);

  const isUnlocked = adCount >= 3;

  // 채굴 시작 함수
  const handleMining = () => {
    if (selectedNumbers.length < 6) return alert("원소 샘플 6개를 선택해주세요!");
    setGameState('mining');

    // 6초간 채굴 연출 후 결과 도출
    setTimeout(() => {
      const results: number[] = [];
      while (results.length < 6) {
        const n = Math.floor(Math.random() * 45) + 1;
        if (!results.includes(n)) results.push(n);
      }
      const matches = selectedNumbers.filter(n => results.includes(n)).length;
      
      // 대표님 보상 로직 적용
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

      {/* 🐇 토끼 가이드 (marpo-stage-1.png) */}
      <div className="w-full max-w-md mt-4 mb-8 flex items-start gap-6 relative z-20">
        <div className="relative w-28 h-28 shrink-0 bg-gradient-to-tr from-black to-zinc-900 rounded-full border-4 border-amber-500 shadow-[0_0_30px_rgba(243,156,18,0.3)] flex items-center justify-center overflow-hidden animate-bounce-slow">
           <Image src="/marpo-stage-1.png" alt="Rabbit" fill className="object-cover scale-110" priority unoptimized />
        </div>
        <div className="relative flex-1 bg-zinc-900/70 border border-zinc-800 rounded-[2.5rem] p-7 shadow-2xl backdrop-blur-xl min-h-[120px] flex items-center">
          <div className="absolute top-10 -left-4 w-0 h-0 border-t-[12px] border-t-transparent border-r-[20px] border-r-zinc-800 border-b-[12px] border-b-transparent"></div>
          <p className="text-[18px] font-bold text-zinc-200 leading-relaxed italic px-2">
            "{guideLines[lineIdx]}"
          </p>
        </div>
      </div>

      {/* 🚩 [핵심] 화성 채굴 애니메이션 (6초 노출) */}
      {gameState === 'mining' && (
        <div className="fixed inset-0 z-[1000] bg-black/90 flex flex-col items-center justify-center p-10 animate-in fade-in duration-500">
          <div className="relative w-full max-w-lg aspect-square flex flex-col items-center justify-center">
             {/* 화성 배경 이미지 */}
             <div className="absolute inset-0 opacity-40">
                <Image src="/mars-mining-bg.jpg" alt="Mars" fill className="object-cover" />
             </div>
             
             {/* 🚩 움직이는 광부 (Spritesheet Animation) */}
             <div className="miner-sprite w-[200px] h-[200px] relative z-10 shadow-[0_30px_50px_rgba(243,156,18,0.2)]"></div>
             
             <div className="mt-12 flex flex-col items-center gap-4 relative z-10">
                <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
                <p className="text-3xl font-black text-amber-500 uppercase tracking-[0.3em] animate-pulse">Mining Ω Energy...</p>
             </div>
          </div>
        </div>
      )}

      {/* 🚩 광부 결과 보고 모달 */}
      {gameState === 'result' && (
        <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 animate-in zoom-in duration-300">
          <div className="bg-zinc-900 border-2 border-amber-600 rounded-[4rem] p-12 w-full max-w-md text-center shadow-2xl">
            <div className="w-28 h-28 bg-black rounded-full mx-auto mb-8 border-2 border-amber-500 flex items-center justify-center overflow-hidden">
               <Image src="/miner-character.png" alt="Miner" width={100} height={100} />
            </div>
            <h2 className="text-3xl font-black text-white mb-6 italic uppercase">Exploration Report!</h2>
            
            <div className="bg-black/60 rounded-3xl p-6 mb-10 border border-zinc-800">
              <p className="text-xs text-zinc-500 font-bold mb-4 uppercase">Mined Results</p>
              <div className="flex justify-center gap-2 mb-6">
                {minedNumbers.map(n => (
                  <div key={n} className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-black ${selectedNumbers.includes(n) ? 'bg-amber-500 text-black animate-bounce' : 'bg-zinc-800 text-zinc-600'}`}>
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

      {/* 리워드 풀 */}
      <section className="w-full max-w-md bg-gradient-to-br from-[#1a1a1a] to-[#050505] p-12 rounded-[3.5rem] border border-[#f39c12]/20 mb-10 shadow-2xl text-center">
        <p className="text-xs text-zinc-600 font-black uppercase tracking-[0.4em] mb-3">MAR-Ω Reward Pool Matching</p>
        <div className="flex items-center justify-center gap-4 font-black">
          <p className="text-6xl text-white tracking-tighter">5,314,159</p>
          <span className="text-[#f39c12] text-4xl italic">Ω</span>
        </div>
      </section>

      {/* 드로우 보드 */}
      <div className={`w-full max-w-md bg-zinc-900/30 border border-zinc-800 rounded-[3.5rem] p-8 mb-12 relative shadow-2xl ${!isUnlocked && 'opacity-50 grayscale'}`}>
        {!isUnlocked && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md rounded-[3.5rem] p-8 text-center">
            <Lock size={56} className="text-[#f39c12] mb-6 animate-pulse" />
            <p className="text-[#f39c12] font-black text-lg uppercase mb-8 leading-tight">Watch 3 Ads to Unlock Board</p>
            <button onClick={() => setAdCount(3)} className="px-10 py-5 bg-[#f39c12] text-black rounded-2xl font-black text-sm uppercase shadow-2xl transition-all">Unlock (Debug)</button>
          </div>
        )}
        
        <div className="flex justify-between items-center mb-10 px-2">
          <h3 className="text-xs font-black text-[#f39c12] uppercase tracking-[0.3em] italic">Tactical Sample Selection</h3>
          <button onClick={() => setSelectedNumbers([])} className="text-zinc-700 hover:text-white transition-colors"><RefreshCcw size={22} /></button>
        </div>
        
        <div className="flex justify-between gap-3 mb-12">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-2xl font-black transition-all ${selectedNumbers[i] ? 'border-amber-500 text-amber-500 bg-amber-500/10 shadow-[0_0_20px_rgba(243,156,18,0.3)]' : 'border-zinc-800 text-zinc-800 bg-black/40'}`}>
              {selectedNumbers[i] || '?'}
            </div>
          ))}
        </div>

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

      {/* 하단 채굴 버튼 (Mining Start) */}
      <div className="w-full max-w-md mt-auto bg-zinc-900/50 p-8 rounded-[3.5rem] border border-zinc-800 flex justify-between items-center shadow-2xl z-10">
         <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 text-amber-500 text-3xl font-black italic">Ω</div>
           <div>
             <p className="text-xs text-zinc-600 font-black mb-1 uppercase tracking-widest tracking-tighter italic font-bold">Authorized Vault</p>
             <p className="text-2xl font-black text-white italic">{ohmBalance.toLocaleString()} <span className="text-amber-500 text-sm underline">OHM</span></p>
           </div>
         </div>
         <button onClick={handleMining} disabled={selectedNumbers.length < 6} className={`flex items-center gap-4 px-12 py-5 rounded-3xl font-black text-base uppercase transition-all transform active:scale-95 ${selectedNumbers.length === 6 ? 'bg-amber-500 text-black shadow-2xl' : 'bg-zinc-800 text-zinc-700'}`}>
           <Pickaxe size={24} /> Mining Start
         </button>
      </div>

      {/* 🚩 움직이는 광부 스프라이트 애니메이션 CSS */}
      <style jsx global>{`
        .miner-sprite {
          background-image: url('/image_97aa4b.png'); /* 업로드하신 누끼 파일 */
          background-size: 800px 200px; /* 4개 프레임이므로 가로 200px * 4 = 800px */
          animation: play-miner 0.8s steps(4) infinite;
        }
        @keyframes play-miner {
          from { background-position: 0px; }
          to { background-position: -800px; }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
      `}</style>
    </div>
  );
}