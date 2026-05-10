"use client";
import React, { useState } from 'react';
import { ShieldCheck, Zap, Info, ArrowRight } from 'lucide-react';

export default function IntroductionPage({ onStartSession }: { onStartSession: () => void }) {
  const [agreed, setAgreed] = useState(false);
  const [lang, setLang] = useState('ko');

  const text = lang === 'ko' ? {
    title: "마르포 스피릿 드로우",
    sub: "L.O.T.T.O: 로열티 최적화 토큰 전략 운영",
    desc: "본 앱은 파이 생태계의 광고 피로도를 줄이는 'Ad-Reduction Utility'입니다. 사행성 게임이 아닌, 유틸리티 참여를 통한 에코 시스템 기여를 목적으로 합니다.",
    btn: "동의 및 세션 시작"
  } : {
    title: "MARPO SPIRIT DRAW",
    sub: "L.O.T.T.O: Loyalty Optimized Token Tactical Operations",
    desc: "This app is an Ad-Reduction Utility. We focus on utility-based engagement and ecosystem contribution, not games of chance.",
    btn: "AGREE & ENTER SESSION"
  };

  return (
    <div className="min-h-screen bg-[#0d1b3e] text-white p-6 flex flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-black text-[#f39c12] mb-2 italic">{text.title}</h1>
      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-10">{text.sub}</p>
      
      <div className="bg-[#1a2a4e] border border-[#f39c12]/30 p-6 rounded-[2rem] max-w-md mb-8">
        <p className="text-sm leading-relaxed text-zinc-300">{text.desc}</p>
      </div>

      <div className="w-full max-w-md space-y-3 mb-10 text-left">
        <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
          <Zap className="text-[#f39c12]" size={20} />
          <span className="text-xs text-zinc-400">90% 광고 제거 환경 제공 (VIP)</span>
        </div>
        <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
          <ShieldCheck className="text-emerald-500" size={20} />
          <span className="text-xs text-zinc-400">PCT 표준 비례적 토큰 해제 준수</span>
        </div>
      </div>

      <div className="w-full max-w-md">
        <label className="flex items-center gap-3 mb-6 cursor-pointer justify-center">
          <input type="checkbox" checked={agreed} onChange={(e)=>setAgreed(e.target.checked)} className="w-5 h-5 rounded border-zinc-700 text-[#f39c12]" />
          <span className="text-xs text-zinc-500">이용 약관 및 유틸리티 목적에 동의합니다.</span>
        </label>
        <button 
          onClick={() => agreed && onStartSession()}
          disabled={!agreed}
          className={`w-full py-5 rounded-2xl font-black text-xl transition-all ${agreed ? 'bg-[#f39c12] text-black' : 'bg-zinc-800 text-zinc-600'}`}
        >
          {text.btn}
        </button>
      </div>
    </div>
  );
}