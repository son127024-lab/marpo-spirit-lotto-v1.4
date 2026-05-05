"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import WinnerBoard from '../components/WinnerBoard';

export default function MarpoLottoPage() {
  const [user, setUser] = useState<any>(null);
  const [mainNumbers, setMainNumbers] = useState<number[]>([]);
  const [spiritNumbers, setSpiritNumbers] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isStoring, setIsStoring] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [ticketPrice, setTicketPrice] = useState<number>(0.13014); 
  const [peggedUsd, setPeggedUsd] = useState<number>(38.42);
  const [jackpot, setJackpot] = useState<number>(0);

  // 오라클 데이터 호출 (30초 주기)
  const fetchOracleSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/settings', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && json.settings) {
        const strictPrice = Number(Number(json.settings.ticketPricePi).toFixed(5));
        setTicketPrice(strictPrice);
        setPeggedUsd(Number(json.settings.peggedUsd));
        setJackpot(Number(json.settings.realJackpot));
      }
    } catch (e) { console.error("Oracle Sync Error"); }
  }, []);

  const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
  const activeTickets = myTickets.filter(t => t.status === 'COMPLETED');
  const historyTickets = myTickets.filter(t => {
    if (t.status === 'COMPLETED') return false;
    const createdDate = new Date(t.createdAt).getTime();
    return (new Date().getTime() - createdDate) < thirtyDaysInMs;
  });

  const getNextDrawDate = () => {
    const now = new Date();
    const nextFriday = new Date();
    nextFriday.setDate(now.getDate() + (5 - now.getDay() + 7) % 7);
    nextFriday.setHours(20, 0, 0, 0);
    if (now > nextFriday) nextFriday.setDate(nextFriday.getDate() + 7);
    return nextFriday;
  };

  const getTimeRemaining = () => {
    const diff = getNextDrawDate().getTime() - currentTime.getTime();
    if (diff <= 0) return "DRAWING NOW...";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return `${days}D ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    fetchOracleSettings(); 
    const oracleTimer = setInterval(fetchOracleSettings, 30000);
    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => { clearInterval(oracleTimer); clearInterval(clockTimer); };
  }, [fetchOracleSettings]);

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
        const timeoutId = setTimeout(() => { 
          const mu = { username: "MARPO_DEV" }; 
          setUser(mu); 
          fetchMyTickets(mu.username); 
        }, 500);
        return () => clearTimeout(timeoutId);
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
      const safeAmount = Number(ticketPrice.toFixed(5));
      const res = await fetch('/api/tickets', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ numbers: { main: mainNumbers, spirit: spiritNumbers }, userId: user?.username, amount: safeAmount, transactionId: txid }) 
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
      const safeAmount = Number(ticketPrice.toFixed(5));
      const Pi = (window as any).Pi;
      Pi.createPayment({ amount: safeAmount, memo: "Marpo Spirit Entry", metadata: { type: "lotto_ticket" } }, {
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
      if (user?.username) fetchMyTickets(user.username);
    } finally { setIsChecking(false); }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-4 font-sans relative pb-20 text-center">
      
      <div className="w-full max-w-md flex flex-col items-center pt-6 mb-8 px-2 relative mt-4 gap-6">
        <Image src="/marpo-group-logo.png" alt="MARPO GROUP" width={140} height={140} priority={true} />
        <p className="text-yellow-500 font-black text-xl uppercase tracking-widest italic">Marpo Spirit</p>
      </div>

      {/* 🚀 [중요] 잭팟 및 파이 가격창 섹션 */}
      <section className="w-full max-w-md bg-zinc-900 border border-yellow-500/20 p-8 rounded-[2rem] mb-12 shadow-2xl relative overflow-hidden">
          <p className="text-zinc-500 text-sm font-black uppercase tracking-[0.3em] mb-2">Live Jackpot</p>
          <p className="text-5xl font-black text-white tracking-tighter mb-6">
            {jackpot.toLocaleString(undefined, {minimumFractionDigits: 4})} <span className="text-xl text-zinc-600">Pi</span>
          </p>

          {/* 복구된 1 PI VALUE 라인 */}
          <div className="pt-5 border-t border-zinc-800/50 flex justify-between items-center px-2">
            <div className="flex flex-col items-start">
              <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mb-1">Current Oracle</span>
              <span className="text-xs text-zinc-400 font-bold uppercase tracking-tighter">1 Pi Value</span>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-white tracking-tight">
                $ {peggedUsd.toLocaleString(undefined, {minimumFractionDigits: 3})} <span className="text-[10px] text-zinc-500">USD</span>
              </p>
            </div>
          </div>
      </section>

      {/* 번호 선택 UI */}
      <section className="w-full max-w-md mb-14">
        <div className="flex justify-between items-center mb-4 px-1">
          <p className="text-lg font-black text-zinc-500 uppercase tracking-widest">Main Numbers</p>
          <span className="text-xl font-black text-yellow-500">{mainNumbers.length} / 8</span>
        </div>
        <div className="grid grid-cols-7 gap-2 mb-10">
          {Array.from({ length: 45 }, (_, i) => i + 1).map((n) => (
            <button key={`m-${n}`} onClick={() => toggleMainNumber(n)} className={`h-11 w-11 rounded-full text-base font-black border transition-all ${mainNumbers.includes(n) ? 'bg-yellow-500 text-black border-yellow-500 scale-110 shadow-lg' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>{n}</button>
          ))}
        </div>
        <div className="flex justify-between items-center mb-4 px-1">
          <p className="text-lg font-black text-red-500 uppercase tracking-widest">Spirit Numbers</p>
          <span className="text-xl font-black text-red-500">{spiritNumbers.length} / 2</span>
        </div>
        <div className="grid grid-cols-7 gap-2 mb-12">
          {Array.from({ length: 45 }, (_, i) => i + 1).map((n) => (
            <button key={`s-${n}`} onClick={() => toggleSpiritNumber(n)} className={`h-11 w-11 rounded-full text-base font-black border transition-all ${spiritNumbers.includes(n) ? 'bg-red-600 text-white border-red-600 scale-110 shadow-lg' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>{n}</button>
          ))}
        </div>
      </section>

      <button onClick={() => setIsModalOpen(true)} disabled={mainNumbers.length !== 8 || spiritNumbers.length !== 2 || !user} className="w-full max-w-md py-6 rounded-[2.2rem] font-black text-3xl mb-16 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black shadow-[0_10px_40px_rgba(234,179,8,0.3)] disabled:opacity-30 uppercase tracking-tighter">
        PLAY <span className="text-xl ml-2">{ticketPrice.toFixed(5)} PI</span>
      </button>

      {/* 내 티켓 관리 (Active & History) */}
      {user && (
        <section className="w-full max-w-md mb-16">
          <div className="mb-10 text-left">
            <h2 className="text-xl font-black text-yellow-500 tracking-widest uppercase italic mb-6 border-b-2 border-zinc-900 pb-2 flex justify-between items-center">
              Active Tickets
            </h2>
            {activeTickets.length > 0 ? (
                <div className="flex flex-col gap-4">
                    {activeTickets.map((ticket, i) => (
                        <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 shadow-xl text-center">
                            <p className="text-xs text-yellow-500 font-black uppercase mb-4 animate-pulse">● Draw Countdown</p>
                            <p className="text-4xl font-black text-white tracking-[0.1em]">{getTimeRemaining()}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-12 bg-zinc-900/30 rounded-[2rem] border border-dashed border-zinc-800 text-center">
                  <p className="text-zinc-600 font-black uppercase tracking-widest">No active tickets.</p>
                </div>
            )}
          </div>

          {historyTickets.length > 0 && (
            <div className="mt-14">
              <button 
                onClick={() => setShowHistory(!showHistory)} 
                className="w-full py-5 border-2 border-zinc-800 rounded-[1.5rem] text-zinc-500 font-black tracking-widest uppercase hover:text-white transition-all active:scale-95"
              >
                {showHistory ? '▲ Hide Records' : '▼ View Records (30 Days)'}
              </button>

              {showHistory && (
                <div className="flex flex-col gap-6 mt-8 animate-fadeIn">
                  {historyTickets.map((ticket, i) => {
                    const isWon = ticket?.status === 'WON' || ticket?.status === 'CLAIMED';
                    return (
                        <div key={i} className={`bg-zinc-900 border rounded-[2rem] p-8 transition-all ${isWon ? 'border-yellow-500' : 'border-zinc-800 opacity-60'}`}>
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-xs font-black text-zinc-600 uppercase">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                <span className={`text-sm font-black uppercase px-3 py-1 rounded-lg ${isWon ? 'bg-yellow-500 text-black' : 'text-zinc-500'}`}>{ticket.status}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {ticket?.selectedNumbers?.main?.map((n: number, j: number) => (
                                    <span key={j} className="w-9 h-9 flex items-center justify-center text-sm font-black rounded-full bg-black border border-zinc-800">{n}</span>
                                ))}
                            </div>
                        </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      <WinnerBoard />

      <div className="w-full max-w-md mt-10">
        <button onClick={handleCheckTickets} disabled={isChecking || myTickets.length === 0} className="w-full py-8 rounded-[2rem] font-black text-2xl border-2 border-zinc-800 hover:border-yellow-500 transition-all text-zinc-400 active:scale-95">
          {isChecking ? 'SCANNING...' : 'CHECK MY TICKETS'}
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex justify-center items-center z-50 p-6 text-center">
          <div className="bg-zinc-900 border-2 border-yellow-500/30 p-10 rounded-[3rem] w-full max-w-md relative shadow-2xl">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-zinc-500 text-3xl">✕</button>
            <h2 className="text-4xl font-black text-yellow-500 mb-10 uppercase italic">Confirm Play</h2>
            <div className="bg-black border border-zinc-800 rounded-3xl p-8 mb-10">
              <p className="text-zinc-500 text-sm font-black uppercase tracking-widest mb-2">Ticket Price</p>
              <p className="text-4xl font-black text-white">{ticketPrice.toFixed(5)} <span className="text-xl text-zinc-600">Pi</span></p>
            </div>
            <button onClick={handlePaymentSubmit} disabled={isStoring} className="w-full bg-yellow-500 text-black font-black text-3xl py-7 rounded-[1.5rem] uppercase tracking-widest shadow-xl active:scale-95">{isStoring ? 'STORING...' : 'PAY NOW'}</button>
          </div>
        </div>
      )}
    </div>
  );
}