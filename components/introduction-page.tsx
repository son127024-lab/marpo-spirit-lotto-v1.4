"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { Globe, ArrowRight, Zap, ShieldCheck, Loader2, BarChart3, Coins, FileText, X } from 'lucide-react';

interface IntroProps {
  onStartSession: () => void;
  currentLang: string;
  setLang: (lang: string) => void;
}

const translations: Record<string, any> = {
  en: {
    title: "MARPO SPIRIT DRAW",
    sub: "5.3B MARPO TOKEN ECONOMY",
    desc: "A strategic Ad-Reduction Utility (L.O.T.T.O: Loyalty Optimized Token Tactical Operations) designed to maximize MAR-Ω liquidity and user session efficiency.",
    benefit1: "Phase 1: Accumulate MAR-Ω Credits",
    benefit2: "Phase 2: Protocol Swap to MARPO Token",
    btn: "AGREE & VIEW SUBSCRIPTION",
    adWait: "Synchronizing MAR-Ω Data...",
    agreePrefix: "I agree to the ",
    agreeLink: "Terms & MAR-Ω Policy",
    termsTitle: "TERMS OF SERVICE & MAR-Ω POLICY",
    closeBtn: "CLOSE DOCUMENT"
  },
  ko: {
    title: "마르포 스피릿 드로우",
    sub: "53억 MARPO 토큰 경제 생태계",
    desc: "마르포 그룹의 L.O.T.T.O 시스템은 MAR-Ω(옴) 유동성을 최적화하고 MARPO 토큰 생태계의 가치를 방어하는 전략적 유틸리티입니다.",
    benefit1: "1단계: MAR-Ω(옴) 크레딧 축적",
    benefit2: "2단계: MARPO 토큰 공식 스왑 지원",
    btn: "동의 및 구독 플랜 확인",
    adWait: "MAR-Ω 데이터 동기화 중...",
    agreePrefix: "마르포 그룹의 ",
    agreeLink: "이용 약관 및 MAR-Ω 정책",
    agreeSuffix: "에 동의합니다",
    termsTitle: "이용 약관 및 MAR-Ω 운영 정책",
    closeBtn: "문서 닫기"
  }
};

export default function IntroductionPage({ onStartSession, currentLang, setLang }: IntroProps) {
  const [agreed, setAgreed] = useState(false);
  const [isAdShowing, setIsAdShowing] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
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
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: `radial-gradient(#f39c12 1px, transparent 1px)`, backgroundSize: '30px 30px' }}></div>

      {showTerms && (
        <div className="fixed inset-0 z-[1000] bg-[#050505]/95 backdrop-blur-md flex items-center justify-center p-6">
          <div className="w-full max-w-lg bg-[#0a0a0a] border border-[#f39c12]/30 rounded-3xl flex flex-col max-h-[80vh] overflow-hidden text-left">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
              <h3 className="text-[#f39c12] font-black text-base uppercase">{content.termsTitle}</h3>
              <button onClick={() => setShowTerms(false)}><X size={28} /></button>
            </div>
            <div className="p-8 overflow-y-auto space-y-6 flex-1 text-sm text-zinc-400">
               <p>MAR-Ω Protocol Details...</p>
            </div>
            <div className="p-6 border-t border-zinc-800"><button onClick={() => setShowTerms(false)} className="w-full py-5 bg-zinc-800 text-white rounded-xl font-black text-sm uppercase">{content.closeBtn}</button></div>
          </div>
        </div>
      )}

      <div className="relative z-10 mb-8 p-5 rounded-full border-2 border-[#f39c12]/20 shadow-[0_0_60px_rgba(243,156,18,0.15)]">
        <Image src="/marpo-group-logo.png" alt="LOGO" width={130} height={130} priority />
      </div>
      
      <h1 className="text-5xl font-black text-[#f39c12] italic uppercase tracking-tighter mb-2 drop-shadow-[0_0_20px_rgba(243,156,18,0.4)]">
        {content.title}
      </h1>
      
      <div className="flex items-center gap-3 mb-10 bg-[#f39c12]/10 px-5 py-2 rounded-full border border-[#f39c12]/30">
        <Coins size={18} className="text-[#f39c12]" />
        <p className="text-xs text-[#f39c12] font-black uppercase tracking-[0.2em]">{content.sub}</p>
      </div>

      <div className="mb-10 flex items-center gap-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl px-6 py-3">
        <Globe size={18} className="text-zinc-500" />
        <select value={currentLang} onChange={(e) => setLang(e.target.value)} className="bg-transparent text-sm font-black text-zinc-300 focus:outline-none cursor-pointer uppercase">
          <option value="en" className="bg-black">English</option>
          <option value="ko" className="bg-black">한국어</option>
        </select>
      </div>

      <div className="bg-zinc-900/30 border border-[#f39c12]/10 p-10 rounded-[3rem] max-w-md w-full mb-10 backdrop-blur-sm">
        <p className="text-sm leading-relaxed text-zinc-400 italic font-medium">"{content.desc}"</p>
      </div>

      <div className="w-full max-w-md space-y-4 mb-12 text-left">
        <div className="flex items-center gap-5 bg-[#f39c12]/5 p-6 rounded-2xl border border-[#f39c12]/10 text-sm font-bold text-zinc-400 uppercase tracking-tight">
          <BarChart3 size={24} className="text-[#f39c12]" /> {content.benefit1}
        </div>
        <div className="flex items-center gap-5 bg-emerald-500/5 p-6 rounded-2xl border border-emerald-500/10 text-sm font-bold text-zinc-400 uppercase tracking-tight">
          <ShieldCheck size={24} className="text-emerald-500" /> {content.benefit2}
        </div>
      </div>

      <div className="w-full max-w-md relative z-20">
        <div className="flex items-center justify-center gap-4 mb-10 px-4">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="w-6 h-6 rounded border-zinc-800 bg-black text-[#f39c12] cursor-pointer" />
          <div className="text-xs font-black uppercase tracking-tight text-zinc-500">
            {content.agreePrefix}<button onClick={() => setShowTerms(true)} className="text-[#f39c12] underline italic mx-1">{content.agreeLink}</button>{content.agreeSuffix}
          </div>
        </div>

        <button onClick={handleEntry} disabled={!agreed || isAdShowing} className={`w-full py-7 rounded-[2.5rem] font-black text-2xl flex justify-center items-center gap-4 transition-all transform active:scale-95 ${agreed && !isAdShowing ? 'bg-[#f39c12] text-black shadow-2xl' : 'bg-zinc-900 text-zinc-700'}`}>
          {isAdShowing ? <><Loader2 className="animate-spin" size={28} /> <span className="text-sm font-black uppercase">{content.adWait}</span></> : <><span className="italic uppercase">{content.btn}</span> <ArrowRight size={28} /></>}
        </button>
      </div>
    </div>
  );
}