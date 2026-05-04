"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [targetUsd, setTargetUsd] = useState(5.0);
  const [peggedUsd, setPeggedUsd] = useState(38.42);
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
      // API 응답 구조를 명확히 체크하여 settings 에러 방지
      if (json.success && json.settings) {
        setTargetUsd(Number(json.settings.targetUsd));
        setPeggedUsd(Number(json.settings.peggedUsd));
      }
    } catch (e) { console.error(e); }
  };

  const updateSettings = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUsd, peggedUsd })
      });
      const json = await res.json();
      if (json.success) alert("MARPO ORACLE: 시세 동기화 완료! 🏎️💨");
    } catch (e) { alert("Network Error"); }
    finally { setIsUpdating(false); }
  };

  // 실시간 계산 결과
  const autoCalculatedPi = (targetUsd / peggedUsd).toFixed(4);

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-end mb-12 border-b border-zinc-800 pb-8">
          <div>
            <p className="text-yellow-500 font-black tracking-widest text-xs mb-2 uppercase">Marpo Group Headquarters</p>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase">Oracle Command</h1>
          </div>
          <Link href="/" className="text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-widest">Exit Terminal</Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-zinc-900/80 p-8 rounded-[2rem] border border-red-900/30">
            <p className="text-red-500 text-[10px] uppercase font-black mb-1 tracking-widest">Target Ticket Value</p>
            <h3 className="text-xl font-black text-white uppercase mb-6 italic">Price Standard ($)</h3>
            <input 
              type="number" 
              value={targetUsd} 
              onChange={(e) => setTargetUsd(Number(e.target.value))} 
              className="bg-black border border-zinc-800 text-white text-3xl font-black rounded-2xl p-5 w-full text-center focus:border-red-500 outline-none" 
            />
          </div>

          <div className="bg-zinc-900/80 p-8 rounded-[2rem] border border-green-900/30">
            <p className="text-green-500 text-[10px] uppercase font-black mb-1 tracking-widest">Live Pi Market Value</p>
            <h3 className="text-xl font-black text-white uppercase mb-6 italic">Oracle Data ($)</h3>
            <input 
              type="number" 
              value={peggedUsd} 
              onChange={(e) => setPeggedUsd(Number(e.target.value))} 
              className="bg-black border border-zinc-800 text-white text-3xl font-black rounded-2xl p-5 w-full text-center focus:border-green-500 outline-none" 
            />
          </div>
        </div>

        <div className="bg-gradient-to-r from-zinc-900 to-black p-10 rounded-[2.5rem] border-2 border-yellow-500/20 mb-12 text-center shadow-2xl">
          <p className="text-zinc-500 text-[10px] font-black uppercase mb-2 tracking-[0.3em]">Calculated Entry Fee</p>
          <p className="text-7xl font-black text-white mb-8 tracking-tighter">{autoCalculatedPi} <span className="text-2xl text-zinc-600">Pi</span></p>
          <button 
            onClick={updateSettings} 
            disabled={isUpdating}
            className="w-full bg-yellow-500 text-black font-black py-6 rounded-2xl text-xl hover:bg-yellow-400 active:scale-95 transition-all uppercase tracking-[0.2em] shadow-lg shadow-yellow-500/10"
          >
            {isUpdating ? 'Synchronizing...' : 'Sync Oracle to Ecosystem'}
          </button>
        </div>

        {data && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 opacity-50">
            <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 text-center">
              <p className="text-zinc-600 text-[10px] uppercase mb-1">Total Sales</p>
              <p className="text-2xl font-black">{data.totals?.totalSales || 0} Pi</p>
            </div>
            <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 text-center">
              <p className="text-zinc-600 text-[10px] uppercase mb-1">Profit (8%)</p>
              <p className="text-2xl font-black text-yellow-500">{data.totals?.houseEdge?.toFixed(2) || 0} Pi</p>
            </div>
            <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 text-center">
              <p className="text-zinc-600 text-[10px] uppercase mb-1">Child Fund (5%)</p>
              <p className="text-2xl font-black">{data.totals?.childFund?.toFixed(2) || 0} Pi</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}