"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import WinnerBoard from '../components/WinnerBoard';
// @ts-ignore
import confetti from 'canvas-confetti';

export default function MarpoLottoPage() {
  const [user, setUser] = useState<any>(null);
  const [mainNumbers, setMainNumbers] = useState<number[]>([]);
  const [spiritNumbers, setSpiritNumbers] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStoring, setIsStoring] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [ticketPrice, setTicketPrice] = useState<number>(0.13014055); 
  const [peggedUsd, setPeggedUsd] = useState<number>(38.42);
  const [jackpot, setJackpot] = useState<number>(0);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        const json = await res.json();
        if (json.success && json.settings) {
          setTicketPrice(Number(json.settings.ticketPricePi) || 0);
          setPeggedUsd(Number(json.settings.peggedUsd) || 0);
          setJackpot(Number(json.settings.realJackpot) || 0);
        }
      } catch (e) { console.error("Oracle fetch error"); }
    };
    fetchSettings();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchMyTickets = async (userId: string) => {
    try {
      const response = await fetch(`/api/tickets?userId=${userId}`);
      const data = await response.json();
      if (data.success) setMyTickets(data.tickets);
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (isLocalhost) {
        setTimeout(() => { const mu = { username: "MARPO_DEV" }; setUser(mu); fetchMyTickets(mu.username); }, 500);
        return;
      }
      const initPi = async () => {
        try {
          const Pi = (window as any).Pi;
          if (Pi) {
            await Pi.init({ version: "2.0", sandbox: true });
            const auth = await Pi.authenticate(['username', 'payments'], async (p: any) => {
              await fetch('/api/payments/complete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentId: p.identifier, txid: p.transaction?.txid || 'cleanup' }) });
            });
            setUser(auth.user);
            fetchMyTickets(auth.user.username);
          }
        } catch (err) { setUser({ username: "GUEST" }); }
      };
      initPi();
    }
  }, []);

  const toggleMainNumber = (n: number) => {
    if (mainNumbers.includes(n)) setMainNumbers(mainNumbers.filter(x => x !== n));
    else if (mainNumbers.length < 8) setMainNumbers([...mainNumbers, n].sort((a, b) => a - b));
  };

  const toggleSpiritNumber = (n: number) => {
    if (spiritNumbers.includes(n)) setSpiritNumbers(spiritNumbers.filter(x => x !== n));
    else if (spiritNumbers.length < 2) setSpiritNumbers([...spiritNumbers, n].sort((a, b) => a - b));
  };

  const saveTicketToDB = async (txid: string) => {
    try {
      const res = await fetch('/api/tickets', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ numbers: { main: mainNumbers, spirit: spiritNumbers }, userId: user?.username, amount: ticketPrice, transactionId: txid }) 
      });
      if (res.ok) { 
        alert("MARPO VAULT: Ticket Sealed! 🏎️💨");
        if (user?.username) fetchMyTickets(user.username);
      }
    } finally {
      setIsStoring(false); setIsModalOpen(false); setMainNumbers([]); setSpiritNumbers([]);
    }
  };

  const handlePaymentSubmit = async () => {
    if (isStoring) return; setIsStoring(true);
    if (window.location.hostname === 'localhost') { await saveTicketToDB("DEV_TXID"); return; }
    try {
      const Pi = (window as any).Pi;
      Pi.createPayment({ amount: ticketPrice, memo: "Marpo Spirit Entry", metadata: { type: "lotto_ticket" } }, {
        onReadyForServerApproval: async (pid: string) => fetch('/api/payments/approve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentId: pid }) }),
        onReadyForServerCompletion: async (pid: string, txid: string) => {
          await fetch('/api/payments/complete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentId: pid, txid }) });
          await saveTicketToDB(txid);
        },
        onCancel: () => setIsStoring(false),
        onError: () => setIsStoring(false)
      });
    } catch (e) { setIsStoring(false); }
  };

  const handleCheckTickets = async () => {
    setIsChecking(true);
    try {
      await fetch('/api/draw', { method: 'POST' });
      const myResponse = await fetch(`/api/tickets?userId=${user?.username}`);
      const myData = await myResponse.json();
      if (myData.success && myData.tickets.length > 0) {
        setMyTickets(myData.tickets);
        const latestTicket = myData.tickets[0];
        if (latestTicket.status === "WON" || latestTicket.status === "CLAIMED") {
          confetti({ particleCount: 200, spread: 120, origin: { y: 0.6 }, colors: ['#EAB308', '#DC2626', '#FFFFFF'] });
          alert(`🎉 Congratulations! You won the ${latestTicket.rank} prize!`);
        } else {
          alert("Keep playing for the Spirit! 🏎️💨");
        }
      }
    } finally { setIsChecking(false); }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-4 font-sans relative pb-20 text-center">
      
      <style jsx>{`
        @keyframes slowGlow {
          0%, 100% { opacity: 0.4; filter: brightness(0.8); }
          50% { opacity: 1; filter: brightness(1.2); }
        }
        .animate-slow-glow {
          animation: slowGlow 3s ease-in-out infinite;
        }
      `}</style>

      {/* 🟢 헤더 영역: 모바일 가독성 업그레이드 */}
      <div className="w-full max-w-md flex justify-between items-start pt-6 mb-8 px-2 relative mt-4">
        <div className="flex flex-col items-start text-left">
          <Image src="/marpo-group-logo.png" alt="MARPO GROUP" width={110} height={110} priority />
          <p className="mt-3 text-yellow-500 font-black text-sm tracking-widest uppercase">@{user?.username || "GUEST"}</p>
        </div>

        <div className="flex flex-col items-end gap-3">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl px-5 py-3 flex flex-col items-end shadow-lg backdrop-blur-sm">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black mb-1 text-right">Global Pi Price</p>
            <p className="text-base font-black text-white tracking-wider text-right">$ {peggedUsd.toLocaleString()} <span className="text-zinc-500 text-xs">USD</span></p>
          </div>
          
          <div className="flex flex-col items-end pr-1 animate-slow-glow">
            <p className="text-[9px] text-zinc-400 leading-tight tracking-tighter text-right uppercase font-bold mb-0.5">
              Price fluctuates based on Pi value.
            </p>
            <p className="text-[11px] text-yellow-600 font-black leading-tight tracking-tighter text-right uppercase">
              MARPO GROUP SUPPORTS <span className="text-yellow-500">GCV</span>
            </p>
          </div>
        </div>
      </div>

      {/* 🟢 타이틀 영역 */}
      <h1 className="text-4xl md:text-5xl font-black tracking-[0.2em] mb-2 text-yellow-500 uppercase italic">Marpo Spirit</h1>
      <p className="text-zinc-500 mb-10 uppercase tracking-[0.3em] text-xs font-bold">Lottoworld Global Jackpot</p>

      {/* 🟢 잭팟 전광판: 글씨 크기 및 간격 최적화 */}
      <section className="w-full max-w-md bg-gradient-to-b from-zinc-900 to-black p-8 rounded-[2.5rem] border border-yellow-500/30 mb-10 shadow-[0_20px_50px_rgba(234,179,8,0.15)]">
        <p className="text-zinc-400 text-xs uppercase tracking-[0.3em] font-black mb-4 text-red-500 animate-pulse">● Live Total Applied Prize</p>
        <p className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-8">{jackpot.toLocaleString(undefined, {minimumFractionDigits: 4})} <span className="text-2xl text-zinc-600">Pi</span></p>
        
        <div className="flex items-center justify-center gap-6 bg-zinc-800/50 py-4 px-6 rounded-2xl border border-zinc-700/50">
          <div className="text-left">
            <p className="text-[11px] text-zinc-400 uppercase font-black tracking-widest mb-1">Draw Date</p>
            <p className="text-base text-yellow-500 font-black uppercase italic">Friday, 20:00 KST</p>
          </div>
          <div className="w-px h-10 bg-zinc-600/50"></div>
          <div className="text-left">
            <p className="text-[11px] text-zinc-400 uppercase font-black tracking-widest text-center mb-1">Status</p>
            <p className="text-base text-green-500 font-black uppercase animate-pulse text-center">Open</p>
          </div>
        </div>
      </section>

      {/* 🟢 번호 선택 버튼: 모바일 터치 영역 대폭 개선 (w-11 -> w-12, text-xs -> text-sm) */}
      <section className="w-full max-w-md mb-12">
        <div className="grid grid-cols-7 gap-3 mb-8">
          {Array.from({ length: 45 }, (_, i) => i + 1).map((n) => (
            <button key={`m-${n}`} onClick={() => toggleMainNumber(n)} className={`h-12 w-12 rounded-full text-sm font-black transition-all ${mainNumbers.includes(n) ? 'bg-yellow-500 text-black scale-110 shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 'bg-zinc-800 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-700'}`}>{n}</button>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-3">
          {Array.from({ length: 45 }, (_, i) => i + 1).map((n) => (
            <button key={`s-${n}`} onClick={() => toggleSpiritNumber(n)} className={`h-12 w-12 rounded-full text-sm font-black transition-all ${spiritNumbers.includes(n) ? 'bg-red-600 text-white scale-110 shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'bg-zinc-800 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-700'}`}>{n}</button>
          ))}
        </div>
      </section>

      {/* 🟢 하단 플레이 및 유틸리티 버튼 */}
      <button onClick={() => setIsModalOpen(true)} disabled={mainNumbers.length !== 8 || spiritNumbers.length !== 2 || !user} className="w-full max-w-md py-6 rounded-2xl font-black text-2xl tracking-[0.1em] mb-16 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black shadow-xl disabled:opacity-50 transition-all uppercase hover:scale-[1.02] active:scale-95">
        PLAY {ticketPrice.toFixed(8)} PI
      </button>

      <WinnerBoard />

      <div className="w-full max-w-md mt-8">
        <button onClick={handleCheckTickets} disabled={isChecking || myTickets.length === 0} className={`w-full py-6 rounded-2xl font-black text-xl tracking-[0.2em] uppercase transition-all shadow-lg ${(isChecking || myTickets.length === 0) ? 'bg-zinc-800 text-zinc-500' : 'bg-zinc-900 border border-zinc-700 text-white hover:border-yellow-500 hover:text-yellow-500 active:scale-95'}`}>
          {isChecking ? 'SCANNING...' : 'CHECK MY TICKETS'}
        </button>
      </div>

      <div className="w-full max-w-md mt-8 mb-8 text-center">
        <Link href="/whitepaper" className="text-sm text-zinc-400 hover:text-yellow-500 font-bold tracking-[0.2em] uppercase transition-colors underline decoration-zinc-700 hover:decoration-yellow-500/50 underline-offset-8">
          Read Marpo Whitepaper
        </Link>
      </div>

      {/* 🟢 결제 확인 모달창 텍스트 크기 조정 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex justify-center items-center z-50 p-6">
          <div className="bg-zinc-900 border-2 border-yellow-500/50 p-8 rounded-[2.5rem] w-full max-w-md relative shadow-2xl">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-zinc-400 text-xl hover:text-white transition-colors">✕</button>
            <h2 className="text-3xl font-black text-yellow-500 mb-6 uppercase italic">Confirm Play</h2>
            <div className="bg-zinc-800/50 border border-zinc-800 rounded-2xl p-6 mb-8">
              <p className="text-zinc-400 text-xs uppercase tracking-widest font-bold mb-3">Price for Entry</p>
              <p className="text-4xl font-black text-white tracking-tighter">{ticketPrice.toFixed(8)} Pi</p>
            </div>
            <button onClick={handlePaymentSubmit} disabled={isStoring} className="w-full bg-gradient-to-r from-yellow-500 to-yellow-400 text-black font-black text-xl py-5 rounded-2xl uppercase tracking-widest shadow-lg hover:scale-[1.02] active:scale-95">{isStoring ? 'STORING...' : 'PAY NOW'}</button>
          </div>
        </div>
      )}
    </div>
  );
}