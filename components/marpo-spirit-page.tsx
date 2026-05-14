"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Lock, Pickaxe, Flame, Sparkles, RefreshCcw, PlaySquare, Lightbulb, Wallet, X, ChevronRight, Target } from 'lucide-react';

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
    "채굴된 원소가 일치하면, 매칭 개수에 따라 등급별 원석을 획득합니다.",
    "디플레이션을 향한 여정, 샘플 선택 후 채굴 버튼을 누르세요!"
  ],
  en: [
    "Pioneer, the MAR energy mining exploration begins now.",
    "Please select 6 element samples from the elements below.",
    "Based on matched elements, you will earn tiered raw elements.",
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

  // 금고 및 획득 원석 상태
  const [inventory, setInventory] = useState<Record<number, number>>({});
  const [showVault, setShowVault] = useState(false);
  const [earnedElement, setEarnedElement] = useState<number | null>(null);

  const currentGuides = guideData[lang] || guideData.ko;

  useEffect(() => {
    const savedTier = localStorage.getItem('marpo_tier') as UserTier;
    if (savedTier) setUserTier(savedTier);
    
    const savedInv = localStorage.getItem('marpo_inventory');
    if (savedInv) setInventory(JSON.parse(savedInv));

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
    setEarnedElement(null);

    setTimeout(() => {
      setGameState('analyzing');
      setLoadingProgress(0);
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => (prev >= 100 ? 100 : prev + 1));
      }, 50);

      setTimeout(() => {
        clearInterval(progressInterval);
        setDrawCount(prev => prev + 1);
        
        // 당첨 로직 임시 시뮬레이션 (실제로는 서버/스마트컨트랙트에서 난수 생성)
        const results: number[] = [];
        while (results.length < 6) {
          const n = Math.floor(Math.random() * 45) + 1;
          if (!results.includes(n)) results.push(n);
        }
        
        const matchedNums = selectedNumbers.filter(n => results.includes(n));
        const matches = matchedNums.length;
        
        // 🚩 전술 B: 매칭 개수에 따른 랜덤 티어 박스 시스템
        let reward = 0;
        let obtainedElement: number | null = null;

        if (matches > 0) {
          reward = matches === 1 ? 500 : matches === 2 ? 1500 : matches === 3 ? 5000 : matches === 4 ? 20000 : matches === 5 ? 100000 : 314159;
          
          if (matches === 1) obtainedElement = Math.floor(Math.random() * 15) + 1; // 1~15 (하급)
          else if (matches === 2) obtainedElement = Math.floor(Math.random() * 10) + 16; // 16~25 (중급)
          else if (matches === 3) obtainedElement = Math.floor(Math.random() * 10) + 26; // 26~35 (고급)
          else obtainedElement = Math.floor(Math.random() * 10) + 36; // 36~45 (최상급)

          setEarnedElement(obtainedElement);
          
          setInventory(prevInv => {
            const updatedInv = { ...prevInv };
            if (obtainedElement) {
              updatedInv[obtainedElement] = (updatedInv[obtainedElement] || 0) + 1;
              localStorage.setItem('marpo_inventory', JSON.stringify(updatedInv));
            }
            return updatedInv;
          });
        } else {
          // 데모 버전을 위해 강제 승리 확률 30% 부여 (테스트용)
          if (Math.random() > 0.7) {
             reward = 500;
             obtainedElement = Math.floor(Math.random() * 15) + 1;
             setEarnedElement(obtainedElement);
             setInventory(prevInv => {
               const updatedInv = { ...prevInv };
               updatedInv[obtainedElement!] = (updatedInv[obtainedElement!] || 0) + 1;
               localStorage.setItem('marpo_inventory', JSON.stringify(updatedInv));
               return updatedInv;
             });
          }
        }

        setWonAmount(reward);
        setOhmBalance(prev => prev + reward);

        if (reward > 0) {
          setGameState('win_result');
          setTimeout(() => handleRetry(), 5000);
        } else {
          setGameState('fail_result');
          setTimeout(() => handleRetry(), 6000); 
        }
      }, 5000);
    }, 3000);
  };

  const handleRetry = () => {
    setSelectedNumbers([]);
    setRevealedNumber(null);
    setEarnedElement(null);
    if (userTier === 'basic' || (userTier === 'premium' && drawCount >= 5) || (userTier === 'vip' && drawCount >= 10)) {
      setGameState('ad_wall');
    } else {
      setGameState('idle');
    }
  };

  const renderCoalParticles = () => {
    const particles = [];
    const colors = ['#0a0a0a', '#1a1a1a', '#2a2a2a', '#3a3a3a'];
    for (let i = 0; i < 80; i++) {
      const style = {
        '--dir-x': `${Math.random() * 800 - 400}px`,
        '--dir-y': `${Math.random() * 800 - 400}px`,
        '--rot': `${Math.random() * 720}deg`,
        '--delay': `${Math.random() * 0.3}s`,
        'width': `${Math.random() * 15 + 8}px`,
        'height': `${Math.random() * 15 + 8}px`,
        'background': colors[Math.floor(Math.random() * colors.length)],
      } as React.CSSProperties;
      particles.push(<div key={i} className="coal-particle" style={style} />);
    }
    return particles;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 pb-48 flex flex-col items-center font-sans relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none fixed" style={{ backgroundImage: "radial-gradient(#f39c12 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>

      {gameState === 'mining_video' && (
        <div className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center">
          <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-80"><source src="/mining-video.mp4" type="video/mp4" /></video>
          <div className="relative z-10 flex flex-col items-center gap-6">
            <div className="w-24 h-24 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-4xl font-black text-amber-500 uppercase tracking-[0.4em]">Mining...</p>
          </div>
        </div>
      )}

      {gameState === 'analyzing' && (
        <div className="fixed inset-0 z-[1100] bg-black flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-0 w-full h-full z-0"><Image src="/모래시계.png" alt="Hourglass" fill className="object-cover opacity-70" priority unoptimized /></div>
          <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-10 px-10">
            <p className="text-3xl font-black text-amber-500 uppercase tracking-widest animate-infinite-blink [text-shadow:0_2px_10px_rgba(0,0,0,1)]">Mar원소 분석 중.....</p>
            <div className="w-full h-4 bg-black/50 rounded-full overflow-hidden border-2 border-zinc-700">
              <div className="h-full bg-amber-500" style={{ width: `${loadingProgress}%` }}></div>
            </div>
          </div>
        </div>
      )}

      {gameState === 'win_result' && (
        <div className="fixed inset-0 z-[1200] bg-black/95 flex flex-col items-center justify-center p-6 animate-in zoom-in duration-300">
          <div className="relative z-10 text-center flex flex-col items-center">
            <div className="relative w-64 h-64 mb-4 animate-bounce-in"><Image src="/토끼원석.png" alt="Winner Rabbit" fill className="object-contain" unoptimized /></div>
            <h2 className="text-6xl font-black text-amber-500 mb-2 italic uppercase tracking-tighter">SUCCESS!</h2>
            <p className="text-4xl font-black text-white mb-6">+{wonAmount.toLocaleString()} Ω</p>
            
            {/* 🚩 획득한 원석을 직관적으로 보여주는 UI 추가 */}
            {earnedElement && (
              <div className="flex items-center gap-4 bg-zinc-900/90 px-6 py-3 rounded-[2rem] border-2 border-lime-500 shadow-[0_0_20px_rgba(132,204,22,0.4)] animate-in slide-in-from-bottom duration-500 delay-300">
                <div className="relative w-12 h-12">
                  <Image src={getElementIcon(earnedElement)} alt={`Element ${earnedElement}`} fill className="object-contain" unoptimized />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-lime-400 font-black uppercase tracking-widest">Loot Box Unlocked</p>
                  <p className="text-xl font-black text-white">
                    {lang === 'ko' ? `${earnedElement}번 원석 획득!` : `Obtained #${earnedElement}!`}
                  </p>
                </div>
              </div>
            )}

            <div className="firework-container absolute inset-0 -z-10 overflow-hidden">{[...Array(10)].map((_, i) => ( <div key={i} className="firework" style={{ top: `${Math.random()*100}%`, left: `${Math.random()*100}%`, background: '#f39c12' }}></div> ))}</div>
          </div>
        </div>
      )}

      {gameState === 'fail_result' && (
        <div className="fixed inset-0 z-[1200] bg-black/95 flex flex-col items-center justify-center p-6 animate-in fade-in duration-500 overflow-hidden">
          <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none">
            {renderCoalParticles()}
          </div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative w-72 h-72 mb-12">
              <Image src="/당황토끼.png" alt="Failed Rabbit" fill className="object-contain" unoptimized />
            </div>
            <h2 className="text-4xl font-black text-zinc-500 uppercase tracking-widest mb-4">Analysis Failed</h2>
            <p className="text-zinc-400 font-bold italic text-center px-10 break-keep">
              {lang === 'ko' ? "원소 결합에 실패했습니다. 다시 도전 하세요." : "Element combination failed. Try again!"}
            </p>
          </div>
        </div>
      )}

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

          <div className="w-full max-w-md flex flex-col gap-3 mb-10 relative z-20">
            <button onClick={handleReveal} className="w-full py-5 bg-zinc-900/40 border border-[#f39c12]/40 rounded-3xl flex flex-col items-center active:scale-95 transition-all">
              <div className="flex items-center gap-2 mb-1">
                <Target size={18} className="text-[#f39c12]" />
                <p className="text-[#f39c12] font-black text-xs uppercase tracking-widest">Insider Reveal</p>
              </div>
              <p className="text-[14px] font-black uppercase italic text-lime-300 animate-infinite-blink">
                {lang === 'ko' ? "1,000 Ω 소모하여 힌트 보기" : "Burn 1,000 Ω for a hint"}
              </p>
            </button>

            <button onClick={() => setShowVault(true)} className="w-full py-6 bg-gradient-to-r from-amber-600 to-amber-500 rounded-3xl flex items-center justify-center gap-4 shadow-[0_10px_20px_rgba(0,0,0,0.3)] active:scale-95 transition-all border-b-4 border-amber-800">
              <Wallet size={24} className="text-black" />
              <span className="text-black font-black text-xl italic uppercase tracking-tighter">
                {lang === 'ko' ? "내 금고 확인 (자산)" : "MY VAULT (ASSETS)"}
              </span>
              <ChevronRight size={20} className="text-black/50" />
            </button>
          </div>

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
             <button onClick={handleMining} disabled={selectedNumbers.length < 6} className="px-10 py-5 rounded-3xl bg-amber-500 text-black font-black uppercase shadow-[0_0_20px_rgba(243,156,18,0.4)] active:scale-95 transition-all">
               <Pickaxe size={24} className="inline mr-2" /> {lang === 'ko' ? '분석 시작' : 'Start'}
             </button>
          </div>
        </>
      )}

      {showVault && (
        <div className="fixed inset-0 z-[2500] bg-black animate-in slide-in-from-bottom duration-500 flex flex-col p-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-10 mt-10">
            <div>
              <h2 className="text-4xl font-black italic text-amber-500 tracking-tighter uppercase">Marpo Vault</h2>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Your Tactical Element Inventory</p>
            </div>
            <button onClick={() => setShowVault(false)} className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800">
              <X size={24} className="text-white" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-20">
            {[...Array(45)].map((_, i) => {
              const num = i + 1;
              const count = inventory[num] || 0;
              return (
                <div key={num} className={`relative aspect-square rounded-2xl border transition-all ${count > 0 ? 'border-amber-500 bg-zinc-900' : 'border-zinc-800 opacity-20'}`}>
                   <div className="absolute inset-0 bg-cover bg-center rounded-2xl" style={{ backgroundImage: `url('${getElementIcon(num)}')` }} />
                   {count > 0 && (
                     <div className="absolute -top-2 -right-2 bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg">
                       x{count}
                     </div>
                   )}
                   <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-black text-white/50">{num}</div>
                </div>
              );
            })}
          </div>

          <div className="mt-auto bg-zinc-900/80 p-8 rounded-[3rem] border border-amber-500/30 text-center">
             <p className="text-zinc-400 text-sm font-bold mb-4 italic break-keep">
               {lang === 'ko' ? "융합 프로토콜(챕터 2) 준비 중... 더 많은 원석을 채굴하십시오." : "Fusion Protocol (Ch.2) Incoming... Keep mining raw elements."}
             </p>
             <button onClick={() => setShowVault(false)} className="w-full py-5 bg-amber-500 text-black rounded-2xl font-black text-lg uppercase">
               {lang === 'ko' ? "채굴장으로 복귀" : "Return to Mining"}
             </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes coalExplode {
          0% { transform: scale(0.2) translate(0, 0); opacity: 1; }
          100% { transform: scale(1.5) translate(var(--dir-x), var(--dir-y)) rotate(var(--rot)); opacity: 0; }
        }
        .coal-particle {
          position: absolute;
          top: 50%;
          left: 50%;
          clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
          animation: coalExplode 2s cubic-bezier(0.1, 1, 0.3, 1) var(--delay) forwards;
        }
        @keyframes explode { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(25); opacity: 0; } }
        .firework { position: absolute; width: 4px; height: 4px; border-radius: 50%; opacity: 0; animation: explode 1.5s ease-out infinite; }
        @keyframes bounce-in { 0% { transform: scale(0.3); opacity: 0; } 70% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); } }
        .animate-bounce-in { animation: bounce-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .animate-infinite-blink { animation: blink 1s linear infinite; }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
      `}</style>
    </div>
  );
}