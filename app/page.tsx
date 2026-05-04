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
  
  // 🟢 오라클 연동 상태 (초기값 $5 기준)
  const [ticketPrice, setTicketPrice] = useState("0.13014055"); 
  const [peggedUsd, setPeggedUsd] = useState(38.42);
  const [jackpot, setJackpot] = useState("0.0000");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        const json = await res.json();
        if (json.success && json.settings) {
          setTicketPrice(Number(json.settings.ticketPricePi).toFixed(8));
          setPeggedUsd(json.settings.peggedUsd);
          setJackpot(Number(json.settings.realJackpot).toLocaleString(undefined, {minimumFractionDigits: 4}));
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
        body: JSON.stringify({ numbers: { main: mainNumbers, spirit: spiritNumbers }, userId: user?.username, amount: Number(ticketPrice), transactionId: txid }) 
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
      Pi.createPayment({ amount: Number(ticketPrice), memo: "Marpo Spirit Entry", metadata: { type: "lotto_ticket" } }, {
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
      
      <div className="w-full max-w-md flex justify-between items-start pt-6 mb-6 px-2 relative mt-4">
        <div className="flex flex-col items-start text-left">
          <Image src="/marpo-group-logo.png" alt="MARPO GROUP" width={100} height={100} priority />
          <p className="mt-2 text-yellow-500 font-black text-xs tracking-widest uppercase">@{user?.username || "GUEST"}</p>
        </div>
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-2 flex flex-col items-end shadow-lg backdrop-blur-sm">
          <p className="text-[8px] text-zinc-500 uppercase tracking-widest font-black mb-1 text-right">Global Pi Price</p>
          <p className="text-sm font-black text-white tracking-wider text-right">$ {peggedUsd} <span className="text-zinc-500 text-[10px]">USD</span></p>
        </div>
      </div>

      <h1 className="text-4xl font-black tracking-[0.2em] mb-1 text-yellow-500 uppercase italic">Marpo Spirit</h1>
      <p className="text-zinc-500 mb-8 uppercase tracking-[0.4em] text-[10px]">Lottoworld Global Jackpot</p>

      <section className="w-full max-w-md bg-gradient-to-b from-zinc-900 to-black p-8 rounded-[2.5rem] border border-yellow-500/30 mb-10 shadow-[0_20px_50px_rgba(234,179,8,0.1)]">
        <p className="text-zinc-500 text-[10px] uppercase tracking-[0.5em] font-black mb-3 text-red-500 animate-pulse">● Live Total Applied Prize</p>
        <p className="text-6xl font-black text-white tracking-tighter mb-6">{jackpot} <span className="text-xl text-zinc-600">Pi</span></p>
        <div className="flex items-center justify-center gap-4 bg-zinc-800/40 py-3 px-6 rounded-2xl border border-zinc-700/30">
          <div className="text-left"><p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">Draw Date</p><p className="text-sm text-yellow-500 font-black uppercase italic">Friday, 20:00 KST</p></div>
          <div className="w-px h-8 bg-zinc-700/50"></div>
          <div className="text-left"><p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest text-center">Status</p><p className="text-sm text-green-500 font-black uppercase animate-pulse">Open</p></div>
        </div>
      </section>

      <section className="w-full max-w-md mb-10">
        <div className="grid grid-cols-7 gap-2 mb-8">
          {Array.from({ length: 45 }, (_, i) => i + 1).map((n) => (
            <button key={`m-${n}`} onClick={() => toggleMainNumber(n)} className={`h-11 w-11 rounded-full text-xs font-black transition-all ${mainNumbers.includes(n) ? 'bg-yellow-500 text-black scale-110 shadow-lg' : 'bg-zinc-800 text-zinc-500 border border-zinc-700/50'}`}>{n}</button>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 45 }, (_, i) => i + 1).map((n) => (
            <button key={`s-${n}`} onClick={() => toggleSpiritNumber(n)} className={`h-11 w-11 rounded-full text-xs font-black transition-all ${spiritNumbers.includes(n) ? 'bg-red-600 text-white scale-110 shadow-lg' : 'bg-zinc-800 text-zinc-500 border border-zinc-700/50'}`}>{n}</button>
          ))}
        </div>
      </section>

      <button onClick={() => setIsModalOpen(true)} disabled={mainNumbers.length !== 8 || spiritNumbers.length !== 2 || !user} className="w-full max-w-md py-5 rounded-2xl font-black text-2xl tracking-[0.1em] mb-16 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black shadow-xl disabled:opacity-50 transition-all uppercase">
        PLAY {ticketPrice} PI
      </button>

      <WinnerBoard />

      <div className="w-full max-w-md mt-6">
        <button onClick={handleCheckTickets} disabled={isChecking || myTickets.length === 0} className={`w-full py-5 rounded-2xl font-black text-xl tracking-[0.2em] uppercase transition-all shadow-lg ${(isChecking || myTickets.length === 0) ? 'bg-zinc-800 text-zinc-500' : 'bg-zinc-900 border border-zinc-700 text-white hover:border-yellow-500 hover:text-yellow-500'}`}>
          {isChecking ? 'SCANNING...' : 'CHECK MY TICKETS'}
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex justify-center items-center z-50 p-6">
          <div className="bg-zinc-900 border-2 border-yellow-500/50 p-8 rounded-[2.5rem] w-full max-w-md relative shadow-2xl">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-zinc-500">✕</button>
            <h2 className="text-3xl font-black text-yellow-500 mb-6 uppercase italic">Confirm Play</h2>
            <div className="bg-zinc-800/50 border border-zinc-800 rounded-2xl p-6 mb-8">
              <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold mb-2">Price for Entry</p>
              <p className="text-4xl font-black text-white tracking-tighter">{ticketPrice} Pi</p>
            </div>
            <button onClick={handlePaymentSubmit} disabled={isStoring} className="w-full bg-gradient-to-r from-yellow-500 to-yellow-400 text-black font-black text-xl py-5 rounded-2xl uppercase tracking-widest shadow-lg">{isStoring ? 'STORING...' : 'PAY NOW'}</button>
          </div>
        </div>
      )}
    </div>
  );
}