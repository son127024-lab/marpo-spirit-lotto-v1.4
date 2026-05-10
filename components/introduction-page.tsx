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
    desc: "A strategic Ad-Reduction Utility (L.O.T.T.O: Loyalty Optimized Token Tactical Operations) designed to maximize MARPO ecosystem liquidity and user session efficiency.",
    benefit1: "Total Supply: 5.3 Billion MARPO Tokens",
    benefit2: "Eco-Incentive: Rewards for Strategic Participation",
    btn: "AGREE & VIEW SUBSCRIPTION",
    adWait: "Synchronizing Tokenomics...",
    agreePrefix: "I agree to the ",
    agreeLink: "Terms of Service & Tokenomics",
    termsTitle: "TERMS OF SERVICE & TOKENOMICS POLICY",
    closeBtn: "CLOSE DOCUMENT"
  },
  ko: {
    title: "마르포 스피릿 드로우",
    sub: "53억 MARPO 토큰 경제 생태계",
    desc: "마르포 그룹이 설계한 L.O.T.T.O (Loyalty Optimized Token Tactical Operations) 시스템은 내부 세션 효율을 극대화하고 MARPO 토큰 생태계의 유동성을 강화하는 전략적 유틸리티입니다.",
    benefit1: "총 발행량: 53억 MARPO 토큰 에코시스템",
    benefit2: "참여 보상: 전략적 세션 참여에 따른 에코 인센티브",
    btn: "동의 및 구독 플랜 확인",
    adWait: "토크노믹스 데이터 동기화 중...",
    agreePrefix: "마르포 그룹의 ",
    agreeLink: "이용 약관 및 토크노믹스 정책",
    agreeSuffix: "에 동의합니다",
    termsTitle: "이용 약관 및 토크노믹스 운영 정책",
    closeBtn: "문서 닫기"
  }
};

const termsContent: Record<string, { title: string; text: string }[]> = {
  en: [
    { title: "Article 1 (Purpose)", text: "These Terms of Service govern the use of the Marpo Spirit Draw utility and the L.O.T.T.O (Loyalty Optimized Token Tactical Operations) framework provided by Marpo Group." },
    { title: "Article 2 (Tokenomics & Ecosystem)", text: "The total supply of MARPO tokens is permanently fixed at 5.3 Billion (5,300,000,000). Tokens are distributed as Eco-Credits based on strategic session participation and ecosystem contribution." },
    { title: "Article 3 (Ad-Reduction Utility)", text: "Users may select a subscription tier (Basic, Premium, VIP) to optimize their ad exposure. VIP members receive up to a 90% reduction in ad friction." },
    { title: "Article 4 (Blockchain Payments)", text: "All premium tier upgrades are processed via the Pi Network blockchain. Due to the immutable nature of blockchain transactions, payments are final and non-refundable." },
    { title: "Article 5 (Compliance & Limitation of Liability)", text: "Marpo Group adheres to Pi Core Team (PCT) standards. The platform is provided 'as is' without warranties. Marpo Group is not liable for network latency or blockchain synchronization errors." }
  ],
  ko: [
    { title: "제1조 (목적)", text: "본 약관은 마르포 그룹(Marpo Group)이 제공하는 마르포 스피릿 드로우 유틸리티 및 L.O.T.T.O 프레임워크의 이용 조건과 절차를 규정합니다." },
    { title: "제2조 (토크노믹스 및 생태계)", text: "MARPO 토큰의 총 발행량은 53억(5,300,000,000) 개로 고정됩니다. 토큰은 유저의 전략적 세션 참여 및 생태계 기여도에 따라 에코 크레딧 형태로 보상됩니다." },
    { title: "제3조 (광고 최적화 유틸리티)", text: "유저는 구독 티어(Basic, Premium, VIP)를 선택하여 앱 내 광고 노출을 관리할 수 있습니다. VIP 회원의 경우 최대 90%의 광고 제거 혜택이 적용됩니다." },
    { title: "제4조 (블록체인 결제 및 환불)", text: "구독 업그레이드는 Pi Network 블록체인을 통해 처리됩니다. 블록체인 트랜잭션의 특성상 결제 완료 후 취소 및 환불은 원칙적으로 불가합니다." },
    { title: "제5조 (규정 준수 및 면책 조항)", text: "본 플랫폼은 Pi Core Team(PCT) 표준을 준수합니다. 네트워크 지연이나 파이 블록체인 자체의 오류로 인한 손실에 대해 마르포 그룹은 법적 책임을 지지 않습니다." }
  ]
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
      onStartSession();
    }, 2000); 
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 flex flex-col items-center justify-center font-sans text-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: `radial-gradient(#f39c12 1px, transparent 1px)`, backgroundSize: '30px 30px' }}></div>

      {/* 🚩 이용 약관 모달 (showTerms가 true일 때 렌더링) */}
      {showTerms && (
        <div className="fixed inset-0 z-[1000] bg-[#050505]/95 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in zoom-in duration-200">
          <div className="w-full max-w-lg bg-[#0a0a0a] border border-[#f39c12]/30 rounded-3xl flex flex-col max-h-[80vh] shadow-[0_0_50px_rgba(243,156,18,0.15)] overflow-hidden text-left relative">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-[#f39c12]" />
                <h3 className="text-[#f39c12] font-black text-sm uppercase tracking-widest">{content.termsTitle}</h3>
              </div>
              <button onClick={() => setShowTerms(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
              {terms.map((term, index) => (
                <div key={index}>
                  <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-2 border-l-2 border-[#f39c12] pl-2">{term.title}</h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">{term.text}</p>
                </div>
              ))}
            </div>
            
            <div className="p-6 border-t border-zinc-800 bg-zinc-900/30">
              <button onClick={() => setShowTerms(false)} className="w-full py-4 bg-zinc-800 text-zinc-300 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#f39c12] hover:text-black transition-all active:scale-95">
                {content.closeBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 기존 인트로 콘텐츠 */}
      <div className="relative z-10 mb-6 p-4 rounded-full border-2 border-[#f39c12]/20 shadow-[0_0_50px_rgba(243,156,18,0.1)]">
        <Image src="/marpo-group-logo.png" alt="LOGO" width={110} height={110} priority />
      </div>
      
      <h1 className="text-4xl font-black text-[#f39c12] italic uppercase tracking-tighter mb-1 drop-shadow-[0_0_15px_rgba(243,156,18,0.3)]">
        {content.title}
      </h1>
      
      <div className="flex items-center gap-2 mb-8 bg-[#f39c12]/10 px-4 py-1 rounded-full border border-[#f39c12]/30">
        <Coins size={14} className="text-[#f39c12]" />
        <p className="text-[10px] text-[#f39c12] font-black uppercase tracking-[0.2em]">{content.sub}</p>
      </div>

      <div className="mb-8 flex items-center gap-3 bg-zinc-900/50 border border-zinc-800 rounded-2xl px-5 py-2.5">
        <Globe size={14} className="text-zinc-500" />
        <select 
          value={currentLang} 
          onChange={(e) => setLang(e.target.value)} 
          className="bg-transparent text-xs font-black text-zinc-300 focus:outline-none cursor-pointer uppercase tracking-widest"
        >
          <option value="en" className="bg-[#050505]">English</option>
          <option value="ko" className="bg-[#050505]">한국어</option>
        </select>
      </div>

      <div className="bg-zinc-900/30 border border-[#f39c12]/10 p-8 rounded-[2.5rem] max-w-md w-full mb-8 backdrop-blur-sm shadow-2xl">
        <p className="text-xs leading-relaxed text-zinc-400 italic font-medium">"{content.desc}"</p>
      </div>

      <div className="w-full max-w-md space-y-3 mb-10 text-left">
        <div className="flex items-center gap-4 bg-[#f39c12]/5 p-5 rounded-2xl border border-[#f39c12]/10 text-[11px] font-bold text-zinc-400 uppercase tracking-tight">
          <BarChart3 size={20} className="text-[#f39c12]" /> {content.benefit1}
        </div>
        <div className="flex items-center gap-4 bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/10 text-[11px] font-bold text-zinc-400 uppercase tracking-tight">
          <ShieldCheck size={20} className="text-emerald-500" /> {content.benefit2}
        </div>
      </div>

      <div className="w-full max-w-md relative z-20">
        <div className="flex items-center justify-center gap-3 mb-8 px-4">
          <input 
            type="checkbox" 
            checked={agreed} 
            onChange={(e) => setAgreed(e.target.checked)} 
            className="w-5 h-5 rounded border-zinc-800 bg-black text-[#f39c12] focus:ring-[#f39c12] cursor-pointer"
          />
          <div className="text-[10px] font-black leading-snug uppercase tracking-tight text-zinc-500">
            {content.agreePrefix}
            <button 
              onClick={() => setShowTerms(true)} 
              className="text-[#f39c12] underline underline-offset-2 hover:text-white transition-colors mx-1"
            >
              {content.agreeLink}
            </button>
            {content.agreeSuffix}
          </div>
        </div>

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
              <span className="text-xs font-black tracking-[0.2em] uppercase">{content.adWait}</span>
            </>
          ) : (
            <>
              <span className="tracking-tighter italic uppercase">{content.btn}</span>
              <ArrowRight size={24} />
            </>
          )}
        </button>
      </div>

      <footer className="mt-12 text-[9px] text-zinc-800 font-black tracking-[0.3em] uppercase">
        Marpo Group Assets Protection Division
      </footer>
    </div>
  );
}