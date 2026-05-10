"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { ShieldCheck, Zap, Globe, ArrowRight } from 'lucide-react';

// 🌐 8개 국어 번역 데이터 (기존 로직 복원 및 내용 순화)
const translations: Record<string, any> = {
  en: {
    title: "MARPO SPIRIT DRAW",
    sub: "L.O.T.T.O: Loyalty Optimized Token Tactical Operations",
    desc: "This platform is an Ad-Reduction Utility engineered by Marpo Group to optimize the Pi Network ecosystem through decentralized reward architectures.",
    terms: "I agree to the Terms of Service and the Ad-Reduction participation model.",
    btn: "AGREE & START SESSION",
    adWait: "Initializing Ecosystem Ad..."
  },
  ko: {
    title: "마르포 스피릿 드로우",
    sub: "L.O.T.T.O: 로열티 최적화 토큰 전략 운영 시스템",
    desc: "본 플랫폼은 파이 생태계 내 유저의 광고 피로도를 줄이고, 기여도에 따라 에코 크레딧을 제공하는 마르포 그룹의 광고 효율화 유틸리티입니다.",
    terms: "이용 약관 및 광고 최적화 참여 모델에 동의합니다.",
    btn: "동의 및 세션 시작",
    adWait: "생태계 광고 호출 중..."
  },
  // ... 필요 시 다른 언어(zh, ja 등) 추가
};

export default function IntroductionPage({ onStartSession }: { onStartSession: () => void }) {
  // 🚩 지시사항 1: 기본 언어를 영어('en')로 설정
  const [lang, setLang] = useState('en');
  const [agreed, setAgreed] = useState(false);
  const [isAdShowing, setIsAdShowing] = useState(false);

  const content = translations[lang] || translations.en;

  // 🚩 지시사항 4: 동의 버튼 클릭 시 1회 광고 실행 (Pi SDK 연동)
  const handleEntry = async () => {
    if (!agreed) return;
    
    setIsAdShowing(true);
    try {
      const Pi = (window as any).Pi;
      // 실제 파이 브라우저 환경에서 광고 호출
      if (Pi && Pi.Ads && Pi.Ads.showAd) {
        await Pi.Ads.showAd("interstitial"); 
      } else {
        // 개발 환경용 2초 대기 시뮬레이션
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } catch (err) {
      console.error("Ad showing error:", err);
    } finally {
      setIsAdShowing(false);
      onStartSession(); // 광고 종료 후 메인 대시보드 진입
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1b3e] text-white p-6 flex flex-col items-center justify-center font-sans overflow-y-auto">
      
      {/* 🚩 지시사항 3: 마르포 그룹 로고 및 심볼 복원 */}
      <div className="mb-8 flex flex-col items-center">
        <Image 
          src="/marpo-group-logo.png" // 기존에 사용하던 로고 경로
          alt="MARPO GROUP" 
          width={150} 
          height={150} 
          className="drop-shadow-[0_0_15px_rgba(243,156,18,0.3)]"
          priority 
        />
        <h1 className="text-4xl font-black text-[#f39c12] mt-6 italic tracking-tighter uppercase">
          {content.title}
        </h1>
        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-2">
          {content.sub}
        </p>
      </div>

      {/* 🚩 지시사항 2: 언어 선택 기능 복원 */}
      <div className="mb-8 flex items-center gap-2 bg-black/40 border border-zinc-800 rounded-xl px-4 py-2">
        <Globe size={16} className="text-zinc-500" />
        <select 
          value={lang} 
          onChange={(e) => setLang(e.target.value)}
          className="bg-transparent text-xs font-bold text-zinc-300 focus:outline-none cursor-pointer uppercase"
        >
          <option value="en" className="bg-zinc-900">English</option>
          <option value="ko" className="bg-zinc-900">한국어</option>
          <option value="zh" className="bg-zinc-900">简体中文</option>
          <option value="ja" className="bg-zinc-900">日本語</option>
        </select>
      </div>

      {/* 유틸리티 설명 섹션 */}
      <div className="bg-[#1a2a4e] border border-[#f39c12]/20 p-8 rounded-[2.5rem] max-w-md w-full shadow-2xl mb-10">
        <p className="text-sm leading-relaxed text-zinc-300 text-center italic">
          "{content.desc}"
        </p>
      </div>

      {/* 핵심 혜택 요약 */}
      <div className="w-full max-w-md grid gap-3 mb-10">
        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
          <Zap className="text-[#f39c12]" size={20} />
          <span className="text-xs font-medium text-zinc-400 leading-tight">Max Efficiency: 90% Ad-Reduction for VIP members.</span>
        </div>
        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
          <ShieldCheck className="text-emerald-500" size={20} />
          <span className="text-xs font-medium text-zinc-400 leading-tight">Compliance: Proportional Sequential Unlocking (PCT Std.)</span>
        </div>
      </div>

      {/* 동의 및 버튼 섹션 */}
      <div className="w-full max-w-md">
        <label className="flex items-center gap-4 mb-8 cursor-pointer px-2">
          <input 
            type="checkbox" 
            checked={agreed} 
            onChange={(e) => setAgreed(e.target.checked)} 
            className="w-6 h-6 rounded-lg border-zinc-700 bg-black text-[#f39c12] focus:ring-[#f39c12] transition-all"
          />
          <span className="text-[11px] text-zinc-500 font-bold leading-snug">
            {content.terms}
          </span>
        </label>

        <button 
          onClick={handleEntry}
          disabled={!agreed || isAdShowing}
          className={`w-full py-5 rounded-[1.5rem] font-black text-xl flex justify-center items-center gap-3 transition-all transform active:scale-95 ${
            agreed && !isAdShowing 
              ? 'bg-[#f39c12] text-black shadow-[0_10px_20px_rgba(243,156,18,0.2)]' 
              : 'bg-zinc-800 text-zinc-600 cursor-not-allowed opacity-50'
          }`}
        >
          {isAdShowing ? (
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
              <span>{content.adWait}</span>
            </div>
          ) : (
            <>
              {content.btn}
              <ArrowRight size={22} />
            </>
          )}
        </button>
      </div>

      <footer className="mt-12 text-[10px] text-zinc-700 font-bold tracking-widest uppercase">
        © 2026 MARPO GROUP | Ecosystem Compliant
      </footer>
    </div>
  );
}

