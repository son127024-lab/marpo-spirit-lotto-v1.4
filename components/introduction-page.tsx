"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { Globe, ArrowRight, Zap, ShieldCheck, Loader2, BarChart3, Coins, FileText, X } from 'lucide-react';

// 🚩 메인 페이지에서 보내는 명령들을 받을 수 있도록 설계를 수정했습니다.
interface IntroProps {
  onStartSession: () => void;
  currentLang: string;
  setLang: (lang: string) => void;
}

const translations: Record<string, any> = {
  en: {
    title: "MARPO SPIRIT DRAW",
    sub: "5.3B MARPO TOKEN ECONOMY",
    desc: "Strategic Ad-Reduction Utility (L.O.T.T.O) designed to maximize MAR-Ω liquidity and MARPO ecosystem efficiency.",
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

// 🚩 약관 내용 (필요시 수정)
const termsContent: Record<string, { title: string; text: string }[]> = {
  en: [{ title: "Terms", text: "Policy details here..." }],
  ko: [{ title: "약관", text: "상세 정책 내용..." }]
};

export default function IntroductionPage({ onStartSession, currentLang, setLang }: IntroProps) {
  const [agreed, setAgreed] = useState(false);
  const [isAdShowing, setIsAdShowing] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  
  const content = translations[currentLang] || translations.en;
  const terms = termsContent[currentLang] || termsContent.en;

  const handleEntry = async () => {
    if (!agreed) return;
    setIsAdShowing(true);
    setTimeout(() => {
      setIsAdShowing(false);
      onStartSession(); // 🚩 메인 페이지에 시작을 알림
    }, 2000); 
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 flex flex-col items-center justify-center font-sans text-center relative overflow-hidden">
      {/* 배경 장식 */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: `radial-gradient(#f39c12 1px, transparent 1px)`, backgroundSize: '30px 30px' }}></div>

      {/* 약관 모달 */}
      {showTerms && (
        <div className="fixed inset-0 z-[1000] bg-[#050505]/95 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in zoom-in duration-200">
          <div className="w-full max-w-lg bg-[#0a0a0a] border border-[#f39c12]/30 rounded-3xl flex flex-col max-h-[80vh] overflow-hidden text-left relative">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="text-[#f39c12] font-black text-sm uppercase tracking-widest">{content.termsTitle}</h3>
              <button onClick={() => setShowTerms(false)} className="text-zinc-500 hover:text-white"><X size={24} /></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {terms.map((t, i) => (
                <div key={i}><h4 className="text-white font-bold text-xs mb-2 border-l-2 border-[#f39c12] pl-2">{t.title}</h4><p className="text-[11px] text-zinc-400">{t.text}</p></div>
              ))}
            </div>
            <div className="p-6 border-t border-zinc-800"><button onClick={() => setShowTerms(false)} className="w-full py-4 bg-zinc-800 text-zinc-300 rounded-xl font-black text-xs uppercase">{content.closeBtn}</button></div>
          </div>
        </div>
      )}

      {/* 로고 */}
      <div className="relative z-10 mb-6 p-4 rounded-full border-2 border-[#f39c12]/20 shadow-[0_0_50px_rgba(243,156,18,0.1)]">
        <Image src="/marpo-group-logo.png" alt="LOGO" width={110} height={110} priority />
      </div>
      
      <h1 className="text-4xl font-black text-[#f39c12] italic uppercase tracking-tighter mb-1 drop-shadow-[0_0_15px_rgba(243,156,18,0.3)]">{content.title}</h1>
      <div className="flex items-center gap-2 mb-8 bg-[#f39c12]/10 px-4 py-1 rounded-full border border-[#f39c12]/30"><Coins size={14} className="text-[#f39c12]" /><p className="text-[10px] text-[#f39c12] font-black uppercase tracking-[0.2em]">{content.sub}</p></div>

      {/* 언어 선택 */}
      <div className="mb-8 flex items-center gap-3 bg-zinc-900/50 border border-zinc-800 rounded-2xl px-5 py-2.5">
        <Globe size={14} className="text-zinc-500" />
        <select value={currentLang} onChange={(e) => setLang(e.target.value)} className="bg-transparent text-xs font-black text-zinc-300 focus:outline-none cursor-pointer uppercase">
          <option value="en">English</option>
          <option value="ko">한국어</option>
        </select>
      </div>

      <div className="bg-zinc-900/30 border border-[#f39c12]/10 p-8 rounded-[2.5rem] max-w-md w-full mb-8 backdrop-blur-sm"><p className="text-xs leading-relaxed text-zinc-400 italic">"{content.desc}"</p></div>

      <div className="w-full max-w-md space-y-3 mb-10 text-left">
        <div className="flex items-center gap-4 bg-[#f39c12]/5 p-5 rounded-2xl border border-[#f39c12]/10 text-[11px] font-bold text-zinc-400 uppercase tracking-tight"><BarChart3 size={20} className="text-[#f39c12]" /> {content.benefit1}</div>
        <div className="flex items-center gap-4 bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/10 text-[11px] font-bold text-zinc-400 uppercase tracking-tight"><ShieldCheck size={20} className="text-emerald-500" /> {content.benefit2}</div>
      </div>

      <div className="w-full max-w-md relative z-20">
        <div className="flex items-center justify-center gap-3 mb-8 px-4">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="w-5 h-5 rounded border-zinc-800 bg-black text-[#f39c12] focus:ring-[#f39c12]" />
          <div className="text-[10px] font-black uppercase tracking-tight text-zinc-500">
            {content.agreePrefix}<button onClick={() => setShowTerms(true)} className="text-[#f39c12] underline italic mx-1">{content.agreeLink}</button>{content.agreeSuffix}
          </div>
        </div>

        <button onClick={handleEntry} disabled={!agreed || isAdShowing} className={`w-full py-6 rounded-[2rem] font-black text-xl flex justify-center items-center gap-3 transition-all ${agreed && !isAdShowing ? 'bg-[#f39c12] text-black shadow-lg shadow-[#f39c12]/20' : 'bg-zinc-900 text-zinc-700'}`}>
          {isAdShowing ? <><Loader2 className="animate-spin" size={24} /> <span className="text-xs uppercase">{content.adWait}</span></> : <><span className="italic uppercase">{content.btn}</span> <ArrowRight size={24} /></>}
        </button>
      </div>
    </div>
  );
}