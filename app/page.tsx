"use client";

import React, { useState, useEffect } from 'react';
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
  
  // 🚩 과거 기록 보기 토글 상태
  const [showHistory, setShowHistory] = useState<boolean>(false);
  
  const [ticketPrice, setTicketPrice] = useState<number>(0.13014); 
  const [peggedUsd, setPeggedUsd] = useState<number>(38.42);
  const [jackpot, setJackpot] = useState<number>(0);

  // 티켓 분류 로직 (Active / History)
  const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
  
  // 1. 현재 진행 중인 티켓 (추첨 대기 중)
  const activeTickets = myTickets.filter(t => t.status === 'COMPLETED');
  
  // 2. 지난 게임 티켓 (결과 나옴 + 30일 이내)
  const historyTickets = myTickets.filter(t => {
    if (t.status === 'COMPLETED') return false;
    const createdDate = new Date(t.createdAt).getTime();
    const isWithin30Days = (new Date().getTime() - createdDate) < thirtyDaysInMs;
    return isWithin30Days;
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
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        const json = await res.json();
        if (json.success && json.settings) {
          const strictPrice = Number(Number(json.settings.ticketPricePi).toFixed(5));
          setTicketPrice(strictPrice || 0);
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
      const myResponse = await fetch(`/api/tickets?userId=${user?.username}`);
      const myData = await myResponse.json();
      if (myData.success && myData.tickets.length > 0) {
        setMyTickets(myData.tickets);
        const latestTicket = myData.tickets[0];
        if (latestTicket.status === "WON" || latestTicket.status === "CLAIMED") {
          const confetti = (await import('canvas-confetti')).default;
          confetti({ particleCount: 200, spread: 120, origin: { y: 0.6 }, colors: ['#EAB308', '#DC2626', '#FFFFFF'] });
        }
      }
    } finally { setIsChecking(false); }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-4 font-sans relative pb-20 text-center">
      
      {/* 🟢 헤더 및 잭팟 전광판 생략 (기존과 동일) */}
      <div className="w-full max-w-md flex flex-col items-center pt-6 mb-8 px-2 relative mt-4 gap-6">
        <Image src="/marpo-group-logo.png" alt="MARPO GROUP" width={140} height={140} priority={true} />
        <p className="text-yellow-500 font-black text-xl uppercase tracking-widest italic">Marpo Spirit</p>
      </div>

      <section className="w-full max-w-md bg-zinc-900 border border-yellow-500/20 p-8 rounded-[2rem] mb-12">
          <p className="text-zinc-500 text-sm font-black uppercase tracking-widest mb-2">Live Jackpot</p>
          <p className="text-5xl font-black text-white">{jackpot.toLocaleString(undefined, {minimumFractionDigits: 4})} <span className="text-xl text-zinc-600">Pi</span></p>
      </section>

      {/* 🟢 번호 선택 UI (기존과 동일하게 유지) */}
      <section className="w-full max-w-md mb-14">
        <div className="flex justify-between items-center mb-4 px-1">
          <p className="text-lg font-black text-zinc-500 uppercase">Select 8 Numbers</p>
          <span className="text-xl font-black text-yellow-500">{mainNumbers.length} / 8</span>
        </div>
        <div className="grid grid-cols-7 gap-2 mb-10">
          {Array.from({ length: 45 }, (_, i) => i + 1).map((n) => (
            <button key={`m-${n}`} onClick={() => toggleMainNumber(n)} className={`h-11 w-11 rounded-full text-base font-black border ${mainNumbers.includes(n) ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>{n}</button>
          ))}
        </div>
        <div className="flex justify-between items-center mb-4 px-1">
          <p className="text-lg font-black text-red-500 uppercase">Select 2 Spirit</p>
          <span className="text-xl font-black text-red-500">{spiritNumbers.length} / 2</span>
        </div>
        <div className="grid grid-cols-7 gap-2 mb-12">
          {Array.from({ length: 45 }, (_, i) => i + 1).map((n) => (
            <button key={`s-${n}`} onClick={() => toggleSpiritNumber(n)} className={`h-11 w-11 rounded-full text-base font-black border ${spiritNumbers.includes(n) ? 'bg-red-600 text-white border-red-600' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>{n}</button>
          ))}
        </div>
      </section>

      <button onClick={() => setIsModalOpen(true)} disabled={mainNumbers.length !== 8 || spiritNumbers.length !== 2 || !user} className="w-full max-w-md py-6 rounded-[2rem] font-black text-2xl mb-16 bg-yellow-500 text-black shadow-lg disabled:opacity-50">
        PLAY {ticketPrice.toFixed(5)} PI
      </button>

      {/* 🚩 [수정됨] 내 티켓 관리 섹션 (Active & History 분리) */}
      {user && (
        <section className="w-full max-w-md mb-16">
          
          {/* 1. 현재 진행 중인 게임 (메인 노출) */}
          <div className="mb-10">
            <h2 className="text-xl font-black text-yellow-500 tracking-widest uppercase italic mb-6 border-b border-zinc-800 pb-2">Active Tickets</h2>
            {activeTickets.length > 0 ? (
                <div className="flex flex-col gap-4">
                    {activeTickets.map((ticket, i) => (
                        <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
                            <p className="text-sm text-yellow-500 font-black uppercase mb-4 animate-pulse">⌛ Sealed & Waiting</p>
                            <p className="text-3xl font-black text-white tracking-[0.2em]">{getTimeRemaining()}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-zinc-600 font-bold uppercase py-10">No active tickets.</p>
            )}
          </div>

          {/* 2. 지난 게임 결과 (클릭 시에만 노출 + 30일 이내) */}
          {historyTickets.length > 0 && (
            <div className="mt-14">
              <button 
                onClick={() => setShowHistory(!showHistory)} 
                className="w-full py-4 border-2 border-zinc-800 rounded-2xl text-zinc-500 font-black tracking-widest uppercase hover:text-white hover:border-zinc-600 transition-all active:scale-95"
              >
                {showHistory ? '▲ Hide Past Records' : '▼ View Past Records (30 Days)'}
              </button>

              {showHistory && (
                <div className="flex flex-col gap-8 mt-8 animate-fadeIn">
                  {historyTickets.map((ticket, i) => {
                    const isWon = ticket?.status === 'WON' || ticket?.status === 'CLAIMED';
                    return (
                        <div key={i} className={`bg-zinc-900/50 border rounded-3xl p-8 transition-all ${isWon ? 'border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.2)]' : 'border-zinc-800'}`}>
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-xs font-black text-zinc-600 uppercase">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                <span className={`text-sm font-black uppercase ${isWon ? 'text-yellow-500' : 'text-zinc-600'}`}>{ticket.status}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {ticket?.selectedNumbers?.main?.map((n: number, j: number) => (
                                    <span key={j} className="w-9 h-9 flex items-center justify-center text-sm font-black rounded-full bg-zinc-800 border border-zinc-700">{n}</span>
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
        <button onClick={handleCheckTickets} disabled={isChecking || myTickets.length === 0} className="w-full py-8 rounded-[2rem] font-black text-2xl border-2 border-zinc-800 hover:border-yellow-500 transition-all active:scale-95">
          {isChecking ? 'SCANNING...' : 'CHECK MY TICKETS'}
        </button>
      </div>

      {/* 모달 생략 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex justify-center items-center z-50 p-6">
          <div className="bg-zinc-900 border-2 border-yellow-500/50 p-10 rounded-[2.5rem] w-full max-w-md relative shadow-2xl text-center">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-zinc-400 text-3xl">✕</button>
            <h2 className="text-4xl font-black text-yellow-500 mb-8 uppercase italic">Confirm Play</h2>
            <button onClick={handlePaymentSubmit} disabled={isStoring} className="w-full bg-yellow-500 text-black font-black text-3xl py-6 rounded-2xl uppercase shadow-lg">{isStoring ? 'STORING...' : 'PAY NOW'}</button>
          </div>
        </div>
      )}
    </div>
  );
}