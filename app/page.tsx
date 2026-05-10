"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// 🌐 [백서 V4.2 동기화] 사행성 단어 배제 및 유틸리티 중심 번역 데이터
const translations: Record<string, any> = {
  en: {
    title: "MARPO SPIRIT DRAW",
    sub: "L.O.T.T.O: Loyalty Optimized Token Tactical Operations",
    projectTitle: "■ UTILITY DESCRIPTION",
    projectDesc: "This platform is an Ad-Reduction Utility engineered by Marpo Group to optimize the Pi Network ecosystem through decentralized reward architectures.",
    howTitle: "■ PARTICIPATION GUIDE",
    howDesc: (
      <>
        <p>1. Select <span className="text-[#f39c12] font-bold">8 Matching Numbers</span> and <span className="text-red-500 font-bold">2 Spirit Numbers</span>.</p>
        <p>2. High-tier members (VIP) enjoy a <span className="text-white font-bold">90% Ad-Free</span> premium environment.</p>
        <p>3. Eco-Credit matching is compiled every <span className="text-emerald-500 font-bold">Friday at 20:00</span>.</p>
      </>
    ),
    revTitle: "■ ECO-SYSTEM GOVERNANCE",
    revList: [
      "80% Eco-Reward Pool: Distributed for successful sequence matching",
      "8% Infrastructure Scaling: For ad-reduction engine & server maintenance",
      "7% Deflationary Token Sink: Automated MARPO burn & liquidity support",
      "5% Global Child Fund: Regular corporate donations for social impact"
    ],
    btnConfirm: "ENTER UTILITY SESSION",
    btnWatching: "Optimizing Ad-Environment..."
  },
  ko: {
    title: "마르포 스피릿 드로우",
    sub: "L.O.T.T.O: 로열티 최적화 토큰 전략 운영 시스템",
    projectTitle: "■ 유틸리티 개요",
    projectDesc: "본 플랫폼은 파이 생태계 내 유저의 광고 피로도를 줄이고, 기여도에 따라 에코 크레딧을 제공하는 마르포 그룹의 광고 효율화 유틸리티입니다.",
    howTitle: "■ 서비스 이용 안내",
    howDesc: (
      <>
        <p>1. 8개의 <span className="text-[#f39c12] font-bold">매칭 번호</span>와 2개의 <span className="text-red-500 font-bold">스피릿 번호</span>를 선택합니다.</p>
        <p>2. VIP 회원은 <span className="text-white font-bold">90% 광고 제거</span> 혜택을 통해 쾌적한 참여 환경을 누립니다.</p>
        <p>3. 에코 크레딧 정산은 매주 <span className="text-emerald-500 font-bold">금요일 20:00 (캐나다)</span>에 진행됩니다.</p>
      </>
    ),
    revTitle: "■ 에코 시스템 자산 운영 규정",
    revList: [
      "80% 에코 기여 보상 풀: 시스템 매칭 성공 유저에게 크레딧으로 환원",
      "8% 시스템 고도화 자금: 광고 최적화 엔진 및 인프라 운영비",
      "7% 디플레이션 소각: MARPO 토큰 가치 방어를 위한 자동 소각",
      "5% 글로벌 아동 복지 기금: 취약계층 아동을 위한 마르포 그룹 정기 기부"
    ],
    btnConfirm: "유틸리티 세션 진입",
    btnWatching: "광고 환경 최적화 중..."
  }
};

export default function MarpoSpiritPage() {
  // --- [상태 관리: 자산 및 시스템] ---
  const [user, setUser] = useState<any>(null);
  const [currentLang, setCurrentLang] = useState<string>('ko');
  const [isNoticeOpen, setIsNoticeOpen] = useState<boolean>(true);
  const [isAdLoading, setIsAdLoading] = useState<boolean>(false);
  const [marpoBalance, setMarpoBalance] = useState<number>(5000.0); // 테스트용 잔액
  const [consecutiveVisits, setConsecutiveVisits] = useState<number>(3);
  
  // --- [상태 관리: 매칭 시스템] ---
  const [mainNumbers, setMainNumbers] = useState<number[]>([]);
  const [spiritNumbers, setSpiritNumbers] = useState<number[]>([]);
  const [revealedNumber, setRevealedNumber] = useState<number | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [ticketPrice, setTicketPrice] = useState<number>(1.0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 🚩 [신규 기능] 1,000 MARPO 소각 후 번호 미리보기 (Insider Reveal)
  const handleRevealOneNumber = async () => {
    if (marpoBalance < 1000) {
      alert("Insider Reveal requires 1,000 MARPO.");
      return;
    }
    if (!confirm("Burn 1,000 MARPO to reveal 1 matching number?")) return;

    setIsRevealing(true);
    // 시뮬레이션: 2초 후 번호 공개 및 소각
    setTimeout(() => {
      setRevealedNumber(Math.floor(Math.random() * 45) + 1);
      setMarpoBalance(prev => prev - 1000);
      setIsRevealing(false);
    }, 1500);
  };

  const handleCloseNotice = () => {
    setIsAdLoading(true);
    setTimeout(() => {
      setIsAdLoading(false);
      setIsNoticeOpen(false);
    }, 2000);
  };

  const content = translations[currentLang] || translations.en;

  return (
    <div className="min-h-screen bg-[#0d1b3e] text-white flex flex-col items-center p-4 font-sans pb-40">
      
      {/* 헤더: 브랜드 아이덴티티 강조 */}
      <header className="w-full max-w-md flex flex-col items-center pt-8 mb-10">
        <Image src="/marpo-group-logo.png" alt="MARPO" width={140} height={140} priority />
        <h1 className="text-[#f39c12] font-black text-[42px] uppercase tracking-tighter italic mt-4 leading-none">Spirit Draw</h1>
        <div className="group relative mt-2">
          <p className="text-zinc-500 font-bold text-[13px] lowercase tracking-widest cursor-help underline decoration-zinc-700">lottoworld.pi</p>
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-max bg-black/80 text-[10px] px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity border border-zinc-700">
            {content.sub}
          </div>
        </div>
      </header>

      {/* 에코 크레딧 풀 (구 잭팟) */}
      <section className="w-full max-w-md bg-[#1a2a4e] border border-[#f39c12]/20 p-8 rounded-[2.5rem] mb-6 shadow-2xl">
        <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Eco-Contribution Matching Pool</p>
        <p className="text-5xl font-black text-white tracking-tighter mb-4">
          3,141.5926 <span className="text-xl text-[#f39c12]">π</span>
        </p>
        <div className="flex justify-between items-center text-[11px] text-zinc-500 font-bold border-t border-white/5 pt-4">
          <span>Next Audit: Friday 20:00</span>
          <span className="text-[#f39c12]">Compliance Verified</span>
        </div>
      </section>

      {/* 🚩 [수정] Insider Reveal 버튼 배치 */}
      <div className="w-full max-w-md mb-8 px-1">
        <button 
          onClick={handleRevealOneNumber}
          disabled={isRevealing || marpoBalance < 1000}
          className="w-full py-5 bg-black/40 border border-[#f39c12]/40 rounded-2xl flex items-center justify-center gap-4 active:scale-95 transition-all disabled:opacity-30"
        >
          <div className="w-10 h-10 bg-[#f39c12] rounded-full flex items-center justify-center text-black font-bold">🔍</div>
          <div className="text-left">
            <p className="text-[10px] text-[#f39c12] font-black uppercase tracking-widest">Insider Reveal</p>
            <p className="text-xs text-zinc-400">Burn 1,000 MARPO to reveal 1 number</p>
          </div>
        </button>
        {revealedNumber && (
          <div className="mt-4 flex flex-col items-center animate-bounce">
            <p className="text-[10px] text-zinc-500 font-bold uppercase mb-2">Revealed Matching Sequence</p>
            <span className="w-12 h-12 rounded-full bg-[#f39c12] text-black font-black text-xl flex items-center justify-center shadow-[0_0_20px_rgba(243,156,18,0.4)]">
              {revealedNumber}
            </span>
          </div>
        )}
      </div>

      {/* 5주 연속 출석 게이지 (PCT 스타일 락업 철학) */}
      <section className="w-full max-w-md bg-white/5 border border-white/10 p-6 rounded-[2rem] mb-10">
        <div className="flex justify-between items-center mb-4">
          <p className="text-[11px] font-black text-emerald-500 uppercase tracking-widest">■ Loyalty Drive Progress</p>
          <span className="text-xs font-bold text-zinc-400">{consecutiveVisits}/5 Weeks</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`h-2 rounded-full ${i < consecutiveVisits ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-zinc-800'}`} />
          ))}
        </div>
      </section>

      {/* 숫자 선택 매트릭스 (디자인 생략, 기존과 동일 로직 유지) */}
      {/* ... 기존 숫자 선택 UI 코드 삽입 ... */}

      <button 
        onClick={() => setIsModalOpen(true)}
        className="w-full max-w-md py-6 bg-[#f39c12] text-black font-black text-2xl rounded-2xl uppercase tracking-widest shadow-xl active:scale-95 transition-all mt-10"
      >
        START SESSION <span className="text-lg ml-2">{ticketPrice} π</span>
      </button>

      {/* 면책 공지 모달 (유틸리티 선언) */}
      {isNoticeOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex justify-center items-center p-6">
          <div className="bg-[#1a2a4e] border-2 border-[#f39c12]/30 p-10 rounded-[3rem] w-full max-w-md">
            <h2 className="text-2xl font-black text-[#f39c12] mb-1 uppercase italic tracking-tighter">{content.title}</h2>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-6">{content.sub}</p>
            
            <div className="bg-black/50 border border-white/5 rounded-2xl p-5 text-left mb-6 max-h-60 overflow-y-auto space-y-4">
              <section>
                <p className="text-[10px] text-[#f39c12] font-black mb-1">{content.projectTitle}</p>
                <p className="text-xs text-zinc-400">{content.projectDesc}</p>
              </section>
              <section>
                <p className="text-[10px] text-emerald-500 font-black mb-1">{content.howTitle}</p>
                <div className="text-xs text-zinc-400">{content.howDesc}</div>
              </section>
            </div>

            <select 
              value={currentLang} 
              onChange={(e) => setCurrentLang(e.target.value)}
              className="w-full bg-black border border-white/10 text-white rounded-xl p-4 mb-6 text-sm font-bold"
            >
              <option value="en">English</option>
              <option value="ko">한국어</option>
            </select>

            <button 
              onClick={handleCloseNotice}
              className="w-full bg-[#f39c12] text-black font-black py-5 rounded-2xl text-xl uppercase tracking-widest"
            >
              {isAdLoading ? content.btnWatching : content.btnConfirm}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}