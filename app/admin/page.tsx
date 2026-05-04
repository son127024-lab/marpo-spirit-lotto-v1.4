// app/admin/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // 🟢 오라클 시세 상태
  const [ticketPrice, setTicketPrice] = useState(0.13);
  const [peggedUsd, setPeggedUsd] = useState(38.42);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // 🚨 테스트를 위해 보안문을 임시 개방합니다.
    setIsAdmin(true);
    fetchStats();
    fetchSettings();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const json = await res.json();
      if (json.success) setData(json);
    } catch (e) { console.error("Stats fetch error"); }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const json = await res.json();
      if (json.success && json.settings) {
        setTicketPrice(json.settings.ticketPricePi);
        setPeggedUsd(json.settings.peggedUsd);
      }
    } catch (e) { console.error("Settings fetch error"); }
  };

  const updateSettings = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketPricePi: ticketPrice, peggedUsd: peggedUsd })
      });
      const json = await res.json();
      if (json.success) alert("MARPO ORACLE: $5 Standard Updated! 🏎️💨");
      else alert("Error updating settings.");
    } catch (e) { alert("Network Error"); }
    finally { setIsUpdating(false); }
  };

  if (!isAdmin) return <div className="min-h-screen bg-black flex items-center justify-center text-red-500 font-black uppercase tracking-[0.5em]">Access Denied.</div>;

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-end mb-12 border-b border-zinc-800 pb-8">
          <div>
            <p className="text-yellow-500 font-black tracking-widest text-xs mb-2 uppercase">Marpo Group Headquarters</p>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase">Command Center</h1>
          </div>
          <Link href="/" className="text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-widest">Exit Terminal</Link>
        </header>

        {/* 🟢 1순위: 프라이싱 & 오라클 통제 패널 (데이터 로딩과 상관없이 먼저 출력) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-zinc-900/80 p-8 rounded-[2rem] border border-red-900/30">
            <p className="text-red-500 text-[10px] uppercase font-black tracking-widest mb-1 animate-pulse">● Live Pricing Control</p>
            <h3 className="text-xl font-black text-white uppercase mb-6 tracking-tight">Ticket Price (Pi)</h3>
            <div className="flex items-center gap-4">
              <input 
                type="number" 
                value={ticketPrice} 
                onChange={(e) => setTicketPrice(Number(e.target.value))} 
                step="0.01" 
                className="bg-black border border-zinc-800 text-white text-3xl font-black rounded-2xl p-5 w-full text-center focus:border-red-500 outline-none transition-all shadow-inner" 
              />
              <button 
                onClick={updateSettings} 
                disabled={isUpdating} 
                className="bg-red-600 text-white font-black px-8 py-5 rounded-2xl uppercase text-sm hover:bg-red-500 active:scale-95 transition-all shadow-lg"
              >
                {isUpdating ? '...' : 'UPDATE'}
              </button>
            </div>
            <p className="text-[10px] text-zinc-500 mt-4 font-bold tracking-tight">현재 1티켓당 결제될 파이 수량을 직접 조정합니다.</p>
          </div>

          <div className="bg-zinc-900/80 p-8 rounded-[2rem] border border-green-900/30">
            <p className="text-green-500 text-[10px] uppercase font-black tracking-widest mb-1 animate-pulse">● Market Oracle</p>
            <h3 className="text-xl font-black text-white uppercase mb-6 tracking-tight">Pi Market Value ($)</h3>
            <div className="flex items-center gap-4">
              <input 
                type="number" 
                value={peggedUsd} 
                onChange={(e) => setPeggedUsd(Number(e.target.value))} 
                step="0.01" 
                className="bg-black border border-zinc-800 text-white text-3xl font-black rounded-2xl p-5 w-full text-center focus:border-green-500 outline-none transition-all shadow-inner" 
              />
              <button 
                onClick={updateSettings} 
                disabled={isUpdating} 
                className="bg-green-600 text-white font-black px-8 py-5 rounded-2xl uppercase text-sm hover:bg-green-500 active:scale-95 transition-all shadow-lg"
              >
                {isUpdating ? '...' : 'SYNC'}
              </button>
            </div>
            <p className="text-[10px] text-zinc-500 mt-4 font-bold tracking-tight">메인 화면 전광판에 표시될 파이의 시세를 입력합니다.</p>
          </div>
        </div>

        {/* 🟢 2순위: 통계 데이터 표시 */}
        {data ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-zinc-900 p-8 rounded-[2rem] border border-zinc-800">
                <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest mb-2">Total Sales</p>
                <p className="text-4xl font-black">{data.totals?.totalSales || 0} <span className="text-sm font-normal text-zinc-600">Pi</span></p>
              </div>
              <div className="bg-zinc-900 p-8 rounded-[2rem] border border-yellow-500/30">
                <p className="text-yellow-500 text-[10px] uppercase font-black tracking-widest mb-2">Executive Profit (8%)</p>
                <p className="text-4xl font-black text-yellow-500">{data.totals?.houseEdge?.toFixed(2) || "0.00"} <span className="text-sm font-normal text-yellow-900">Pi</span></p>
              </div>
              <div className="bg-zinc-900 p-8 rounded-[2rem] border border-zinc-800">
                <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest mb-2">Child Fund (5%)</p>
                <p className="text-4xl font-black text-white">{data.totals?.childFund?.toFixed(2) || "0.00"} <span className="text-sm font-normal text-zinc-600">Pi</span></p>
              </div>
            </div>

            <div className="bg-zinc-900/30 rounded-[2.5rem] border border-zinc-800 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-zinc-900 text-[10px] uppercase tracking-widest font-black text-zinc-500">
                  <tr>
                    <th className="px-8 py-6">Draw Date</th>
                    <th className="px-8 py-6">Sales</th>
                    <th className="px-8 py-6">Profit</th>
                    <th className="px-8 py-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {data.stats.map((s: any, i: number) => (
                    <tr key={i} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-8 py-6 text-sm font-bold text-zinc-400">{new Date(s.drawDate).toLocaleDateString()}</td>
                      <td className="px-8 py-6 font-black">{s.totalSales} Pi</td>
                      <td className="px-8 py-6 text-yellow-500 font-bold">+{s.houseEdge?.toFixed(2)}</td>
                      <td className="px-8 py-6"><span className="text-[9px] bg-green-500/10 text-green-500 px-3 py-1 rounded-full font-black uppercase">Settled</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="text-center py-20 text-zinc-700 animate-pulse font-black uppercase tracking-widest border border-dashed border-zinc-800 rounded-[2rem]">
            Accessing Historical Ledger...
          </div>
        )}
      </div>
    </div>
  );
}