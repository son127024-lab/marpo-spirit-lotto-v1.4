"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Lock, Pickaxe, Flame, Sparkles, RefreshCcw, PlaySquare, Lightbulb, Wallet, X, ChevronRight, Target, Zap, Beaker, Gem, Timer, CheckCircle2 } from 'lucide-react';

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

const getElementValue = (num: number) => {
  if (num <= 15) return 1000;
  if (num <= 25) return 5000;
  if (num <= 35) return 30000;
  if (num <= 44) return 150000;
  return 1000000;
};

// 원석 등급별 융합 수수료율
// 낮은 원석은 진입 장벽을 낮추고, 높은 원석은 Ω 소각량을 강하게 올려 인플레이션을 방어함
const calcFusionFeeRate = (a: number, b: number) => {
  const highest = Math.max(a, b);

  if (highest <= 15) return 0.05; // 1~15번: 5%
  if (highest <= 25) return 0.07; // 16~25번: 7%
  if (highest <= 35) return 0.10; // 26~35번: 10%
  if (highest <= 44) return 0.15; // 36~44번: 15%
  return 0.25; // 45번: 25%
};

const calcFusionCost = (a: number, b: number) => {
  const totalValue = getElementValue(a) + getElementValue(b);
  return Math.floor(totalValue * calcFusionFeeRate(a, b));
};

const formatFusionFeeRate = (a: number, b: number) => `${Math.round(calcFusionFeeRate(a, b) * 100)}%`;

const calcFusionChance = (a: number, b: number) => Math.max(5, 90 - (Math.abs(a - b) * 2));

const guideData = {
  ko: [
    "파이오니어님 이제 MAR 에너지 채굴 탐색을 시작합니다.",
    "아래의 원소 중 6개의 원소 샘플을 선택하세요.",
    "채굴된 원석은 12시간의 숙성(결정화)이 필요합니다.",
    "융합제는 마르포 런(Chapter 3)에서 획득할 수 있습니다!"
  ],
  en: [
    "Pioneer, the MAR energy mining exploration begins now.",
    "Please select 6 element samples from the elements below.",
    "Mined elements require 12 hours of maturation.",
    "Catalysts can be obtained in Marpo Run (Chapter 3)!"
  ]
};

type GameState = 'idle' | 'mining_video' | 'analyzing' | 'win_result' | 'fail_result' | 'ad_wall' | 'fusion_analyzing' | 'fusion_success' | 'fusion_fail';
type UserTier = 'basic' | 'premium' | 'vip';

interface MaturingItem {
  id: string;
  num: number;
  unlockAt: number;
}

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

  // 🚩 신규: 마스터 루프 재화 및 상태
  const [catalysts, setCatalysts] = useState(5); // 일반 융합제 (테스트용 5개)
  const [masterCatalysts, setMasterCatalysts] = useState(1); // 무적 융합제 (테스트용 1개)
  const [dailyFusions, setDailyFusions] = useState(0); // 일일 융합 횟수
  const [maturingItems, setMaturingItems] = useState<MaturingItem[]>([]); // 12시간 숙성 대기열
  const [now, setNow] = useState(Date.now()); // 실시간 타이머용

  // 금고 (Vault)
  const [inventory, setInventory] = useState<Record<number, number>>({});
  const [showVault, setShowVault] = useState(false);
  const [earnedElement, setEarnedElement] = useState<number | null>(null);

  // 융합소 (Fusion Lab)
  const [isFusionMode, setIsFusionMode] = useState(false);
  const [slotA, setSlotA] = useState<number | null>(null);
  const [slotB, setSlotB] = useState<number | null>(null);
  const [fusionResultNode, setFusionResultNode] = useState<number | null>(null);
  const [useMasterCatalyst, setUseMasterCatalyst] = useState(false); // 무적 융합제 사용 여부

  const currentGuides = guideData[lang] || guideData.ko;

  // 초기화 및 실시간 시계 작동
  useEffect(() => {
    const savedTier = localStorage.getItem('marpo_tier') as UserTier;
    if (savedTier) setUserTier(savedTier);
    
    const savedInv = localStorage.getItem('marpo_inventory');
    if (savedInv) setInventory(JSON.parse(savedInv));

    const savedMaturing = localStorage.getItem('marpo_maturing');
    if (savedMaturing) setMaturingItems(JSON.parse(savedMaturing));

    // 일일 융합 횟수 리셋 로직 (자정 기준)
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem('marpo_fusion_date');
    if (savedDate !== today) {
      setDailyFusions(0);
      localStorage.setItem('marpo_fusion_date', today);
      localStorage.setItem('marpo_daily_fusions', '0');
    } else {
      setDailyFusions(Number(localStorage.getItem('marpo_daily_fusions') || 0));
    }

    const textInterval = setInterval(() => setLineIdx((p) => (p + 1) % currentGuides.length), 4000);
    const clockInterval = setInterval(() => setNow(Date.now()), 1000);

    return () => {
      clearInterval(textInterval);
      clearInterval(clockInterval);
    };
  }, [currentGuides]);

  const isUnlocked = adCount >= 3 || userTier !== 'basic'; 

  // --- [시간 포맷터] ---
  const formatTimeLeft = (unlockAt: number) => {
    const diff = unlockAt - now;
    if (diff <= 0) return "READY";
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // --- [사령관 전용 치트: 즉시 숙성 완료] ---
  const devSkipMaturation = (id: string) => {
    setMaturingItems(prev => {
      const next = prev.map(item => item.id === id ? { ...item, unlockAt: Date.now() - 1000 } : item);
      localStorage.setItem('marpo_maturing', JSON.stringify(next));
      return next;
    });
  };

  // --- [수확: 숙성 완료된 원석을 인벤토리로 이동] ---
  const harvestElement = (id: string, num: number) => {
    setMaturingItems(prev => {
      const next = prev.filter(item => item.id !== id);
      localStorage.setItem('marpo_maturing', JSON.stringify(next));
      return next;
    });
    setInventory(prevInv => {
      const updatedInv = { ...prevInv };
      updatedInv[num] = (updatedInv[num] || 0) + 1;
      localStorage.setItem('marpo_inventory', JSON.stringify(updatedInv));
      return updatedInv;
    });
  };

  const handleReveal = () => {
    if (ohmBalance < 1000) return alert(lang === 'ko' ? "Ω 잔액이 부족합니다." : "Insufficient MAR-Ω.");
    setOhmBalance(prev => prev - 1000);
    setRevealedNumber(Math.floor(Math.random() * 45) + 1);
  };

  const handleNumberToggle = (num: number) => {
    if (!isUnlocked) return;
    if (selectedNumbers.includes(num)) setSelectedNumbers(selectedNumbers.filter(n => n !== num));
    else if (selectedNumbers.length < 6) setSelectedNumbers([...selectedNumbers, num].sort((a, b) => a - b));
  };

  // --- [챕터 1: 채굴 로직 (숙성실로 이동)] ---
  const handleMining = () => {
    if (selectedNumbers.length < 6) return alert(lang === 'ko' ? "원소 샘플 6개를 선택해주세요!" : "Please select 6 element samples!");
    setGameState('mining_video');
    setEarnedElement(null);

    setTimeout(() => {
      setGameState('analyzing');
      setLoadingProgress(0);
      const progressInterval = setInterval(() => setLoadingProgress(prev => (prev >= 100 ? 100 : prev + 1)), 50);

      setTimeout(() => {
        clearInterval(progressInterval);
        setDrawCount(prev => prev + 1);
        
        const results: number[] = [];
        while (results.length < 6) {
          const n = Math.floor(Math.random() * 45) + 1;
          if (!results.includes(n)) results.push(n);
        }
        const matches = selectedNumbers.filter(n => results.includes(n)).length;
        
        let reward = 0;
        let obtainedElement: number | null = null;

        if (matches > 0 || Math.random() > 0.7) { 
          const actualMatches = matches > 0 ? matches : 1;
          reward = actualMatches === 1 ? 500 : actualMatches === 2 ? 1500 : actualMatches === 3 ? 5000 : actualMatches === 4 ? 20000 : actualMatches === 5 ? 100000 : 314159;
          
          if (actualMatches === 1) obtainedElement = Math.floor(Math.random() * 15) + 1; 
          else if (actualMatches === 2) obtainedElement = Math.floor(Math.random() * 10) + 16; 
          else if (actualMatches === 3) obtainedElement = Math.floor(Math.random() * 10) + 26; 
          else obtainedElement = Math.floor(Math.random() * 10) + 36; 

          setEarnedElement(obtainedElement);

          // 🚩 즉시 획득이 아닌 인큐베이터(12시간 숙성)로 이동
          const newItem: MaturingItem = {
            id: Math.random().toString(36).substring(2, 11),
            num: obtainedElement,
            unlockAt: Date.now() + (12 * 60 * 60 * 1000) // 12시간 후
          };

          setMaturingItems(prev => {
            const next = [...prev, newItem];
            localStorage.setItem('marpo_maturing', JSON.stringify(next));
            return next;
          });
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
    if (userTier === 'basic' || (userTier === 'premium' && drawCount >= 5) || (userTier === 'vip' && drawCount >= 10)) setGameState('ad_wall');
    else setGameState('idle');
  };

  // --- [챕터 2: 융합 로직] ---
  const handleSelectForFusion = (num: number) => {
    let available = inventory[num] || 0;
    if (slotA === num) available--;
    if (slotB === num) available--;
    if (available > 0) {
      if (!slotA) setSlotA(num);
      else if (!slotB) setSlotB(num);
    }
  };

  const handleRemoveFromSlot = (slot: 'A'|'B') => {
    if (slot === 'A') setSlotA(null);
    if (slot === 'B') setSlotB(null);
  };

  const executeFusion = () => {
    if (!slotA || !slotB) return;
    
    // 🚩 마스터 루프 조건 체크
    if (dailyFusions >= 3) return alert(lang === 'ko' ? "일일 융합 한도(3회)를 초과했습니다." : "Daily fusion limit (3) exceeded.");
    if (useMasterCatalyst && masterCatalysts < 1) return alert(lang === 'ko' ? "무적 융합제가 부족합니다." : "Not enough Master Catalysts.");
    if (!useMasterCatalyst && catalysts < 1) return alert(lang === 'ko' ? "융합제가 부족합니다. 마르포 런에서 획득하세요!" : "Not enough Catalysts.");

    const cost = calcFusionCost(slotA, slotB);
    if (ohmBalance < cost) return alert(lang === 'ko' ? `융합 비용(${cost} Ω)이 부족합니다!` : `Not enough Ω (${cost})!`);

    // 자원 차감
    setOhmBalance(prev => prev - cost);
    if (useMasterCatalyst) setMasterCatalysts(prev => prev - 1);
    else setCatalysts(prev => prev - 1);
    
    const newDailyCount = dailyFusions + 1;
    setDailyFusions(newDailyCount);
    localStorage.setItem('marpo_daily_fusions', newDailyCount.toString());

    setInventory(prev => {
      const next = { ...prev };
      next[slotA]! -= 1;
      next[slotB]! -= 1;
      return next;
    });

    // 성공 확률 (무적 융합제 사용 시 100%)
    const chance = useMasterCatalyst ? 100 : calcFusionChance(slotA, slotB);
    const isSuccess = (Math.random() * 100) <= chance;
    
    const resultNum = isSuccess ? Math.min(45, slotA + slotB) : Math.min(slotA, slotB);
    setFusionResultNode(resultNum);

    setGameState('fusion_analyzing');
    // 화면 겹침 방지: 융합 연출 시작 시 Vault/Fusion Lab 모달을 먼저 닫음
    setShowVault(false);
    setIsFusionMode(false);
    setLoadingProgress(0);
    const progInt = setInterval(() => setLoadingProgress(p => p >= 100 ? 100 : p + 1), 40);

    setTimeout(() => {
      clearInterval(progInt);
      if (isSuccess) setGameState('fusion_success');
      else setGameState('fusion_fail');

      setInventory(prev => {
        const next = { ...prev };
        next[resultNum] = (next[resultNum] || 0) + 1;
        localStorage.setItem('marpo_inventory', JSON.stringify(next));
        return next;
      });

      setTimeout(() => {
        setGameState('idle');
        setSlotA(null);
        setSlotB(null);
        setFusionResultNode(null);
        setUseMasterCatalyst(false); // 리셋
      }, 5000); 
    }, 4000);
  };

  const renderCoalParticles = (isRed = false) => {
    const particles = [];
    const colors = isRed ? ['#4a0404', '#7a0505', '#ff0000', '#2a0000'] : ['#0a0a0a', '#1a1a1a', '#2a2a2a', '#3a3a3a'];
    for (let i = 0; i < 80; i++) {
      const style = {
        '--dir-x': `${Math.random() * 800 - 400}px`, '--dir-y': `${Math.random() * 800 - 400}px`,
        '--rot': `${Math.random() * 720}deg`, '--delay': `${Math.random() * 0.3}s`,
        'width': `${Math.random() * 15 + 8}px`, 'height': `${Math.random() * 15 + 8}px`,
        'background': colors[Math.floor(Math.random() * colors.length)],
      } as React.CSSProperties;
      particles.push(<div key={i} className="coal-particle" style={style} />);
    }
    return particles;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 pb-48 flex flex-col items-center font-sans relative overflow-x-hidden">
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: "radial-gradient(#f39c12 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>

      {/* 모달: 마이닝 비디오 & 분석 */}
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
            <div className="w-full h-4 bg-black/50 rounded-full overflow-hidden border-2 border-zinc-700"><div className="h-full bg-amber-500" style={{ width: `${loadingProgress}%` }}></div></div>
          </div>
        </div>
      )}

      {/* 챕터 1 결과 */}
      {gameState === 'win_result' && (
        <div className="fixed inset-0 z-[1200] bg-black/95 flex flex-col items-center justify-center p-6 animate-in zoom-in duration-300">
          <div className="relative z-10 text-center flex flex-col items-center">
            <div className="relative w-64 h-64 mb-4 animate-bounce-in"><Image src="/토끼원석.png" alt="Winner Rabbit" fill className="object-contain" unoptimized /></div>
            <h2 className="text-6xl font-black text-amber-500 mb-2 italic uppercase tracking-tighter">SUCCESS!</h2>
            <p className="text-4xl font-black text-white mb-6">+{wonAmount.toLocaleString()} Ω</p>
            
            {earnedElement && (
              <div className="flex flex-col items-center gap-2 bg-zinc-900/90 px-8 py-5 rounded-[2rem] border-2 border-lime-500 shadow-[0_0_20px_rgba(132,204,22,0.4)] animate-in slide-in-from-bottom duration-500 delay-300">
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12"><Image src={getElementIcon(earnedElement)} alt={`Element`} fill className="object-contain" unoptimized /></div>
                  <div className="text-left">
                    <p className="text-[10px] text-lime-400 font-black uppercase tracking-widest">Sent to Incubator</p>
                    <p className="text-xl font-black text-white">{lang === 'ko' ? `${earnedElement}번 원석 발견!` : `Found #${earnedElement}!`}</p>
                  </div>
                </div>
                <p className="text-xs text-zinc-400 mt-2 italic bg-black/50 px-3 py-1 rounded-full"><Timer size={12} className="inline mr-1"/> 12시간 후 융합 가능</p>
              </div>
            )}
            <div className="firework-container absolute inset-0 -z-10 overflow-hidden">{[...Array(10)].map((_, i) => ( <div key={i} className="firework" style={{ top: `${Math.random()*100}%`, left: `${Math.random()*100}%`, background: '#f39c12' }}></div> ))}</div>
          </div>
        </div>
      )}

      {gameState === 'fail_result' && (
        <div className="fixed inset-0 z-[1200] bg-black/95 flex flex-col items-center justify-center p-6 animate-in fade-in duration-500 overflow-hidden">
          <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none">{renderCoalParticles()}</div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative w-72 h-72 mb-12"><Image src="/당황토끼.png" alt="Failed Rabbit" fill className="object-contain" unoptimized /></div>
            <h2 className="text-4xl font-black text-zinc-500 uppercase tracking-widest mb-4">Analysis Failed</h2>
            <p className="text-zinc-400 font-bold italic text-center px-10 break-keep">{lang === 'ko' ? "원소 결합에 실패했습니다." : "Element combination failed."}</p>
          </div>
        </div>
      )}

      {/* 챕터 2 융합 연출 */}
      {gameState === 'fusion_analyzing' && (
        <div className="fixed inset-0 z-[2600] bg-black flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-0 w-full h-full z-0 opacity-40 mix-blend-color-burn bg-red-900"></div>
          <div className="absolute inset-0 w-full h-full z-0"><Image src="/모래시계.png" alt="Hourglass" fill className="object-cover opacity-80 hue-rotate-180 brightness-150 contrast-150" priority unoptimized /></div>
          <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-10 px-10">
            <p className="text-4xl font-black text-red-500 uppercase tracking-widest animate-infinite-blink [text-shadow:0_0_20px_rgba(255,0,0,1)]">FUSING ELEMENTS...</p>
            <div className="w-full h-4 bg-black/50 rounded-full overflow-hidden border-2 border-red-900"><div className="h-full bg-red-500" style={{ width: `${loadingProgress}%` }}></div></div>
          </div>
        </div>
      )}

      {gameState === 'fusion_success' && fusionResultNode && (
        <div className="fixed inset-0 z-[2600] bg-black/95 flex flex-col items-center justify-center p-6 animate-in zoom-in duration-300">
           <div className="relative z-10 text-center flex flex-col items-center">
             <h2 className="text-6xl font-black text-red-500 mb-6 italic uppercase tracking-tighter drop-shadow-[0_0_30px_rgba(255,0,0,0.8)]">SUCCESS!</h2>
             <div className="relative w-48 h-48 mb-8 animate-bounce-in shadow-[0_0_100px_rgba(255,0,0,0.5)] rounded-full"><Image src={getElementIcon(fusionResultNode)} alt="Fused Element" fill className="object-contain" unoptimized /></div>
             <p className="text-3xl font-black text-white bg-red-900/50 px-8 py-4 rounded-full border border-red-500/50">{lang === 'ko' ? `${fusionResultNode}번 원석으로 진화했습니다!` : `Evolved into #${fusionResultNode}!`}</p>
             <div className="firework-container absolute inset-0 -z-10 overflow-hidden">{[...Array(15)].map((_, i) => ( <div key={i} className="firework" style={{ top: `${Math.random()*100}%`, left: `${Math.random()*100}%`, background: '#ef4444' }}></div> ))}</div>
           </div>
        </div>
      )}

      {gameState === 'fusion_fail' && fusionResultNode && (
        <div className="fixed inset-0 z-[2600] bg-black/95 flex flex-col items-center justify-center p-6 animate-in fade-in duration-500 overflow-hidden">
          <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none">{renderCoalParticles(true)}</div>
          <div className="relative z-10 flex flex-col items-center">
            <h2 className="text-5xl font-black text-zinc-600 mb-8 italic uppercase tracking-tighter line-through">FAILED</h2>
            <div className="relative w-32 h-32 mb-8 opacity-50 grayscale"><Image src={getElementIcon(fusionResultNode)} alt="Degraded Element" fill className="object-contain" unoptimized /></div>
            <p className="text-xl font-bold text-zinc-400 bg-zinc-900/80 px-8 py-4 rounded-2xl text-center break-keep border border-zinc-800">{lang === 'ko' ? `붕괴되어 ${fusionResultNode}번 원석만 남았습니다.` : `Collapsed. Only #${fusionResultNode} remained.`}</p>
          </div>
        </div>
      )}

      {/* 메인 대시보드 */}
      {gameState === 'idle' && (
        <>
          <div className="w-full max-w-md mt-14 mb-6 flex items-start gap-6 relative z-20">
            <div className="relative w-28 h-28 shrink-0 bg-gradient-to-tr from-black to-zinc-900 rounded-full border-4 border-amber-500 shadow-[0_0_30px_rgba(243,156,18,0.3)] flex items-center justify-center overflow-hidden animate-bounce-slow">
              <Image src="/marpo-stage-1.png" alt="Rabbit" fill className="object-cover scale-110" priority unoptimized />
            </div>
            <div className="relative flex-1 bg-zinc-900/70 border border-zinc-800 rounded-[2.5rem] p-7 shadow-2xl backdrop-blur-xl min-h-[120px] flex items-center">
              <div className="absolute top-10 -left-4 w-0 h-0 border-t-[12px] border-t-transparent border-r-[20px] border-r-zinc-800 border-b-[12px] border-b-transparent"></div>
              <p className="text-[16px] md:text-[18px] font-bold text-zinc-200 italic px-2">"{currentGuides[lineIdx]}"</p>
            </div>
          </div>

          {/* 🚩 재산 현황 (옴 + 융합제) */}
          <div className="w-full max-w-md grid grid-cols-3 gap-2 mb-8 relative z-20">
             <div className="col-span-3 bg-gradient-to-br from-[#1a1a1a] to-[#050505] p-6 rounded-[2.5rem] border border-[#f39c12]/20 flex flex-col items-center justify-center shadow-lg">
                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em] mb-1">Ω Energy Balance</p>
                <div className="flex items-center gap-2"><p className="text-4xl font-black text-white font-mono tracking-tighter">{ohmBalance.toLocaleString()}</p><span className="text-amber-500 text-2xl font-black italic">Ω</span></div>
             </div>
             <div className="col-span-1 bg-zinc-900/80 border border-zinc-800 p-4 rounded-3xl flex flex-col items-center justify-center gap-1">
                <Beaker size={20} className="text-cyan-400"/>
                <p className="text-[10px] text-zinc-500 uppercase font-black">Catalyst</p>
                <p className="text-xl font-black text-cyan-400">{catalysts}</p>
             </div>
             <div className="col-span-2 bg-zinc-900/80 border border-amber-500/30 p-4 rounded-3xl flex flex-col justify-center px-6 relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 opacity-10"><Gem size={64}/></div>
                <div className="flex items-center gap-3">
                   <Gem size={24} className="text-fuchsia-400 animate-pulse"/>
                   <div>
                     <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">{lang === 'ko' ? "무적 융합제" : "Master Catalyst"}</p>
                     <p className="text-xl font-black text-fuchsia-400">x {masterCatalysts}</p>
                   </div>
                </div>
             </div>
          </div>

          <div className="w-full max-w-md flex flex-col gap-3 mb-10 relative z-20">
            <button onClick={() => setShowVault(true)} className="w-full py-6 bg-gradient-to-r from-amber-600 to-amber-500 rounded-3xl flex items-center justify-center gap-4 shadow-[0_10px_20px_rgba(0,0,0,0.3)] active:scale-95 transition-all border-b-4 border-amber-800">
              <Wallet size={24} className="text-black" />
              <span className="text-black font-black text-xl italic uppercase tracking-tighter">{lang === 'ko' ? "내 금고 확인 (자산)" : "MY VAULT (ASSETS)"}</span>
              <ChevronRight size={20} className="text-black/50" />
            </button>
          </div>

          <div className="w-full max-w-md bg-zinc-900/30 border border-zinc-800 rounded-[3.5rem] p-8 mb-12 relative shadow-2xl z-20">
            <div className="grid grid-cols-6 gap-3">
              {[...Array(45)].map((_, i) => {
                const num = i + 1;
                const isSelected = selectedNumbers.includes(num);
                return (
                  <button key={num} onClick={() => handleNumberToggle(num)} className={`relative aspect-square rounded-xl overflow-hidden transition-all duration-300 transform ${isSelected ? 'border-2 border-amber-500 ring-2 ring-amber-500 z-10 bg-amber-500/20' : 'border border-zinc-800 bg-black'}`}>
                    <div className={`absolute inset-0 bg-cover bg-center transition-opacity ${isSelected ? 'opacity-30' : 'opacity-100'}`} style={{ backgroundImage: `url('${getElementIcon(num)}')` }} />
                    <div className={`absolute inset-0 flex items-center justify-center ${isSelected ? 'opacity-100' : 'opacity-0'}`}><span className="text-2xl font-black text-amber-500">{num}</span></div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="w-full max-w-md bg-zinc-900/50 p-6 rounded-[3.5rem] border border-zinc-800 flex justify-center items-center shadow-2xl z-20 mb-10">
             <button onClick={handleMining} disabled={selectedNumbers.length < 6} className="w-full py-5 rounded-3xl bg-amber-500 text-black font-black text-lg uppercase shadow-[0_0_20px_rgba(243,156,18,0.4)] active:scale-95 transition-all flex justify-center items-center gap-2">
               <Pickaxe size={24} /> {lang === 'ko' ? '채굴 시작 (MINING)' : 'START MINING'}
             </button>
          </div>
        </>
      )}

      {/* 💎 금고(Vault) & 🔥 융합소 모달 */}
      {showVault && gameState === 'idle' && (
        <div className={`fixed inset-0 z-[2500] ${isFusionMode ? 'bg-[#0a0000]' : 'bg-black'} animate-in slide-in-from-bottom duration-500 flex flex-col p-0 overflow-hidden transition-colors`}>
          
          <div className="shrink-0 flex justify-between items-center px-6 pt-6 pb-4 bg-black/95 border-b border-zinc-900 z-20">
            <div>
              <h2 className={`text-4xl font-black italic tracking-tighter uppercase transition-colors ${isFusionMode ? 'text-red-500' : 'text-amber-500'}`}>
                {isFusionMode ? 'Fusion Lab' : 'Marpo Vault'}
              </h2>
              {isFusionMode && (
                 <p className="text-red-400 text-xs font-bold bg-red-900/30 px-3 py-1 rounded-full mt-2 border border-red-500/30 inline-block">
                   Daily Limit: {dailyFusions} / 3
                 </p>
              )}
            </div>
            <button onClick={() => { setShowVault(false); setIsFusionMode(false); setSlotA(null); setSlotB(null); }} className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800"><X size={24} className="text-white" /></button>
          </div>

          {/* 🚩 인큐베이터 (12시간 숙성 대기열) */}
          {!isFusionMode && maturingItems.length > 0 && (
            <div className="mb-10 w-full bg-zinc-900/40 p-5 rounded-[2rem] border border-cyan-900/50">
              <h3 className="text-cyan-400 font-black italic uppercase tracking-widest text-sm mb-4 flex items-center gap-2"><Timer size={16}/> Incubator (Maturing)</h3>
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                 {maturingItems.map(item => {
                    const isReady = item.unlockAt <= now;
                    return (
                      <button key={item.id} onClick={() => isReady ? harvestElement(item.id, item.num) : devSkipMaturation(item.id)} className={`relative shrink-0 w-24 h-24 rounded-2xl border-2 transition-all snap-start ${isReady ? 'border-lime-500 animate-pulse' : 'border-zinc-700'}`}>
                        <Image src={getElementIcon(item.num)} alt="Maturing" fill className={`object-contain p-2 ${isReady ? '' : 'grayscale opacity-30'}`} unoptimized />
                        <div className={`absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-black/60 backdrop-blur-[2px] ${isReady ? 'opacity-0 hover:opacity-100' : ''}`}>
                          {isReady ? (
                            <div className="bg-lime-500 text-black text-xs font-black px-3 py-1 rounded-full flex items-center gap-1"><CheckCircle2 size={12}/> CLAIM</div>
                          ) : (
                            <span className="text-cyan-300 font-mono text-sm font-black drop-shadow-md">{formatTimeLeft(item.unlockAt)}</span>
                          )}
                        </div>
                      </button>
                    )
                 })}
              </div>
              <p className="text-[10px] text-zinc-500 text-center mt-2">※ 사령관 전용: 숙성 중인 원석 클릭 시 즉시 수확 가능</p>
            </div>
          )}

          {/* 🔥 융합소 UI */}
          {isFusionMode && (
            <div className="w-full min-h-fit bg-zinc-900/50 border border-red-900/50 rounded-[2rem] p-5 mb-8 flex flex-col items-center relative overflow-visible shrink-0">
               <div className="w-full flex justify-center items-center gap-4 mb-6 shrink-0">
                 <button onClick={() => handleRemoveFromSlot('A')} className={`w-24 h-24 rounded-2xl border-2 flex items-center justify-center transition-all z-10 ${slotA ? 'border-red-500 bg-black shadow-[0_0_15px_rgba(255,0,0,0.3)]' : 'border-zinc-700 border-dashed bg-zinc-900/50'}`}>
                    {slotA ? <Image src={getElementIcon(slotA)} alt="A" width={60} height={60} unoptimized /> : <span className="text-zinc-600 font-black">A</span>}
                 </button>
                 <div className="flex items-center text-red-500 font-black text-2xl z-10">+</div>
                 <button onClick={() => handleRemoveFromSlot('B')} className={`w-24 h-24 rounded-2xl border-2 flex items-center justify-center transition-all z-10 ${slotB ? 'border-red-500 bg-black shadow-[0_0_15px_rgba(255,0,0,0.3)]' : 'border-zinc-700 border-dashed bg-zinc-900/50'}`}>
                    {slotB ? <Image src={getElementIcon(slotB)} alt="B" width={60} height={60} unoptimized /> : <span className="text-zinc-600 font-black">B</span>}
                 </button>
               </div>

               {/* 무적 융합제 토글 */}
               <div className="w-full flex justify-between items-center bg-black/60 p-4 rounded-2xl mb-4 border border-zinc-800 z-10">
                 <div className="flex items-center gap-3">
                   <Gem size={20} className={masterCatalysts > 0 ? "text-fuchsia-400" : "text-zinc-600"}/>
                   <div>
                     <p className="text-xs font-black uppercase text-zinc-400">Master Catalyst</p>
                     <p className="text-[10px] text-zinc-500">100% Success Rate</p>
                   </div>
                 </div>
                 <button onClick={() => setUseMasterCatalyst(!useMasterCatalyst)} disabled={masterCatalysts < 1} className={`w-14 h-8 rounded-full flex items-center transition-colors px-1 ${useMasterCatalyst ? 'bg-fuchsia-600 justify-end' : 'bg-zinc-700 justify-start'}`}>
                   <div className="w-6 h-6 bg-white rounded-full"></div>
                 </button>
               </div>

               {/* Stats Panel */}
               <div className="w-full bg-black/50 rounded-2xl p-4 grid grid-cols-3 gap-3 items-center mb-6 z-10">
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Success Rate</p>
                    <p className={`text-2xl font-black ${(slotA && slotB) ? (useMasterCatalyst ? 'text-fuchsia-400' : 'text-lime-400') : 'text-zinc-700'}`}>
                      {(slotA && slotB) ? (useMasterCatalyst ? '100%' : `${calcFusionChance(slotA, slotB)}%`) : '--%'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Burn Rate</p>
                    <p className={`text-2xl font-black ${(slotA && slotB) ? 'text-orange-400' : 'text-zinc-700'}`}>
                      {(slotA && slotB) ? formatFusionFeeRate(slotA, slotB) : '--%'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Burn Cost (Ω)</p>
                    <p className={`text-2xl font-black italic ${(slotA && slotB) ? 'text-red-500' : 'text-zinc-700'}`}>
                      {(slotA && slotB) ? `-${calcFusionCost(slotA, slotB).toLocaleString()}` : '--'}
                    </p>
                  </div>
               </div>

               <button onClick={executeFusion} disabled={!slotA || !slotB || dailyFusions >= 3} className={`w-full py-4 rounded-2xl font-black text-xl tracking-widest uppercase transition-all flex justify-center items-center gap-2 z-10 ${slotA && slotB && dailyFusions < 3 ? (useMasterCatalyst ? 'bg-fuchsia-600 shadow-[0_0_20px_rgba(192,38,211,0.5)] text-white' : 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.5)]') : 'bg-zinc-800 text-zinc-600'}`}>
                 {useMasterCatalyst ? <><Gem size={20}/> MASTER FUSE</> : <><Beaker size={20}/> FUSE (-1 🧪)</>}
               </button>
            </div>
          )}

          {/* 💎 인벤토리 그리드 (사용 가능 원석만 표시) */}
          <div className="mb-4 flex justify-between items-end">
            <h3 className="text-amber-500 font-black italic uppercase tracking-widest text-sm">Ready Elements</h3>
          </div>
          <div className="grid grid-cols-4 gap-4 mb-20">
            {[...Array(45)].map((_, i) => {
              const num = i + 1;
              let count = inventory[num] || 0;
              if (isFusionMode && slotA === num) count--;
              if (isFusionMode && slotB === num) count--;

              const isAvailable = count > 0;

              return (
                <button 
                  key={num} 
                  disabled={!isFusionMode || !isAvailable}
                  onClick={() => handleSelectForFusion(num)}
                  className={`relative aspect-square rounded-2xl border transition-all 
                    ${isAvailable ? (isFusionMode ? 'border-red-500 bg-black cursor-pointer hover:scale-105 shadow-lg' : 'border-amber-500 bg-zinc-900') : 'border-zinc-800 opacity-20'}`
                  }>
                   <div className="absolute inset-0 bg-cover bg-center rounded-2xl" style={{ backgroundImage: `url('${getElementIcon(num)}')` }} />
                   {isAvailable && (
                     <div className={`absolute -top-2 -right-2 ${isFusionMode ? 'bg-red-500' : 'bg-amber-500'} text-black text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg`}>
                       x{count}
                     </div>
                   )}
                   <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-black text-white/50">{num}</div>
                </button>
              );
            })}
          </div>

          <div className="mt-auto flex gap-4">
             {isFusionMode ? (
               <button onClick={() => { setIsFusionMode(false); setSlotA(null); setSlotB(null); setUseMasterCatalyst(false); }} className="w-full py-5 bg-zinc-800 text-white rounded-2xl font-black text-lg uppercase active:scale-95 transition-transform">
                 {lang === 'ko' ? "금고로 돌아가기" : "Back to Vault"}
               </button>
             ) : (
               <>
                 <button onClick={() => setShowVault(false)} className="flex-1 py-5 bg-zinc-800 text-white rounded-2xl font-black text-sm uppercase active:scale-95 transition-transform">
                   {lang === 'ko' ? "채굴장 복귀" : "Mine"}
                 </button>
                 <button onClick={() => setIsFusionMode(true)} className="flex-[2] py-5 bg-red-600 text-white rounded-2xl font-black text-lg uppercase flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.4)] active:scale-95 transition-transform">
                   <Zap size={20} /> {lang === 'ko' ? "융합소 입장" : "Enter Fusion Lab"}
                 </button>
               </>
             )}
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes coalExplode { 0% { transform: scale(0.2) translate(0, 0); opacity: 1; } 100% { transform: scale(1.5) translate(var(--dir-x), var(--dir-y)) rotate(var(--rot)); opacity: 0; } }
        .coal-particle { position: absolute; top: 50%; left: 50%; clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%); animation: coalExplode 2s cubic-bezier(0.1, 1, 0.3, 1) var(--delay) forwards; }
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
