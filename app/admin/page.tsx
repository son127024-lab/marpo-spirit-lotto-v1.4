"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  
  // 🚩 [에러 방지] 초기값을 숫자로 명확히 설정
  const [targetUsd, setTargetUsd] = useState<number>(5.0);
  const [peggedUsd, setPeggedUsd] = useState<number>(314159);
  const [realJackpot, setRealJackpot] = useState<number>(0);
  
  // 🚩 [추가] 회차 및 당첨일 관리 상태
  const [currentRound, setCurrentRound] = useState<string>("1");
  const [nextDrawDate, setNextDrawDate] = useState<string>("");
  
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchSettings();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const json = await res.json();
      if (json.success) setData(json);
    } catch (e) { console.error(e); }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const json = await res.json();
      if (json.success && json.settings) {
        // 🚩 [에러 방지] 서버 데이터가 없을 경우를 대비한 안전장치 (|| 0)
        setTargetUsd(Number(json.settings.peggedUsd) || 0); 
        setPeggedUsd(Number(json.settings.peggedUsd) || 0);
        setRealJackpot(Number(json.settings.realJackpot) || 0);
        setCurrentRound(json.settings.currentRound || "1");
        setNextDrawDate(json.settings.nextDrawDate || new Date().toISOString().slice(0, 16));
      }
    } catch (e) { console.error(e); }
  };

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketPricePi: "1.0", // 필요시 상태로 분리
          peggedUsd,
          realJackpot,
          currentRound, // ◀ 여기서 1로 리셋 가능!
          nextDrawDate
        })
      });
      if (res.ok) alert("오라클 설정이 마르포 에코시스템에 동기화되었습니다.");
    } catch (e) { alert("업데이트 실패"); }
    finally { setIsUpdating(false); }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <header className="flex justify-between items-center mb-12 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-yellow-500">MARPO ORACLE</h1>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em]">Central Management System</p>
        </div>
        <div className="flex gap-4">
          <Link href="/admin/winners" className="bg-zinc-900 hover:bg-white hover:text-black text-white px-6 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest border border-zinc-800">
            Winner Control ◀
          </Link>
          <Link href="/" className="bg-yellow-500 text-black px-6 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest">
            View Live App
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* 🏆 설정 섹션 */}
        <section className="bg-[#0a0a0a] border-2 border-zinc-800 p-8 rounded-[2.5rem] shadow-2xl">
          <h2 className="text-red-500 text-[10px] font-black uppercase tracking-[0.3em] mb-8">System Configuration</h2>
          
          <div className="space-y-6">
            <div>
              <p className="text-zinc-500 text-[10px] font-black mb-2 uppercase tracking-widest">Current Round (회차 리셋/수정)</p>
              <input 
                type="text" 
                value={currentRound} 
                onChange={(e) => setCurrentRound(e.target.value)}
                className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-white font-black text-xl focus:border-yellow-500 outline-none transition-all"
              />
            </div>

            <div>
              <p className="text-zinc-500 text-[10px] font-black mb-2 uppercase tracking-widest">Next Draw Date (추첨 시간)</p>
              <input 
                type="datetime-local" 
                value={nextDrawDate.slice(0, 16)} 
                onChange={(e) => setNextDrawDate(e.target.value)}
                className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-white font-bold focus:border-yellow-500 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-zinc-500 text-[10px] font-black mb-2 uppercase tracking-widest">Pegged USD ($)</p>
                <input 
                  type="number" 
                  value={isNaN(peggedUsd) ? "" : peggedUsd} // 🚩 [에러 방지] NaN일 경우 빈칸으로 표시
                  onChange={(e) => setPeggedUsd(Number(e.target.value))}
                  className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-white font-black text-xl focus:border-yellow-500 outline-none transition-all"
                />
              </div>
              <div>
                <p className="text-zinc-500 text-[10px] font-black mb-2 uppercase tracking-widest">Manual Jackpot (π)</p>
                <input 
                  type="number" 
                  value={isNaN(realJackpot) ? "" : realJackpot} // 🚩 [에러 방지] NaN 방어막
                  onChange={(e) => setRealJackpot(Number(e.target.value))}
                  className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-white font-black text-xl focus:border-yellow-500 outline-none transition-all"
                />
              </div>
            </div>

            <button 
              onClick={handleSave}
              disabled={isUpdating}
              className="w-full bg-white text-black font-black py-5 rounded-2xl mt-4 hover:bg-yellow-500 transition-all active:scale-95 uppercase tracking-widest"
            >
              {isUpdating ? "Syncing..." : "Apply Oracle Settings"}
            </button>
          </div>
        </section>

        {/* 📊 통계 섹션 */}
        <section className="bg-[#0a0a0a] border border-zinc-900 p-8 rounded-[2.5rem]">
          <h2 className="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em] mb-8">Live Statistics</h2>
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-black p-6 rounded-3xl border border-zinc-900">
              <p className="text-zinc-600 text-[9px] font-black uppercase mb-1">Total Users</p>
              <p className="text-3xl font-black text-white">{data?.totalUsers || 0}</p>
            </div>
            <div className="bg-black p-6 rounded-3xl border border-zinc-900">
              <p className="text-zinc-600 text-[9px] font-black uppercase mb-1">Sold Tickets (Active)</p>
              <p className="text-3xl font-black text-yellow-500">{data?.activeTickets || 0}</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}