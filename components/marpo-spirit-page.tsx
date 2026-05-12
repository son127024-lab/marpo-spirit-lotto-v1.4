"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Target, Lock, Pickaxe, Flame, AlertTriangle, Sparkles, RefreshCcw, PlaySquare } from 'lucide-react';

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

type GameState = 'idle' | 'mining' | 'success_punch' | 'success_fireworks' | 'success_marpo' | 'fail_punch' | 'fail_rabbit' | 'ad_wall';
type UserTier = 'basic' | 'premium' | 'vip';

export default function MarpoSpiritPage({ lang = 'ko' }: { lang?: 'ko' | 'en' }) {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [userTier, setUserTier] = useState<UserTier>('premium'); 
  const [drawCount, setDrawCount] = useState(0); 
  const [adWallWatched, setAdWallWatched] = useState(0); 
  const [adCount, setAdCount] = useState(0); 
  const [ohmBalance, setOhmBalance] = useState(5300.0);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [minedNumbers, setMinedNumbers] = useState<number[]>([]);
  const [matchCount, setMatchCount] = useState(0);
  const [wonAmount, setWonAmount] = useState(0);
  const [lineIdx, setLineIdx] = useState(0);
  const [revealedNumber, setRevealedNumber] = useState<number | null>(null);
  const [vipBonusHit, setVipBonusHit] = useState(false);
  const [vipTargetNumbers, setVipTargetNumbers] = useState<number[]>([]);

  const currentGuides = guideData[lang] || guideData.ko;

  useEffect(() => {
    const savedTier = localStorage.getItem('marpo_tier') as UserTier;
    if (savedTier) setUserTier(savedTier);
    
    const interval = setInterval(() => setLineIdx((p) => (p + 1) % currentGuides.length), 4000);
    return () => clearInterval(interval);
  }, [currentGuides]);

  const isUnlocked = adCount >= 3 || userTier !== 'basic'; 

  const handleAdWatch = () => {
    if (adCount < 3) {
      setAdCount(prev => prev + 1);
      if(adCount + 1 === 3) alert(lang === 'ko' ? "시스템 잠금이 해제되었습니다." : "System lock has been released.");
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
    if (ohmBalance < 1000) return alert(lang === 'ko' ? "Ω 잔액이 부족합니다." : "Insufficient MAR-Ω.");
    setOhmBalance(prev => prev - 1000);
    setRevealedNumber(Math.floor(Math.random() * 45) + 1);
  };

  const handleMining = () => {
    if (selectedNumbers.length < 6) return alert(lang === 'ko' ? "원소 샘플 6개를 선택해주세요!" : "Please select 6 element samples!");
    setGameState('mining');
    setVipBonusHit(false);
    setVipTargetNumbers([]);
    
    setTimeout(() => {
      setDrawCount(prev => prev + 1);
      const results: number[] = [];
      while (results.length < 6) {
        const n = Math.floor(Math.random() * 45) + 1;
        if (!results.includes(n)) results.push(n);
      }
      const matches = selectedNumbers.filter(n => results.includes(n)).length;
      const rewards: Record<number, number> = { 0:0, 1:10, 2:100, 3:1000, 4:4000, 5:8000, 6:314159 };
      let reward = rewards[matches] || 0;

      let isBonusHit = false;
      let targets: number[] = [];
      if (userTier === 'vip') {
         while(targets.length < 2) {
           const r = Math.floor(Math.random() * 45) + 1;
           if(!targets.includes(r)) targets.push(r);
         }
         setVipTargetNumbers(targets);
         if (selectedNumbers.some(n => targets.includes(n)) && reward > 0) {
            reward = reward * 2;
            isBonusHit = true;
         }
      }

      setVipBonusHit(isBonusHit);
      setMinedNumbers(results);
      setMatchCount(matches);
      setWonAmount(reward);
      setOhmBalance(prev => prev + reward);

      // 🚩 펀치 타격 애니메이션 연결 구간
      if (reward > 0) {
        setGameState('success_punch');
        setTimeout(() => {
          setGameState('success_fireworks');
          setTimeout(() => setGameState('success_marpo'), 2000);
        }, 3000);
      } else {
        setGameState('fail_punch');
        setTimeout(() => setGameState('fail_rabbit'), 3000);
      }
    }, 6000);
  };

  const handleRetry = () => {
    setSelectedNumbers([]);
    setRevealedNumber(null);
    setAdWallWatched(0); 
    setVipBonusHit(false);
    if (userTier === 'basic' || (userTier === 'premium' && drawCount >= 5) || (userTier === 'vip' && drawCount >= 10)) {
      setGameState('ad_wall');
    } else {
      setGameState('idle');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 pb-48 flex flex-col items-center font-sans relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none fixed" style={{ backgroundImage: "radial-gradient(#f39c12 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>

      {/* 가이드 내비게이터 */}
      <div className="w-full max-w-md mt-14 mb-8 flex items-start gap-6 relative z-20">
        <div className="relative w-28 h-28 shrink-0 bg-gradient-to-tr from-black to-zinc-900 rounded-full border-4 border-amber-500 shadow-[0_0_30px_rgba(243,156,18,0.3)] flex items-center justify-center overflow-hidden animate-bounce-slow relative">
           <Image src="/marpo-stage-1.png" alt="Rabbit" fill className="object-cover scale-110" priority unoptimized />
           <div className="absolute bottom-1 right-1 bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full z-10">{userTier.toUpperCase()}</div>
        </div>
        <div className="relative flex-1 bg-zinc-900/70 border border-zinc-800 rounded-[2.5rem] p-7 shadow-2xl backdrop-blur-xl min-h-[120px] flex items-center">
          <div className="absolute top-10 -left-4 w-0 h-0 border-t-[12px] border-t-transparent border-r-[20px] border-r-zinc-800 border-b-[12px] border-b-transparent"></div>
          <p className="text-[16px] md:text-[18px] font-bold text-zinc-200 leading-relaxed italic px-2">"{currentGuides[lineIdx]}"</p>
        </div>
      </div>

      {/* 채굴 중 오버레이 */}
      {gameState === 'mining' && (
        <div className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center p-0">
          <div className="relative w-full h-full flex flex-col items-center justify-center">
             <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-80"><source src="/mining-video.mp4" type="video/mp4" /></video>
             <div className="relative z-10 flex flex-col items-center gap-6">
                <div className="w-24 h-24 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-4xl font-black text-amber-500 uppercase tracking-[0.4em] drop-shadow-[0_0_20px_rgba(243,156,18,0.8)]">Mining</p>
             </div>
          </div>
        </div>
      )}

      {/* 🟢 성공 1단계: 인플레이션 펀치 */}
      {gameState === 'success_punch' && (
        <div className="fixed inset-0 z-[1100] bg-black flex items-center justify-center animate-in fade-in duration-500">
          <div className="relative w-full h-full">
            <Image src="/인플레이션 펀치.png" alt="Inflation Punch" fill className="object-cover" priority unoptimized />
            <div className="absolute top-20 left-0 w-full text-center z-10">
              <p className="text-5xl md:text-7xl font-black text-lime-400 uppercase italic tracking-tighter drop-shadow-[0_0_30px_rgba(163,230,53,1)] animate-pulse">
                {lang === 'ko' ? 'Inflation Smashed!' : 'Inflation Smashed!'}
              </p>
            </div>
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-xl px-10 z-10">
                <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                  {/* 🚩 3초 진행 게이지 (복구 완료) */}
                  <div className="h-full bg-lime-500 animate-progress-3s"></div>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* 🟢 성공 2단계: 폭죽 애니메이션 */}
      {gameState === 'success_fireworks' && (
        <div className="fixed inset-0 z-[1200] bg-black/80 flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="firework-container relative w-full h-full overflow-hidden">
            {[...Array(20)].map((_, i) => ( <div key={i} className={`firework firework-${i+1}`}></div> ))}
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-center flex flex-col items-center gap-6">
            <Sparkles size={100} className="text-amber-400 animate-pulse drop-shadow-[0_0_30px_rgba(243,156,18,0.8)]" />
            <p className="text-6xl md:text-8xl font-black text-white uppercase italic tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.5)] leading-none font-urbanist">CELEBRATION</p>
          </div>
        </div>
      )}

      {/* 🟢 성공 3단계: 마르포 축하창 */}
      {gameState === 'success_marpo' && (
        <div className="fixed inset-0 z-[1300] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 animate-in zoom-in duration-300">
          <div className="bg-gradient-to-b from-zinc-900 to-black border-4 border-lime-500 rounded-[4rem] p-12 w-full max-w-xl text-center shadow-[0_0_60px_rgba(163,230,53,0.3)] relative overflow-hidden">
            {vipBonusHit && (
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[120%] py-2 bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500 rotate-[-2deg] border-y-4 border-black z-20 flex flex-col items-center">
                <span className="text-black font-black text-xl italic uppercase tracking-[0.2em] animate-pulse">🔥 VIP 2X MULTIPLIER 🔥</span>
                <span className="text-black font-bold text-[10px] uppercase">Lucky Numbers: {vipTargetNumbers.join(', ')}</span>
              </div>
            )}
            <div className={`w-40 h-40 mx-auto mb-8 relative animate-bounce-slow z-10 ${vipBonusHit ? 'mt-10' : ''}`}>
               <Image src="/marpo-celebrate.png" alt="Celebrating Marpo" fill className="object-contain" unoptimized />
               <Flame className="absolute -top-4 -right-4 text-lime-400 animate-pulse" size={32} />
            </div>
            <div className="relative mb-12 bg-black/50 border border-zinc-800 p-8 rounded-3xl z-10">
                <div className="absolute -top-3 -left-3 text-lime-500 text-6xl font-serif">“</div>
                <p className="text-2xl md:text-3xl font-black text-white leading-tight italic tracking-tight px-4 break-keep">
                  {lang === 'ko' ? <>축하합니다.<br/>디플레이션에 한걸음 나아갑니다.</> : <>Congratulations.<br/>One step closer to deflation.</>}
                </p>
                <div className="absolute -bottom-10 -right-3 text-lime-500 text-6xl font-serif">”</div>
            </div>
            <div className="mb-12 text-center z-10 relative">
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">Rewards Gained</p>
                <p className={`text-5xl font-black tracking-tighter ${vipBonusHit ? 'text-yellow-400' : 'text-white'}`}>
                  +{wonAmount.toLocaleString()} <span className="text-amber-500 italic">Ω</span>
                </p>
            </div>
            <button onClick={handleRetry} className="w-full flex items-center justify-center gap-3 py-6 bg-lime-500 text-black rounded-2xl font-black text-xl hover:scale-105 active:scale-95 transition-all relative z-10">
              <RefreshCcw size={24} /> {lang === 'ko' ? "재도전 (새 원석 선택)" : "Retry (New Selection)"}
            </button>
          </div>
        </div>
      )}

      {/* 🔴 실패 1단계: 인플레이션 역습 (펀치) */}
      {gameState === 'fail_punch' && (
        <div className="fixed inset-0 z-[1100] bg-black flex items-center justify-center animate-in fade-in duration-500">
          <div className="relative w-full h-full">
            <Image src="/인플레이션 펀치커버 .png" alt="Inflation Counterattack" fill className="object-cover" priority unoptimized />
            <div className="absolute top-20 left-0 w-full text-center z-10">
              <p className="text-5xl md:text-7xl font-black text-red-500 uppercase italic tracking-tighter drop-shadow-[0_0_30px_rgba(239,68,68,1)] animate-pulse">
                {lang === 'ko' ? 'Inflation Strikes Back!' : 'Inflation Strikes Back!'}
              </p>
            </div>
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-xl px-10 z-10">
                <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                  {/* 🚩 3초 진행 게이지 (복구 완료) */}
                  <div className="h-full bg-red-600 animate-progress-3s"></div>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔴 실패 2단계: 토끼 독려창 */}
      {gameState === 'fail_rabbit' && (
        <div className="fixed inset-0 z-[1200] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 animate-in zoom-in duration-300">
          <div className="bg-gradient-to-b from-zinc-900 to-black border-4 border-amber-600 rounded-[4rem] p-12 w-full max-w-xl text-center shadow-[0_0_60px_rgba(243,156,18,0.2)] relative overflow-hidden">
            <div className="w-48 h-48 mx-auto mb-6 relative animate-bounce-slow z-10">
               <Image src="/marpo-stage-1.png" alt="Encouraging Rabbit" fill className="object-contain" unoptimized />
            </div>
            <div className="relative mb-10 bg-black/50 border border-zinc-800 p-8 rounded-3xl z-10">
                <div className="absolute -top-3 -left-3 text-amber-500 text-6xl font-serif">“</div>
                <p className="text-xl md:text-2xl font-black text-white leading-relaxed italic tracking-tight px-2 break-keep">
                  {lang === 'ko' ? <>실망하지 마세요,<br/>토끼굴 안에서는 불가능은 없습니다.<br/><span className="text-amber-500">다시 도전 하세요!</span></> : 
                  <>Don't be disappointed.<br/>Nothing is impossible in the rabbit hole.<br/><span className="text-amber-500">Try again!</span></>}
                </p>
                <div className="absolute -bottom-10 -right-3 text-amber-500 text-6xl font-serif">”</div>
            </div>
            <button onClick={handleRetry} className="w-full flex items-center justify-center gap-3 py-6 bg-amber-500 text-black rounded-2xl font-black text-xl hover:scale-105 active:scale-95 transition-all relative z-10">
              <RefreshCcw size={24} /> {lang === 'ko' ? "재도전 (전술 재정비)" : "Retry (Regroup Strategy)"}
            </button>
          </div>
        </div>
      )}

      {/* 광고 모달 */}
      {gameState === 'ad_wall' && (
        <div className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 animate-in zoom-in duration-300">
          <div className="bg-zinc-900 border-2 border-amber-500 rounded-[3rem] p-10 w-full max-w-md text-center shadow-2xl relative overflow-hidden">
            <PlaySquare size={64} className="text-amber-500 mx-auto mb-6 animate-pulse" />
            <h2 className="text-3xl font-black text-white mb-2 italic uppercase">System Alert</h2>
            <div className="h-1 w-20 bg-amber-500 mx-auto mb-8 rounded-full"></div>
            <div className="bg-black/50 p-6 rounded-2xl mb-10 border border-zinc-800 text-sm leading-relaxed text-zinc-300 font-bold break-keep">
              {userTier === 'basic' && <p>{lang === 'ko' ? "베이직 유저 탐색 프로토콜: 새 채굴을 위해 광고를 1회 시청해 주십시오." : "Basic Protocol: Please watch 1 ad to continue mining."}</p>}
              {userTier === 'premium' && <p>{lang === 'ko' ? "프리미엄 5회 프리드로우 완료: 추가 드로우를 위해 광고를 1회 시청해 주십시오." : "Premium: 5 Free draws used. Watch 1 ad for an extra draw."}</p>}
              {userTier === 'vip' && <p>{lang === 'ko' ? "VIP 10회 프리드로우 완료: 추가 드로우를 위해 광고를 1회 시청해 주십시오." : "VIP: 10 Free draws used. Watch 1 ad for an extra draw."}</p>}
            </div>
            <button onClick={() => { alert(lang === 'ko' ? "✅ 광고 시청 완료!" : "✅ Ad watched!"); setGameState('idle'); }} className="w-full py-5 bg-amber-500 text-black rounded-xl font-black text-lg mb-4 hover:scale-105 active:scale-95 transition-all">
               {lang === 'ko' ? "광고 시청하기" : "Watch Advertisement"} (0/1)
            </button>
            <button onClick={() => setGameState('idle')} className="text-zinc-500 text-xs font-bold underline hover:text-white transition-colors">
              {lang === 'ko' ? "나중에 하기" : "Later"}
            </button>
          </div>
        </div>
      )}

      {/* 리워드 풀 */}
      <section className="w-full max-w-md bg-gradient-to-br from-[#1a1a1a] to-[#050505] p-12 rounded-[3.5rem] border border-[#f39c12]/20 mb-10 shadow-2xl text-center relative z-20">
        <p className="text-xs text-zinc-600 font-black uppercase tracking-[0.4em] mb-3">MAR-Ω Reward Pool Matching</p>
        <div className="flex items-center justify-center gap-4">
          <p className="text-5xl md:text-6xl font-black text-white tracking-tighter font-mono">5,314,159</p>
          <span className="text-[#f39c12] text-4xl font-black italic">Ω</span>
        </div>
      </section>

      {/* 전술 보드판 */}
      <div className={`w-full max-w-md bg-zinc-900/30 border border-zinc-800 rounded-[3.5rem] p-8 mb-12 relative shadow-2xl z-20 ${!isUnlocked && 'opacity-50 grayscale'}`}>
        {!isUnlocked && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md rounded-[3.5rem] p-8 text-center">
            <Lock size={56} className="text-[#f39c12] mb-6 animate-pulse" />
            <p className="text-[#f39c12] font-black text-lg uppercase mb-8">System Locked</p>
            <button onClick={handleAdWatch} className="px-10 py-5 bg-[#f39c12] text-black rounded-2xl font-black text-sm uppercase">Activate Session</button>
          </div>
        )}
        <div className="grid grid-cols-6 gap-3">
          {[...Array(45)].map((_, i) => {
            const num = i + 1;
            const isSelected = selectedNumbers.includes(num);
            return (
              <button key={num} onClick={() => handleNumberToggle(num)} className={`relative aspect-square rounded-xl overflow-hidden transition-all duration-300 transform ${isSelected ? 'border-2 border-amber-500 scale-110 z-10' : 'border border-zinc-800'}`}>
                <div className={`absolute inset-0 bg-cover bg-center transition-opacity ${isSelected ? 'opacity-0' : 'opacity-100'}`} style={{ backgroundImage: `url('${getElementIcon(num)}')` }} />
                <div className={`absolute inset-0 flex items-center justify-center bg-amber-500/20 ${isSelected ? 'opacity-100' : 'opacity-0'}`}>
                  <span className="text-2xl font-black text-amber-500">{num}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 하단 금고 & 채굴 버튼 */}
      <div className="w-full max-w-md mt-auto bg-zinc-900/50 p-8 rounded-[3.5rem] border border-zinc-800 flex justify-between items-center shadow-2xl relative z-20">
         <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 text-amber-500 font-black text-3xl">Ω</div>
           <div>
             <p className="text-xs text-zinc-600 font-black mb-1 uppercase tracking-tighter">{userTier.toUpperCase()} Vault</p>
             <p className="text-2xl font-black text-white italic">{ohmBalance.toLocaleString()} <span className="text-amber-500 text-sm">Ω</span></p>
           </div>
         </div>
         <button onClick={handleMining} disabled={selectedNumbers.length < 6} className={`flex items-center gap-4 px-10 py-5 rounded-3xl font-black text-base uppercase transition-all transform active:scale-95 ${selectedNumbers.length === 6 ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(243,156,18,0.4)]' : 'bg-zinc-800 text-zinc-700'}`}>
           <Pickaxe size={24} /> {lang === 'ko' ? (drawCount > 0 ? `드로우 (${drawCount})` : '시작') : (drawCount > 0 ? `Draw (${drawCount})` : 'Start')}
         </button>
      </div>

      {/* 🌟 날아갔던 핵심 CSS 완벽 복원 🌟 */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Urbanist:ital,wght@1,900&display=swap');
        .font-urbanist { font-family: 'Urbanist', sans-serif; }
        
        .firework { position: absolute; width: 5px; height: 5px; border-radius: 50%; opacity: 0; transform-origin: center; }
        .firework-1 { background-color: #f39c12; animation: explode-1 2s ease-out forwards; top: 50%; left: 50%; }
        .firework-2 { background-color: #ffffff; animation: explode-2 1.8s ease-out 0.2s forwards; top: 40%; left: 60%; }
        .firework-3 { background-color: #a3e235; animation: explode-3 2.2s ease-out 0.1s forwards; top: 60%; left: 40%; }
        .firework-4 { background-color: #f39c12; animation: explode-4 1.9s ease-out 0.3s forwards; top: 30%; left: 50%; }
        .firework-5 { background-color: #ffffff; animation: explode-1 2.1s ease-out 0.2s forwards; top: 70%; left: 55%; }
        .firework-6 { background-color: #f39c12; animation: explode-2 2s ease-out 0.5s forwards; top: 50%; left: 20%; }
        .firework-7 { background-color: #a3e235; animation: explode-3 1.7s ease-out 0.1s forwards; top: 20%; left: 80%; }
        .firework-8 { background-color: #ffffff; animation: explode-4 2.3s ease-out 0.4s forwards; top: 80%; left: 30%; }
        .firework-9 { background-color: #f39c12; animation: explode-1 2.0s ease-out 0.6s forwards; top: 60%; left: 70%; }
        .firework-10 { background-color: #ffffff; animation: explode-2 1.9s ease-out 0.2s forwards; top: 30%; left: 30%; }

        @keyframes explode-1 { 0% { transform: scale(1) translate(0, 0); opacity: 1; } 100% { transform: scale(0) translate(200px, -200px); opacity: 0; } }
        @keyframes explode-2 { 0% { transform: scale(1) translate(0, 0); opacity: 1; } 100% { transform: scale(0) translate(-250px, -150px); opacity: 0; } }
        @keyframes explode-3 { 0% { transform: scale(1) translate(0, 0); opacity: 1; } 100% { transform: scale(0) translate(150px, 250px); opacity: 0; } }
        @keyframes explode-4 { 0% { transform: scale(1) translate(0, 0); opacity: 1; } 100% { transform: scale(0) translate(-200px, 200px); opacity: 0; } }

        @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        @keyframes progress-3s { from { width: 0%; } to { width: 100%; } }
        @keyframes neon-blink { 0%, 100% { opacity: 1; text-shadow: 0 0 15px rgba(163,230,53,1); } 50% { opacity: 0.1; } }

        .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
        .animate-progress-3s { animation: progress-3s 3s linear forwards; }
        .animate-infinite-blink { animation: neon-blink 1s linear infinite; }
      `}</style>
    </div>
  );
}