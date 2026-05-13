"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Lock, Pickaxe, Flame, Sparkles, RefreshCcw, PlaySquare, Lightbulb } from 'lucide-react';

const iconMap: Record<number, string> = {
  1: "1-In.png", 2: "2-.png", 3: "3-.png", 4: "4-Y.png", 5: "5-.png",
  6: "6-As.png", 7: "7-.png", 8: "8-Th.png", 9: "9-Na.png", 10: "10-.png",
  11: "11-H.png", 12: "12-He.png", 13: "13-Ba.png", 14: "14-O.png", 15: "15-.png",
  16: "16-Li.png", 17: "17-.png", 18: "18-Ni.png", 19: "19-Co.png", 20: "20-Mn.png",
  21: "21-Fe.png", 22: "22-P.png", 23: "23-C.png", 24: "24-Si.png", 25: "25-S.png",
  26: "26-Se.png", 27: "27-Gu.png", 28: "28-.png", 29: "29-Te.png", 30: "30-Cd.png",
  31: "31-Ti.png", 32: "32-.png", 33: "33-Nb.png", 34: "34-H2.png", 35: "35-.png",
  36: "36-.png", 37: "37-O2.png", 38: "38-.png", 39: "39-Li-ion.png",
  40: "40-na-ion.png", 41: "41-Li-S.png", 42: "42-.png", 43: "43-.png", 44: "44-.png", 45: "45-CH4+O2.png"
};

const getElementIcon = (num: number) => `/elements/${iconMap[num] || `${num}-.png`}`;

const guideData = {
  ko: [
    "파이오니어님 이제 MAR 에너지 채굴 탐색을 시작합니다.",
    "아래의 원소 중 6개의 원소 샘플을 선택하세요.",
    "채굴된 원소가 일치하면, Ω 에너지 크레딧을 획득합니다.",
    "디플레이션을 향한 여정, 샘플 선택 후 채굴 버튼을 누르세요!"
  ],
  en: [
    "Pioneer, the MAR energy mining exploration begins now.",
    "Please select 6 element samples from the elements below.",
    "If the mined elements match, you will earn Ω energy credits.",
    "A journey toward deflation. Select samples and press Mining!"
  ]
};

type GameState = 'idle' | 'mining_video' | 'analyzing' | 'win_result' | 'fail_result' | 'ad_wall';
type UserTier = 'basic' | 'premium' | 'vip';

export default function MarpoSpiritPage({ lang = 'ko' }: { lang?: 'ko' | 'en' }) {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [userTier, setUserTier] = useState<UserTier>('premium'); 
  const [drawCount, setDrawCount] = useState(0); 
  const [ohmBalance, setOhmBalance] = useState(5300.0);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [wonAmount, setWonAmount] = useState(0);
  const [lineIdx, setLineIdx] = useState(0);
  const [adCount, setAdCount] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [revealedNumber, setRevealedNumber] = useState<number | null>(null);

  const currentGuides = guideData[lang] || guideData.ko;

  useEffect(() => {
    const savedTier = localStorage.getItem('marpo_tier') as UserTier;
    if (savedTier) setUserTier(savedTier);
    const interval = setInterval(() => setLineIdx((p) => (p + 1) % currentGuides.length), 4000);
    return () => clearInterval(interval);
  }, [currentGuides]);

  const isUnlocked = adCount >= 3 || userTier !== 'basic'; 

  const handleReveal = () => {
    if (ohmBalance < 1000) return alert(lang === 'ko' ? "Ω 잔액이 부족합니다." : "Insufficient MAR-Ω.");
    setOhmBalance(prev => prev - 1000);
    const randomNum = Math.floor(Math.random() * 45) + 1;
    setRevealedNumber(randomNum);
  };

  const handleNumberToggle = (num: number) => {
    if (!isUnlocked) return;
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter(n => n !== num));
    } else if (selectedNumbers.length < 6) {
      setSelectedNumbers([...selectedNumbers, num].sort((a, b) => a - b));
    }
  };

  const handleMining = () => {
    if (selectedNumbers.length < 6) return alert(lang === 'ko' ? "원소 샘플 6개를 선택해주세요!" : "Please select 6 element samples!");
    setGameState('mining_video');

    setTimeout(() => {
      setGameState('analyzing');
      setLoadingProgress(0);
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => (prev >= 100 ? 100 : prev + 1));
      }, 50);

      setTimeout(() => {
        clearInterval(progressInterval);
        setDrawCount(prev => prev + 1);
        const isWinner = Math.random() > 0.7; 
        const reward = isWinner ? Math.floor(Math.random() * 5000) + 500 : 0;
        setWonAmount(reward);
        setOhmBalance(prev => prev + reward);

        if (isWinner) {
          setGameState('win_result');
          setTimeout(() => handleRetry(), 4000);
        } else {
          setGameState('fail_result');
          setTimeout(() => handleRetry(), 5000);
        }
      }, 5000);
    }, 3000);
  };

  const handleRetry = () => {
    setSelectedNumbers([]);
    setRevealedNumber(null);
    if (userTier === 'basic' || (userTier === 'premium' && drawCount >= 5) || (userTier === 'vip' && drawCount >= 10)) {
      setGameState('ad_wall');
    } else {
      setGameState('idle');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 pb-48 flex flex-col items-center font-sans relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none fixed" style={{ backgroundImage: "radial-gradient(#f39c12 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>

      {/* 🏁 0단계: 광부 채굴 영상 (3초) */}
      {gameState === 'mining_video' && (
        <div className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center">
          <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-80"><source src="/mining-video.mp4" type="video/mp4" /></video>
          <div className="relative z-10 flex flex-col items-center gap-6">
            <div className="w-24 h-24 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-4xl font-black text-amber-500 uppercase tracking-[0.4em] drop-shadow-[0_0_20px_rgba(243,156,18,0.8)]">Mining...</p>
          </div>
        </div>
      )}

      {/* 🏁 1단계: 분석 중 (모래시계 풀 사이즈 5초) */}
      {gameState === 'analyzing' && (
        <div className="fixed inset-0 z-[1100] bg-black flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-0 w-full h-full z-0"><Image src="/모래시계.png" alt="Hourglass" fill className="object-cover opacity-70" priority unoptimized /></div>
          <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-10 px-10">
            <p className="text-3xl font-black text-amber-500 uppercase tracking-widest animate-infinite-blink [text-shadow:0_2px_10px_rgba(0,0,0,1)]">Mar원소 분석 중.....</p>
            <div className="w-full h-4 bg-black/50 rounded-full overflow-hidden border-2 border-zinc-700">
              <div className="h-full bg-amber-500 transition-all duration-75 ease-linear" style={{ width: `${loadingProgress}%` }}></div>
            </div>
          </div>
        </div>
      )}

      {/* 🏁 2단계: 당첨 (토끼원석.png + 폭죽 4초) */}
      {gameState === 'win_result' && (
        <div className="fixed inset-0 z-[1200] bg-black/95 flex flex-col items-center justify-center p-6 animate-in zoom-in duration-300">
          <div className="relative z-10 text-center flex flex-col items-center">
            <div className="relative w-72 h-72 mb-8 animate-bounce-in"><Image src="/토끼원석.png" alt="Winner Rabbit" fill className="object-contain" unoptimized /></div>
            <h2 className="text-6xl font-black text-amber-500 mb-4 italic uppercase tracking-tighter">SUCCESS!</h2>
            <p className="text-4xl font-black text-white">+{wonAmount.toLocaleString()} Ω</p>
            <div className="firework-container absolute inset-0 -z-10 overflow-hidden">{[...Array(10)].map((_, i) => ( <div key={i} className={`firework firework-${(i % 3) + 1}`} style={{ top: `${Math.random()*100}%`, left: `${Math.random()*100}%` }}></div> ))}</div>
          </div>
        </div>
      )}

      {/* 🏁 [수정] 3단계: 실패 (당황토끼.png + 석탄 파편 폭발 5초) */}
      {gameState === 'fail_result' && (
        <div className="fixed inset-0 z-[1200] bg-black/95 flex flex-col items-center justify-center p-6 animate-in fade-in duration-500 overflow-hidden">
          
          <div className="relative w-72 h-72 mb-12">
            {/* 1. 당황토끼 이미지 (컬러 유지, 흔들림 제거) */}
            <Image src="/당황토끼.png" alt="Failed Rabbit" fill className="object-contain" unoptimized />
            
            {/* 2. 석탄 폭발 파편 레이어 */}
            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
              {[...Array(30)].map((_, i) => (
                <div 
                  key={i} 
                  className="coal-shatter" 
                  style={{ 
                    '--dir-x': `${Math.random() * 600 - 300}px`, 
                    '--dir-y': `${Math.random() * 600 - 300}px`,
                    '--rot': `${Math.random() * 360}deg`,
                    '--delay': `${Math.random() * 0.5}s`
                  } as React.CSSProperties} 
                />
              ))}
            </div>
          </div>

          <h2 className="text-4xl font-black text-red-600 uppercase tracking-widest mb-4 [text-shadow:0_0_20px_rgba(220,38,38,0.6)]">
            Analysis Failed
          </h2>
          <p className="text-zinc-400 font-bold italic text-center px-10 break-keep">
            {lang === 'ko' ? "원소 결합에 실패했습니다. 석탄이 되어 흩어집니다!" : "Element combination failed. Shattered into coal!"}
          </p>
          <div className="mt-8 w-48 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
             <div className="h-full bg-red-600 animate-progress-5s"></div>
          </div>
        </div>
      )}

      {/* 메인 로비 (idle) */}
      {gameState === 'idle' && (
        <>
          <div className="w-full max-w-md mt-14 mb-8 flex items-start gap-6 relative z-20">
            <div className="relative w-28 h-28 shrink-0 bg-gradient-to-tr from-black to-zinc-900 rounded-full border-4 border-amber-500 shadow-[0_0_30px_rgba(243,156,18,0.3)] flex items-center justify-center overflow-hidden animate-bounce-slow">
              <Image src="/marpo-stage-1.png" alt="Rabbit" fill className="object-cover scale-110" priority unoptimized />
            </div>
            <div className="relative flex-1 bg-zinc-900/70 border border-zinc-800 rounded-[2.5rem] p-7 shadow-2xl backdrop-blur-xl min-h-[120px] flex items-center">
              <div className="absolute top-10 -left-4 w-0 h-0 border-t-[12px] border-t-transparent border-r-[20px] border-r-zinc-800 border-b-[12px] border-b-transparent"></div>
              <p className="text-[16px] md:text-[18px] font-bold text-zinc-200 italic px-2">"{currentGuides[lineIdx]}"</p>
            </div>
          </div>

          <section className="w-full max-w-md bg-gradient-to-br from-[#1a1a1a] to-[#050505] p-10 rounded-[3.5rem] border border-[#f39c12]/20 mb-8 shadow-2xl text-center z-20">
            <p className="text-xs text-zinc-600 font-black uppercase tracking-[0.4em] mb-3">MAR-Ω Reward Pool Matching</p>
            <div className="flex items-center justify-center gap-4">
              <p className="text-5xl font-black text-white font-mono tracking-tighter">5,314,159</p>
              <span className="text-amber-500 text-4xl font-black italic">Ω</span>
            </div>
          </section>

          <button onClick={handleReveal} className="w-full max-w-md mb-6 py-4 bg-zinc-900 border border-amber-500/50 rounded-2xl flex items-center justify-center gap-3 text-amber-500 font-black uppercase tracking-widest hover:bg-amber-500/10 z-20">
            <Lightbulb size={20} /> {lang === 'ko' ? "원소 힌트 받기 (-1,000 Ω)" : "Get Element Hint (-1,000 Ω)"}
          </button>

          <div className="w-full max-w-md bg-zinc-900/30 border border-zinc-800 rounded-[3.5rem] p-8 mb-12 relative shadow-2xl z-20">
            <div className="grid grid-cols-6 gap-3">
              {[...Array(45)].map((_, i) => {
                const num = i + 1;
                const isSelected = selectedNumbers.includes(num);
                const isHint = revealedNumber === num;
                return (
                  <button key={num} onClick={() => handleNumberToggle(num)} className={`relative aspect-square rounded-xl overflow-hidden transition-all duration-300 transform ${isSelected ? 'border-2 border-amber-500 scale-110 z-10' : isHint ? 'border-2 border-lime-500 animate-pulse scale-105 z-10' : 'border border-zinc-800'}`}>
                    <div className={`absolute inset-0 bg-cover bg-center transition-opacity ${isSelected ? 'opacity-0' : 'opacity-100'}`} style={{ backgroundImage: `url('${getElementIcon(num)}')` }} />
                    <div className={`absolute inset-0 flex items-center justify-center ${isSelected ? 'bg-amber-500/20' : isHint ? 'bg-lime-500/20' : ''} ${isSelected || isHint ? 'opacity-100' : 'opacity-0'}`}>
                      <span className={`text-2xl font-black ${isSelected ? 'text-amber-500' : 'text-lime-500'}`}>{num}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="w-full max-w-md mt-auto bg-zinc-900/50 p-8 rounded-[3.5rem] border border-zinc-800 flex justify-between items-center shadow-2xl z-20">
             <div className="flex items-center gap-6">
               <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 text-amber-500 font-black text-3xl">Ω</div>
               <div>
                 <p className="text-xs text-zinc-600 font-black mb-1 uppercase tracking-tighter">Vault Balance</p>
                 <p className="text-2xl font-black text-white italic">{ohmBalance.toLocaleString()} Ω</p>
               </div>
             </div>
             <button onClick={handleMining} disabled={selectedNumbers.length < 6} className="flex items-center gap-4 px-10 py-5 rounded-3xl bg-amber-500 text-black font-black uppercase shadow-[0_0_20px_rgba(243,156,18,0.4)] active:scale-95 transition-all">
               <Pickaxe size={24} /> {lang === 'ko' ? '분석 시작' : 'Start'}
             </button>
          </div>
        </>
      )}

      {/* 🌟 애니메이션 정의 🌟 */}
      <style jsx global>{`
        @keyframes coalShatter {
          0% { transform: scale(0) rotate(0deg); opacity: 1; }
          100% { transform: scale(1.5) translate(var(--dir-x), var(--dir-y)) rotate(var(--rot)); opacity: 0; }
        }
        .coal-shatter {
          position: absolute;
          width: 20px;
          height: 20px;
          background: #121212;
          box-shadow: inset 0 0 10px #000;
          clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%); /* 파편 모양 */
          animation: coalShatter 1s ease-out var(--delay) forwards;
        }
        @keyframes explode { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(25); opacity: 0; } }
        .firework { position: absolute; width: 4px; height: 4px; border-radius: 50%; opacity: 0; animation: explode 1.5s ease-out infinite; background: #f39c12; }
        @keyframes bounce-in { 0% { transform: scale(0.3); opacity: 0; } 70% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); } }
        .animate-bounce-in { animation: bounce-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .animate-progress-5s { animation: progress 5s linear forwards; }
        @keyframes progress { from { width: 0%; } to { width: 100%; } }
        .animate-infinite-blink { animation: blink 1s linear infinite; }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
    </div>
  );
}