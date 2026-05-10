"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { Globe, ArrowRight, Zap, ShieldCheck, Loader2 } from 'lucide-react';

interface IntroProps {
  onStartSession: () => void;
  currentLang: string;
  setLang: (lang: string) => void;
}

const translations: Record<string, any> = {
  en: {
    title: "MARPO SPIRIT DRAW",
    sub: "L.O.T.T.O: Loyalty Optimized Token Tactical Operations",
    desc: "This platform is an Ad-Reduction Utility engineered by Marpo Group to optimize the Pi Network ecosystem through decentralized reward architectures.",
    benefit1: "Max Efficiency: 90% Ad-Reduction for VIP members.",
    benefit2: "Compliance: Proportional Sequential Unlocking (PCT Std.)",
    btn: "AGREE & START SESSION",
    adWait: "Initializing Ecosystem Ad...",
    agreeCheck: "I agree to the Terms of Service"
  },
  ko: {
    title: "마르포 스피릿 드로우",
    sub: "L.O.T.T.O: 로열티 최적화 토큰 전략 운영 시스템",
    desc: "본 플랫폼은 파이 생태계 내 유저의 광고 피로도를 줄이고, 기여도에 따라 에코 크레딧을 제공하는 마르포 그룹의 광고 효율화 유틸리티입니다.",
    benefit1: "최대 효율: VIP 회원을 위한 90% 광고 제거 기능.",
    benefit2: "규정 준수: PCT 표준 비례적 순차 해제 방식 적용",
    btn: "동의 및 세션 시작",
    adWait: "생태계 광고 호출 중...",
    agreeCheck: "서비스 이용 약관에 동의합니다"
  }
};

export default function IntroductionPage({ onStartSession, currentLang, setLang }: IntroProps) {
  const [agreed, setAgreed] = useState(false);
  const [isAdShowing, setIsAdShowing] = useState(false);
  const content = translations[currentLang] || translations.en;

  const handleEntry = async () => {
    if (!agreed) return;
    
    // 🚩 광고 로딩 상태 활성화
    setIsAdShowing(true);
    
    // 🚩 2초 대기 (광고 로딩 시뮬레이션)
    setTimeout(() => {
      setIsAdShowing(false);
      onStartSession();
    }, 2000); 
  };

  return (
    <div className="min-h-screen bg-[#0d1b3e] text-white p-6 flex flex-col items-center justify-center font-sans text-center">
      <div className="mb-6">
        <Image src="/marpo-group-logo.png" alt="MARPO GROUP" width={130} height={130} priority />
      </div>
      
      <h1 className="text-3xl font-black text-[#f39c12] italic uppercase tracking-tighter">
        {content.title}
      </h1>
      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-2">
        {content.sub}
      </p>

      {/* 언어 선택 */}
      <div className="mt-8 mb-8 flex items-center gap-2 bg-black/40 border border-zinc-800 rounded-xl px-4 py-2">
        <Globe size={14} className="text-zinc-500" />
        <select 
          value={currentLang} 
          onChange={(e) => setLang(e.target.value)} 
          className="bg-transparent text-xs font-bold text-zinc-300 focus:outline-none cursor-pointer uppercase"
        >
          <option value="en" className="bg-[#0d1b3e]">English</option>
          <option value="ko" className="bg-[#0d1b3e]">한국어</option>
        </select>
      </div>

      <div className="bg-[#1a2a4e] border border-[#f39c12]/20 p-8 rounded-[2.5rem] max-w-md w-full mb-8 shadow-2xl">
        <p className="text-xs leading-relaxed text-zinc-300 italic">"{content.desc}"</p>
      </div>

      {/* 베네핏 리스트 */}
      <div className="w-full max-w-md space-y-3 mb-10 text-left">
        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 text-[11px] text-zinc-400">
          <Zap size={18} className="text-[#f39c12]" /> {content.benefit1}
        </div>
        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 text-[11px] text-zinc-400">
          <ShieldCheck size={18} className="text-emerald-500" /> {content.benefit2}
        </div>
      </div>

      <div className="w-full max-w-md">
        {/* 약관 동의 체크 */}
        <label className="flex items-center gap-4 mb-8 cursor-pointer justify-center px-4">
          <input 
            type="checkbox" 
            checked={agreed} 
            onChange={(e) => setAgreed(e.target.checked)} 
            className="w-6 h-6 rounded-lg border-zinc-700 bg-black text-[#f39c12]"
          />
          <span className="text-[11px] text-zinc-500 font-bold leading-snug">
            {content.agreeCheck}
          </span>
        </label>

        {/* 🚩 진입 버튼: 클릭 시 2초간 로딩 상태 표시 */}
        <button 
          onClick={handleEntry} 
          disabled={!agreed || isAdShowing} 
          className={`w-full py-5 rounded-[1.5rem] font-black text-xl flex justify-center items-center gap-3 transition-all ${
            agreed && !isAdShowing 
              ? 'bg-[#f39c12] text-black shadow-lg shadow-[#f39c12]/20' 
              : 'bg-zinc-800 text-zinc-600 cursor-not-allowed opacity-50'
          }`}
        >
          {isAdShowing ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              {content.adWait}
            </>
          ) : (
            <>
              {content.btn} <ArrowRight size={22} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}