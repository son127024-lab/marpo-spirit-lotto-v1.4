// app/admin/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // 🚨 VIP 프리패스: 테스트를 위해 보안문을 임시로 활짝 열어둡니다!
    setIsAdmin(true);
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const res = await fetch('/api/admin/stats');
    const json = await res.json();
    if (json.success) setData(json);
  };

  if (!isAdmin) return <div className="min-h-screen bg-black flex items-center justify-center text-red-500 font-black uppercase tracking-[0.5em]">Access Denied. Executives Only.</div>;

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

        {data ? (
          <>
            {/* 상단 요약 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-zinc-900 p-8 rounded-[2rem] border border-zinc-800">
                <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest mb-2">Total Sales</p>
                <p className="text-4xl font-black">{data.totals.totalSales} <span className="text-sm font-normal text-zinc-600">Pi</span></p>
              </div>
              <div className="bg-zinc-900 p-8 rounded-[2rem] border border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.1)]">
                <p className="text-yellow-500 text-[10px] uppercase font-black tracking-widest mb-2">Executive Profit (8%)</p>
                <p className="text-4xl font-black text-yellow-500">{data.totals.houseEdge.toFixed(2)} <span className="text-sm font-normal text-yellow-900">Pi</span></p>
              </div>
              <div className="bg-zinc-900 p-8 rounded-[2rem] border border-zinc-800">
                <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest mb-2">Child Fund (5%)</p>
                <p className="text-4xl font-black text-white">{data.totals.childFund.toFixed(2)} <span className="text-sm font-normal text-zinc-600">Pi</span></p>
              </div>
            </div>

            {/* 정산 기록 테이블 */}
            <div className="bg-zinc-900/30 rounded-[2.5rem] border border-zinc-800 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-zinc-900 text-[10px] uppercase tracking-widest font-black text-zinc-500">
                  <tr>
                    <th className="px-8 py-6">Draw Date</th>
                    <th className="px-8 py-6">Sales</th>
                    <th className="px-8 py-6">Profit</th>
                    <th className="px-8 py-6">Donation</th>
                    <th className="px-8 py-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {data.stats.map((s: any, i: number) => (
                    <tr key={i} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-8 py-6 text-sm font-bold text-zinc-400">{new Date(s.drawDate).toLocaleString()}</td>
                      <td className="px-8 py-6 font-black">{s.totalSales} Pi</td>
                      <td className="px-8 py-6 text-yellow-500 font-bold">+{s.houseEdge.toFixed(2)}</td>
                      <td className="px-8 py-6 text-zinc-400">{s.childFund.toFixed(2)}</td>
                      <td className="px-8 py-6">
                        <span className="text-[9px] bg-green-500/10 text-green-500 px-3 py-1 rounded-full font-black uppercase border border-green-500/20">Settled</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="text-center py-20 text-zinc-700 animate-pulse font-black uppercase tracking-widest">Accessing Secure Vault...</div>
        )}
      </div>
    </div>
  );
}