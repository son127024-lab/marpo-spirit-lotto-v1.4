"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminWinnersPage() {
  // 🚩 [핵심] 서버사이드 렌더링(SSR) 충돌 방어막
  const [isMounted, setIsMounted] = useState(false);

  // --- [1] 당첨 번호 발표 폼 상태 변수 ---
  const [drawRound, setDrawRound] = useState("");
  const [drawDate, setDrawDate] = useState("");
  const [winMain, setWinMain] = useState("");
  const [winSpirit, setWinSpirit] = useState("");
  const [prize1, setPrize1] = useState("");
  const [prize2, setPrize2] = useState("");
  const [prize3, setPrize3] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  // --- [2] 수령 신청 대기자 명단 상태 변수 ---
  const [claims, setClaims] = useState<any[]>([]);
  const [isLoadingClaims, setIsLoadingClaims] = useState(true);

  // 🚩 화면이 유저의 브라우저에 완전히 켜진 후에만 작동하도록 설정
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 수령 신청 목록 불러오기 (방어막 통과 시에만 실행)
  useEffect(() => {
    if (!isMounted) return; // 서버에서는 통신을 절대 시도하지 않음

    const fetchClaims = async () => {
      try {
        const res = await fetch('/api/admin/claims');
        if (res.ok) {
          const data = await res.json();
          if (data.success) setClaims(data.claims);
        }
      } catch (error) {
        console.error("Failed to fetch claims");
      } finally {
        setIsLoadingClaims(false);
      }
    };
    fetchClaims();
  }, [isMounted]);

  const publishWinnerReport = async () => {
    if (!drawRound || !winMain) {
      alert("회차와 메인 번호는 필수입니다.");
      return;
    }
    setIsPublishing(true);
    try {
      const res = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draw: drawRound,
          date: drawDate || new Date().toLocaleDateString(),
          numbers: winMain,
          spirit: winSpirit,
          first: prize1 || "0",
          second: prize2 || "0",
          third: prize3 || "0"
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("✅ 유저 앱에 당첨 내역이 공식 발표되었습니다!");
        setDrawRound(""); setDrawDate(""); setWinMain(""); setWinSpirit(""); setPrize1(""); setPrize2(""); setPrize3("");
      }
    } catch (error) {
      alert("전송 중 오류 발생");
    } finally {
      setIsPublishing(false);
    }
  };

  // 🚩 서버가 미리 그릴 때 보여줄 로딩 화면 (에러 원천 차단)
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-yellow-500 font-black tracking-widest animate-pulse">LOADING COMMAND CENTER...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans pb-32">
      
      {/* 🚀 헤더 영역 */}
      <header className="w-full max-w-2xl mx-auto flex justify-between items-end border-b border-zinc-800 pb-4 mb-8">
        <div>
          <p className="text-yellow-500 text-[10px] font-black tracking-[0.3em] mb-1">MARPO GROUP HEADQUARTERS</p>
          <h1 className="text-3xl font-black italic tracking-tighter text-white">WINNER COMMAND</h1>
        </div>
        <Link href="/admin" className="text-zinc-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">
          ◀ BACK TO ORACLE
        </Link>
      </header>

      <div className="w-full max-w-2xl mx-auto flex flex-col gap-10">
        
        {/* 🏆 섹션 1: 공식 당첨 결과 발표 콘솔 */}
        <section className="bg-[#0a0a0a] border-2 border-red-900/40 p-8 rounded-[2rem] shadow-2xl">
          <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.3em] mb-6">📢 Publish Official Result</p>
          
          <div className="flex gap-3 mb-4">
            <input type="text" placeholder="회차 (예: #8)" value={drawRound} onChange={e => setDrawRound(e.target.value)} className="w-1/3 bg-black border border-zinc-800 focus:border-red-500 outline-none text-white p-4 rounded-xl font-bold text-sm text-center transition-colors" />
            <input type="text" placeholder="날짜 (예: 5/11/2026)" value={drawDate} onChange={e => setDrawDate(e.target.value)} className="w-2/3 bg-black border border-zinc-800 focus:border-red-500 outline-none text-white p-4 rounded-xl font-bold text-sm text-center transition-colors" />
          </div>

          <div className="mb-4">
            <p className="text-[10px] text-zinc-500 mb-1 ml-1 font-bold">MAIN NUMBERS (쉼표 구분)</p>
            <input type="text" placeholder="1, 15, 23, 34, 42, 45, 11, 8" value={winMain} onChange={e => setWinMain(e.target.value)} className="w-full bg-black border border-zinc-800 focus:border-yellow-500 outline-none text-yellow-500 p-4 rounded-xl font-black text-sm text-center tracking-widest" />
          </div>

          <div className="mb-6">
            <p className="text-[10px] text-zinc-500 mb-1 ml-1 font-bold">SPIRIT NUMBERS (쉼표 구분)</p>
            <input type="text" placeholder="7, 33" value={winSpirit} onChange={e => setWinSpirit(e.target.value)} className="w-full bg-black border border-zinc-800 focus:border-red-500 outline-none text-red-500 p-4 rounded-xl font-black text-sm text-center tracking-widest" />
          </div>

          <div className="grid grid-cols-3 gap-3 mb-8">
            <div>
              <p className="text-[9px] text-zinc-500 text-center mb-1 font-bold uppercase">1st Prize</p>
              <input type="text" placeholder="0 π" value={prize1} onChange={e => setPrize1(e.target.value)} className="w-full bg-black border border-zinc-800 text-white p-3 rounded-xl font-bold text-sm text-center" />
            </div>
            <div>
              <p className="text-[9px] text-zinc-500 text-center mb-1 font-bold uppercase">2nd Prize</p>
              <input type="text" placeholder="0 π" value={prize2} onChange={e => setPrize2(e.target.value)} className="w-full bg-black border border-zinc-800 text-white p-3 rounded-xl font-bold text-sm text-center" />
            </div>
            <div>
              <p className="text-[9px] text-zinc-500 text-center mb-1 font-bold uppercase">3rd Prize</p>
              <input type="text" placeholder="0 π" value={prize3} onChange={e => setPrize3(e.target.value)} className="w-full bg-black border border-zinc-800 text-white p-3 rounded-xl font-bold text-sm text-center" />
            </div>
          </div>

          <button onClick={publishWinnerReport} disabled={isPublishing} className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-5 rounded-2xl uppercase tracking-widest active:scale-95 transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)]">
            {isPublishing ? 'TRANSMITTING...' : 'SYNC TO MAIN ECOSYSTEM'}
          </button>
        </section>

        {/* 🎁 섹션 2: 당첨자 수령 요청 확인 콘솔 */}
        <section className="bg-[#0a0a0a] border border-zinc-800 p-8 rounded-[2rem] shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em]">📥 Claim Requests</p>
            <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-[10px] font-black">{claims.length} PENDING</span>
          </div>

          {isLoadingClaims ? (
            <p className="text-zinc-500 text-xs font-bold text-center py-10">Loading DB...</p>
          ) : claims.length === 0 ? (
            <div className="border border-dashed border-zinc-800 rounded-2xl py-12 text-center bg-black/50">
              <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">No pending claims at the moment.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {claims.map((claim, idx) => (
                <div key={idx} className="bg-black border border-zinc-800 p-5 rounded-2xl flex flex-col gap-3">
                  <div className="flex justify-between items-start border-b border-zinc-900 pb-3">
                    <div>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">USER ID</p>
                      <p className="text-sm font-black text-white">{claim.userId || 'Unknown'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">CLAIM AMOUNT</p>
                      <p className="text-lg font-black text-yellow-500">{claim.claimAmount || claim.amount || 0} π</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                     <p className="text-[9px] text-zinc-600 font-black">REQUESTED AT: {new Date(claim.claimedAt).toLocaleString()}</p>
                     <button className="bg-zinc-800 hover:bg-blue-600 text-zinc-300 hover:text-white text-[10px] font-black px-4 py-2 rounded-lg transition-colors">MARK AS PAID</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}