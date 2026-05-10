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
    setIsAdShowing(true);
    setTimeout(() => {
      setIsAdShowing(false);
      onStartSession();
    }, 2000); 
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 flex flex-col items-center justify-center font-sans text-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: `radial-gradient(#f39c12 1px, transparent 1px)`, backgroundSize: '30px 30px' }}></div>

      <div className="relative z-10 mb-8 p-4 rounded-full border-2 border-[#f39c12]/20 shadow-[0_0_50px_rgba(243,156,18,0.1)]">
        <Image src="/marpo-group-logo.png" alt="LOGO" width={120} height={120} priority />
      </div>
      
      <h1 className="text-4xl font-black text-[#f39c12] italic uppercase tracking-tighter mb-2 drop-shadow-[0_0_15px_rgba(243,156,18,0.3)]">
        {content.title}
      </h1>
      <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em] mb-10">
        {content.sub}
      </p>

      <div className="mb-10 flex items-center gap-3 bg-zinc-900/50 border border-zinc-800 rounded-2xl px-6 py-3">
        <Globe size={16} className="text-[#f39c12]" />
        <select 
          value={currentLang} 
          onChange={(e) => setLang(e.target.value)} 
          className="bg-transparent text-xs font-black text-zinc-300 focus:outline-none cursor-pointer uppercase tracking-widest"
        >
          <option value="en" className="bg-[#050505]">English</option>
          <option value="ko" className="bg-[#050505]">한국어</option>
        </select>
      </div>

      <div className="bg-zinc-900/30 border border-[#f39c12]/10 p-8 rounded-[2.5rem] max-w-md w-full mb-10 backdrop-blur-sm">
        <p className="text-xs leading-relaxed text-zinc-400 italic font-medium">"{content.desc}"</p>
      </div>

      <div className="w-full max-w-md space-y-4 mb-12 text-left">
        <div className="flex items-center gap-4 bg-[#f39c12]/5 p-5 rounded-2xl border border-[#f39c12]/10 text-[11px] font-bold text-zinc-400 uppercase tracking-tight">
          <Zap size={20} className="text-[#f39c12]" /> {content.benefit1}
        </div>
        <div className="flex items-center gap-4 bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/10 text-[11px] font-bold text-zinc-400 uppercase tracking-tight">
          <ShieldCheck size={20} className="text-emerald-500" /> {content.benefit2}
        </div>
      </div>

      <div className="w-full max-w-md relative z-20">
        <label className="flex items-center gap-4 mb-10 cursor-pointer justify-center px-4 group">
          <input 
            type="checkbox" 
            checked={agreed} 
            onChange={(e) => setAgreed(e.target.checked)} 
            className="w-6 h-6 rounded-lg border-zinc-800 bg-black text-[#f39c12] focus:ring-[#f39c12]"
          />
          <span className="text-[11px] text-zinc-600 font-bold leading-snug uppercase tracking-tighter group-hover:text-zinc-400 transition-colors">
            {content.agreeCheck}
          </span>
        </label>

        <button 
          onClick={handleEntry} 
          disabled={!agreed || isAdShowing} 
          className={`w-full py-6 rounded-[2rem] font-black text-xl flex justify-center items-center gap-3 transition-all transform active:scale-95 ${
            agreed && !isAdShowing 
              ? 'bg-[#f39c12] text-black shadow-[0_15px_30px_rgba(243,156,18,0.2)]' 
              : 'bg-zinc-900 text-zinc-700 cursor-not-allowed'
          }`}
        >
          {isAdShowing ? (
            <>
              <Loader2 className="animate-spin" size={24} />
              <span className="text-sm tracking-widest uppercase">{content.adWait}</span>
            </>
          ) : (
            <>
              <span className="tracking-tighter italic uppercase">{content.btn}</span>
              <ArrowRight size={24} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}