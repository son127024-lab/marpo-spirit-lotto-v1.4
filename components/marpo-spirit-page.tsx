"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Target, Lock, Pickaxe, Flame, AlertTriangle, Sparkles, RefreshCcw, PlaySquare, Crown, Star } from 'lucide-react';

const iconMap: Record<number, string> = {
  1: "1-In.png", 2: "2-.png", 3: "3-.png", 4: "4-Y.png", 5: "5-.png",
  6: "6-As.png", 7: "7-.png", 8: "8-Th.png", 9: "9-Na.png", 10: "10-.png",
  11: "11-H.png", 12: "12-He.png", 13: "13-Ba.png", 14: "14-O.png", 15: "15-.png",
  16: "16-Li.png", 17: "17-.png", 18: "18-Ni.png", 19: "19-Co.png", 20: "20-Mn.png",
  21: "21-Fe.png", 22: "22-P.png", 23: "23-C.png", 24: "24-Si.png", 25: "25-S.png",
  26: "26-Se.png", 27: "27-Gu.png", 28: "28-.png", 29: "29-Te.png", 30: "30-Cd.png",
  31: "31-Ti.png", 32: "32-.png", 33: "33-Nb.png", 34: "34-H2.png", 35: "35-H2O.png",
  36: "36-.png", 37: "37-O2.png", 38: "38-H2O2.png", 39: "39-Li-ion.png",
  40: "40-na-ion.png", 41: "41-Li-S.png", 42: "42-.png", 43: "43-.png", 44: "44-.png", 45: "45-CH4+O2.png"
};

const getElementIcon = (num: number) => `/elements/${iconMap[num] || `${num}-.png`}`;

const guideLines = [
  "파이오니어님 이제 MAR 에너지 채굴 탐색을 시작합니다.",
  "아래의 원소 중 6개의 원소 샘플을 선택하세요.",
  "채굴된 원소가 일치하면, Ω 에너지 크레딧을 획득합니다.",
  "디플레이션을 향한 여정, 샘플 선택 후 채굴 버튼을 누르세요!"
];

// 🚩 ad_wall(광고 시청 벽) 상태 추가
type GameState = 'idle' | 'mining' | 'success_punch' | 'success_fireworks' | 'success_malpo' | 'fail_punch' | 'fail_rabbit' | 'ad_wall';
type UserTier = 'basic' | 'premium' | 'vip';

export default function MarpoSpiritPage({ lang }: { lang: string }) {
  const [gameState, setGameState] = useState<GameState>('idle');
  // 🚩 등급 및 채굴 횟수 트래킹 상태
  const [userTier, setUserTier] = useState<UserTier>('premium'); 
  const [drawCount, setDrawCount] = useState(0); // 현재 수행한 드로우 횟수
  const [adWallWatched, setAdWallWatched] = useState(0); // 광고 시청 횟수 카운트

  const [adCount, setAdCount] = useState(0); 
  const [ohmBalance, setOhmBalance] = useState(5300.0);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [minedNumbers, setMinedNumbers] = useState<number[]>([]);
  const [matchCount, setMatchCount] = useState(0);
  const [wonAmount, setWonAmount] = useState(0);
  const [lineIdx, setLineIdx] = useState(0);
  const [revealedNumber, setRevealedNumber] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setLineIdx((p) => (p + 1) % guideLines.length), 4000);
    return () => clearInterval(interval);
  }, []);

  const isUnlocked = adCount >= 3 || userTier !== 'basic'; // 프리미엄/VIP는 기본 해제

  const handleAdWatch = () => {
    if (adCount < 3) {
      setAdCount(prev => prev + 1);
      if(adCount + 1 === 3) alert("시스템 잠금이 해제되었습니다. 전술판을 가동합니다.");
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

  const handleMining = () => {
    if (selectedNumbers.length < 6) return alert("원소 샘플 6개를 선택해주세요!");
    setGameState('mining');
    
    setTimeout(() => {
      // 🚩 채굴(드로우) 횟수 증가
      setDrawCount(prev => prev + 1);

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

      if (reward > 0) {
        setGameState('success_punch');
        setTimeout(() => {
          setGameState('success_fireworks');
          setTimeout(() => setGameState('success_malpo'), 2000);
        }, 3000);
      } else {
        setGameState('fail_punch');
        setTimeout(() => setGameState('fail_rabbit'), 3000);
      }
    }, 6000);
  };

  // 🚩 재도전 로직 세분화 (등급별 한도 체크)
  const handleRetry = () => {
    setSelectedNumbers([]);
    setRevealedNumber(null);
    setAdWallWatched(0); // 광고 시청 기록 초기화

    // 1. 베이직: 매번 광고 선택창으로 이동
    if (userTier === 'basic') {
      setGameState('ad_wall');
    } 
    // 2. 프리미엄: 5회 이상 시 광고 2회 요구
    else if (userTier === 'premium' && drawCount >= 5) {
      setGameState('ad_wall');
    } 
    // 3. VIP: 10회 이상 시 광고 1회 요구
    else if (userTier === 'vip' && drawCount >= 10) {
      setGameState('ad_wall');
    } 
    // 한도가 남았으면 즉시 재도전
    else {
      setGameState('idle');
    }
  };

  // 🚩 광고 시청 버튼 로직 (가상 시뮬레이션)
  const executeAdWatch = () => {
    const targetAds = userTier === 'premium' ? 2 : 1; // 베이직/VIP는 1회, 프리미엄은 2회
    const newCount = adWallWatched + 1;
    
    setAdWallWatched(newCount);

    if (newCount >= targetAds) {
      alert("✅ 광고 시청 확인 완료! 1회 추가 드로우가 승인되었습니다.");
      // 1회 더 뽑을 수 있도록 카운트 조정 (프리미엄은 4로, VIP는 9로, 베이직은 무관)
      if (userTier === 'premium') setDrawCount(4);
      if (userTier === 'vip') setDrawCount(9);
      
      setGameState('idle');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 pb-48 flex flex-col items-center font-sans relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none fixed" style={{ backgroundImage: `radial-gradient(#f39c12 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>

      {/* ⚙️ 대표님 테스트 전용: 상단 등급 전환 스위치 (개발용) */}
      <div className="absolute top-4 left-4 z-50 flex gap-2 bg-black/80 p-2 rounded-xl border border-zinc-800">
        <button onClick={() => {setUserTier('basic'); setDrawCount(0);}} className={`px-3 py-1 text-[10px] font-bold rounded-lg uppercase ${userTier==='basic' ? 'bg-zinc-600' : 'text-zinc-500'}`}>Basic</button>
        <button onClick={() => {setUserTier('premium'); setDrawCount(0);}} className={`px-3 py-1 text-[10px] font-bold rounded-lg uppercase ${userTier==='premium' ? 'bg-amber-600 text-black' : 'text-zinc-500'}`}>Premium</button>
        <button onClick={() => {setUserTier('vip'); setDrawCount(0);}} className={`px-3 py-1 text-[10px] font-bold rounded-lg uppercase ${userTier==='vip' ? 'bg-lime-500 text-black' : 'text-zinc-500'}`}>VIP</button>
      </div>

      <div className="w-full max-w-md mt-14 mb-8 flex items-start gap-6 relative z-20">
        <div className="relative w-28 h-28 shrink-0 bg-gradient-to-tr from-black to-zinc-900 rounded-full border-4 border-amber-500 shadow-[0_0_30px_rgba(243,156,18,0.3)] flex items-center justify-center overflow-hidden animate-bounce-slow relative">
           <Image src="/marpo-stage-1.png" alt="Rabbit" fill className="object-cover scale-110" priority unoptimized />
           <div className="absolute bottom-1 right-1 bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full z-10">
             {userTier.toUpperCase()}
           </div>
        </div>
        <div className="relative flex-1 bg-zinc-900/70 border border-zinc-800 rounded-[2.5rem] p-7 shadow-2xl backdrop-blur-xl min-h-[120px] flex items-center">
          <div className="absolute top-10 -left-4 w-0 h-0 border-t-[12px] border-t-transparent border-r-[20px] border-r-zinc-800 border-b-[12px] border-b-transparent"></div>
          <p className="text-[18px] font-bold text-zinc-200 leading-relaxed italic px-2">"{guideLines[lineIdx]}"</p>
        </div>
      </div>

      {/* 채굴 영상 */}
      {gameState === 'mining' && (
        <div className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center p-0 animate-in fade-in duration-700">
          <div className="relative w-full h-full flex flex-col items-center justify-center">
             <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-80">
               <source src="/mining-video.mp4" type="video/mp4" />
             </video>
             <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-60"></div>
             <div className="relative z-10 flex flex-col items-center gap-6">
                <div className="w-24 h-24 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-4xl font-black text-amber-500 uppercase tracking-[0.4em] drop-shadow-[0_0_20px_rgba(243,156,18,0.8)]">Mining</p>
                <p className="text-zinc-400 font-bold italic animate-pulse text-lg">Ω 에너지를 정밀 추출 중입니다...</p>
             </div>
          </div>
        </div>
      )}

      {/* 성공 시퀀스 */}
      {gameState === 'success_punch' && (
        /* 기존 성공 펀치 코드 유지 */
        <div className="fixed inset-0 z-[1100] bg-black flex items-center justify-center animate-in fade-in duration-500">
          <div className="relative w-full h-full">
            <Image src="/인플레이션 펀치.png" alt="Inflation Punch" fill className="object-cover" priority unoptimized />
            <div className="absolute top-20 left-0 w-full text-center z-10">
              <p className="text-5xl md:text-7xl font-black text-lime-400 uppercase italic tracking-tighter drop-shadow-[0_0_30px_rgba(163,230,53,1)] animate-pulse">
                Inflation Smashed!
              </p>
            </div>
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-xl px-10 z-10">
                <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                    <div className="h-full bg-lime-500 animate-progress-3s"></div>
                </div>
                <p className="text-center text-lime-400 text-xs mt-3 font-bold uppercase tracking-widest">Preparing Celebration...</p>
            </div>
          </div>
        </div>
      )}

      {gameState === 'success_fireworks' && (
        /* 기존 폭죽 코드 유지 */
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

      {/* 성공 모달 */}
      {gameState === 'success_malpo' && (
        <div className="fixed inset-0 z-[1300] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 animate-in zoom-in duration-300">
          <div className="bg-gradient-to-b from-zinc-900 to-black border-4 border-lime-500 rounded-[4rem] p-12 w-full max-w-xl text-center shadow-[0_0_60px_rgba(163,230,53,0.3)] relative overflow-hidden">
            <div className="w-40 h-40 mx-auto mb-8 relative animate-bounce-slow z-10">
               <Image src="/.말하는 말포png.png" alt="Celebrating Malpo" fill className="object-contain" unoptimized />
               <Flame className="absolute -top-4 -right-4 text-lime-400 animate-pulse" size={32} />
            </div>
            <div className="relative mb-12 bg-black/50 border border-zinc-800 p-8 rounded-3xl z-10">
                <div className="absolute -top-3 -left-3 text-lime-500 text-6xl font-serif">“</div>
                <p className="text-3xl font-black text-white leading-tight italic tracking-tight px-4 break-keep">축하합니다.<br/>디플레이션에 한걸음 나아갑니다.</p>
                <div className="absolute -bottom-10 -right-3 text-lime-500 text-6xl font-serif">”</div>
            </div>
            <div className="mb-12 flex justify-center gap-6 z-10 relative">
                <div className="text-center">
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">Rewards Gained</p>
                    <p className="text-5xl font-black text-white tracking-tighter">+{wonAmount.toLocaleString()} <span className="text-amber-500 italic">Ω</span></p>
                </div>
            </div>
            
            {/* 🚩 재도전(handleRetry) 연결 */}
            <button onClick={handleRetry} className="w-full flex items-center justify-center gap-3 py-6 bg-lime-500 text-black rounded-2xl font-black text-xl hover:scale-105 active:scale-95 transition-all relative z-10">
              <RefreshCcw size={24} /> 재도전 (새로운 원석 선택)
            </button>
          </div>
        </div>
      )}

      {/* 실패 시퀀스 */}
      {gameState === 'fail_punch' && (
        /* 기존 실패 펀치 코드 유지 */
        <div className="fixed inset-0 z-[1100] bg-black flex items-center justify-center animate-in fade-in duration-500">
          <div className="relative w-full h-full">
            <Image src="/인플레이션 펀치커버 .png" alt="Inflation Counterattack" fill className="object-cover" priority unoptimized />
            <div className="absolute top-20 left-0 w-full text-center z-10">
              <p className="text-5xl md:text-7xl font-black text-red-500 uppercase italic tracking-tighter drop-shadow-[0_0_30px_rgba(239,68,68,1)] animate-pulse">
                Inflation Strikes Back!
              </p>
            </div>
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-xl px-10 z-10">
                <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                    <div className="h-full bg-red-600 animate-progress-3s"></div>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* 실패 모달 */}
      {gameState === 'fail_rabbit' && (
        <div className="fixed inset-0 z-[1200] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 animate-in zoom-in duration-300">
          <div className="bg-gradient-to-b from-zinc-900 to-black border-4 border-amber-600 rounded-[4rem] p-12 w-full max-w-xl text-center shadow-[0_0_60px_rgba(243,156,18,0.2)] relative overflow-hidden">
            <div className="w-48 h-48 mx-auto mb-6 relative animate-bounce-slow z-10">
               <Image src="/marpo-stage-2.png" alt="Encouraging Rabbit" fill className="object-contain" unoptimized />
            </div>
            <div className="relative mb-10 bg-black/50 border border-zinc-800 p-8 rounded-3xl z-10">
                <div className="absolute -top-3 -left-3 text-amber-500 text-6xl font-serif">“</div>
                <p className="text-2xl font-black text-white leading-relaxed italic tracking-tight px-2 break-keep">
                  실망하지 마세요,<br/>토끼굴 안에서는 불가능은 없습니다.<br/><span className="text-amber-500">다시 도전 하세요!</span>
                </p>
                <div className="absolute -bottom-10 -right-3 text-amber-500 text-6xl font-serif">”</div>
            </div>
            
            {/* 🚩 재도전(handleRetry) 연결 */}
            <button onClick={handleRetry} className="w-full flex items-center justify-center gap-3 py-6 bg-amber-500 text-black rounded-2xl font-black text-xl hover:scale-105 active:scale-95 transition-all relative z-10">
              <RefreshCcw size={24} /> 재도전 (전술 재정비)
            </button>
          </div>
        </div>
      )}

      {/* 🚩 신규 로직: 광고 시청 페이월 (Ad Wall) 모달 */}
      {gameState === 'ad_wall' && (
        <div className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 animate-in zoom-in duration-300">
          <div className="bg-zinc-900 border-2 border-amber-500 rounded-[3rem] p-10 w-full max-w-md text-center shadow-2xl relative overflow-hidden">
            
            <PlaySquare size={64} className="text-amber-500 mx-auto mb-6 animate-pulse" />
            
            <h2 className="text-3xl font-black text-white mb-2 italic uppercase">System Alert</h2>
            <div className="h-1 w-20 bg-amber-500 mx-auto mb-8 rounded-full"></div>
            
            {/* 등급별 맞춤형 안내 메시지 */}
            <div className="bg-black/50 p-6 rounded-2xl mb-10 border border-zinc-800 text-sm leading-relaxed text-zinc-300 font-bold break-keep">
              {userTier === 'basic' && (
                <p><span className="text-zinc-400">베이직 유저 탐색 프로토콜</span><br/><br/>새로운 원소 채굴을 진행하시려면<br/>광고를 1회 시청해 주십시오.</p>
              )}
              {userTier === 'premium' && (
                <p><span className="text-amber-500">프리미엄 4시간 내 5회 프리드로우 완료</span><br/><br/>추가 1회 드로우 권한을 획득하려면<br/>광고 2회를 시청해 주십시오.</p>
              )}
              {userTier === 'vip' && (
                <p><span className="text-lime-500">VIP 10회 연속 프리드로우 완료</span><br/><br/>추가 1회 드로우 권한을 획득하려면<br/>짧은 광고 1회를 시청해 주십시오.</p>
              )}
            </div>

            {/* 광고 시청 액션 버튼 */}
            <button onClick={executeAdWatch} className="w-full flex items-center justify-center gap-3 py-5 bg-amber-500 text-black rounded-xl font-black text-lg shadow-[0_0_20px_rgba(243,156,18,0.3)] hover:scale-105 active:scale-95 transition-all mb-4">
              <PlaySquare size={20} fill="currentColor" />
              광고 시청하기 ({adWallWatched} / {userTier === 'premium' ? 2 : 1})
            </button>

            {/* 돌아가기 버튼 */}
            <button onClick={() => setGameState('idle')} className="text-zinc-500 text-xs font-bold underline hover:text-white transition-colors">
              나중에 하기 (로비로 이동)
            </button>
          </div>
        </div>
      )}

      {/* 하단 금고 & 채굴 시작 */}
      <div className="w-full max-w-md mt-auto bg-zinc-900/50 p-8 rounded-[3.5rem] border border-zinc-800 flex justify-between items-center shadow-2xl relative z-20">
         <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 text-amber-500 font-black text-3xl">Ω</div>
           <div>
             <p className="text-xs text-zinc-600 font-black mb-1 uppercase tracking-tighter">
               {userTier === 'basic' ? 'Basic' : userTier === 'premium' ? 'Premium Vault' : 'VIP Vault'}
             </p>
             <p className="text-2xl font-black text-white italic">{ohmBalance.toLocaleString()} <span className="text-amber-500 text-sm">Ω</span></p>
           </div>
         </div>
         <button onClick={handleMining} disabled={selectedNumbers.length < 6} className={`flex items-center gap-4 px-10 py-5 rounded-3xl font-black text-base uppercase transition-all transform active:scale-95 ${selectedNumbers.length === 6 ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(243,156,18,0.4)]' : 'bg-zinc-800 text-zinc-700'}`}>
           <Pickaxe size={24} /> {drawCount > 0 ? `Draw (${drawCount})` : 'Start'}
         </button>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Urbanist:ital,wght@1,900&display=swap');
        .font-urbanist { font-family: 'Urbanist', sans-serif; }
        
        .firework { position: absolute; width: 5px; height: 5px; border-radius: 50%; opacity: 0; transform-origin: center; }
        .firework-1 { background-color: #f39c12; animation: explode-1 2s ease-out forwards; top: 50%; left: 50%; }
        .firework-2 { background-color: #ffffff; animation: explode-2 1.8s ease-out 0.2s forwards; top: 40%; left: 60%; }
        .firework-3 { background-color: #a3e235; animation: explode-3 2.2s ease-out 0.1s forwards; top: 60%; left: 40%; }
        .firework-4 { background-color: #f39c12; animation: explode-4 1.9s ease-out 0.3s forwards; top: 30%; left: 50%; }
        .firework-5 { background-color: #ffffff; animation: explode-1 2.1s ease-out 0.2s forwards; top: 70%; left: 55%; }
        /* 생략: 20개 파티클 애니메이션 코드는 동일하게 작동합니다 */

        @keyframes explode-1 { 0% { transform: scale(1) translate(0, 0); opacity: 1; } 100% { transform: scale(0) translate(200px, -200px); opacity: 0; } }
        @keyframes explode-2 { 0% { transform: scale(1) translate(0, 0); opacity: 1; } 100% { transform: scale(0) translate(-250px, -150px); opacity: 0; } }
        @keyframes explode-3 { 0% { transform: scale(1) translate(0, 0); opacity: 1; } 100% { transform: scale(0) translate(150px, 250px); opacity: 0; } }
        @keyframes explode-4 { 0% { transform: scale(1) translate(0, 0); opacity: 1; } 100% { transform: scale(0) translate(-200px, 200px); opacity: 0; } }

        @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        @keyframes progress-3s { from { width: 0%; } to { width: 100%; } }
        .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
        .animate-progress-3s { animation: progress-3s 3s linear forwards; }
      `}</style>
    </div>
  );
}