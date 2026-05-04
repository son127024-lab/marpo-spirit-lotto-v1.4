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
  
  const [ticketPrice, setTicketPrice] = useState<number>(0.13014); 
  const [peggedUsd, setPeggedUsd] = useState<number>(38.42);
  const [jackpot, setJackpot] = useState<number>(0);

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
      
      {/* 헤더 생략 (기존과 동일) */}
      <div className="w-full max-w-md flex flex-col items-center pt-6 mb-8 px-2 relative mt-4 gap-6">
        <div className="flex flex-col items-center text-center">
          <Image src="/marpo-group-logo.png" alt="MARPO GROUP" width={140} height={140} priority={true} />
          <p className="mt-4 text-yellow-500 font-black text-xl tracking-widest uppercase">@{user?.username || "GUEST"}</p>
        </div>
        <div className="flex flex-col items-center gap-4 w-full">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl px-6 py-4 flex flex-col items-center shadow-lg backdrop-blur-sm w-full">
            <p className="text-base text-zinc-400 uppercase tracking-widest font-black mb-2 text-center">Global Pi Price</p>
            <p className="text-3xl font-black text-white tracking-wider text-center">$ {peggedUsd.toLocaleString()} <span className="text-zinc-500 text-lg">USD</span></p>
          </div>
        </div>
      </div>

      <h1 className="text-6xl font-black tracking-[0.1em] mb-3 text-yellow-500 uppercase italic">Marpo Spirit</h1>
      
      {/* 잭팟 전광판 생략 (기존과 동일) */}
      <section className="w-full max-w-md bg-gradient-to-b from-zinc-900 to-black p-8 rounded-[2.5rem] border border-yellow-500/30 mb-12 shadow-[0_20px_50px_rgba(234,179,8,0.15)]">
        <p className="text-zinc-400 text-lg uppercase tracking-[0.2em] font-black mb-6 text-red-500 animate-pulse">● Live Total Prize</p>
        <p className="text-[3.5rem] leading-none font-black text-white tracking-tighter mb-10">{jackpot.toLocaleString(undefined, {minimumFractionDigits: 4})} <br /><span className="text-3xl text-zinc-500 mt-2 block">Pi</span></p>
      </section>

      {/* 번호 선택 UI 생략 (기존과 동일) */}
      <section className="w-full max-w-md mb-14">
        <div className="flex justify-between items-center mb-4 px-1">
          <p className="text-xl font-black text-zinc-500 uppercase tracking-widest">Main Numbers</p>
          <span className={`text-2xl font-black ${mainNumbers.length === 8 ? 'text-yellow-500 animate-pulse' : 'text-zinc-500'}`}>{mainNumbers.length} / 8</span>
        </div>
        <div className="grid grid-cols-7 gap-3 mb-10">
          {Array.from({ length: 45 }, (_, i) => i + 1).map((n) => (
            <button key={`m-${n}`} onClick={() => toggleMainNumber(n)} className={`h-12 w-12 rounded-full text-xl font-black transition-all ${mainNumbers.includes(n) ? 'bg-yellow-500 text-black scale-110 shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 'bg-zinc-800 text-zinc-300 border border-zinc-700/50'}`}>{n}</button>
          ))}
        </div>
        <div className="flex justify-between items-center mb-4 px-1">
          <p className="text-xl font-black text-red-500 uppercase tracking-widest">Spirit Numbers</p>
          <span className={`text-2xl font-black ${spiritNumbers.length === 2 ? 'text-red-500 animate-pulse' : 'text-zinc-500'}`}>{spiritNumbers.length} / 2</span>
        </div>
        <div className="grid grid-cols-7 gap-3 mb-12">
          {Array.from({ length: 45 }, (_, i) => i + 1).map((n) => (
            <button key={`s-${n}`} onClick={() => toggleSpiritNumber(n)} className={`h-12 w-12 rounded-full text-xl font-black transition-all ${spiritNumbers.includes(n) ? 'bg-red-600 text-white scale-110 shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'bg-zinc-800 text-zinc-300 border border-zinc-700/50'}`}>{n}</button>
          ))}
        </div>
      </section>

      {/* 플레이 버튼 */}
      <button onClick={() => setIsModalOpen(true)} disabled={mainNumbers.length !== 8 || spiritNumbers.length !== 2 || !user} className="w-full max-w-md py-8 rounded-[2rem] font-black text-3xl tracking-widest mb-16 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black shadow-xl disabled:opacity-50 uppercase leading-tight">
        PLAY <br />{ticketPrice.toFixed(5)} PI
      </button>

      {/* 🚨 [강화된 마이 티켓 섹션] 당첨/낙첨 결과 분석 로직 */}
      {user && myTickets.length > 0 && (
        <section className="w-full max-w-md mb-16">
          <h2 className="text-2xl font-black text-yellow-500 tracking-widest uppercase italic mb-8 border-b border-zinc-800 pb-4">My Tickets Analysis</h2>
          
          <div className="flex flex-col gap-10">
            {myTickets.map((ticket: any, index: number) => {
              const isWon = ticket?.status === 'WON' || ticket?.status === 'CLAIMED';
              const isLose = ticket?.status === 'LOSE';
              const isPending = ticket?.status === 'COMPLETED';

              return (
                <div key={index} className={`relative bg-zinc-900/90 border-2 rounded-[2.5rem] p-10 transition-all ${isWon ? 'border-yellow-500 shadow-[0_0_40px_rgba(234,179,8,0.3)] bg-gradient-to-b from-zinc-900 to-yellow-950/20' : isLose ? 'border-zinc-800' : 'border-zinc-800 border-dashed'}`}>
                  
                  {/* 상단 상태 태그 및 아이콘 */}
                  <div className="flex justify-between items-center mb-8">
                    <span className="text-sm font-black text-zinc-500 uppercase tracking-widest">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    {isWon && <span className="flex items-center gap-2 text-yellow-500 font-black text-xl animate-bounce">🏆 WINNER</span>}
                    {isLose && <span className="text-zinc-600 font-black text-xl italic uppercase">Try Again</span>}
                    {isPending && <span className="text-blue-500 font-black text-xl animate-pulse tracking-tighter">⌛ PENDING...</span>}
                  </div>

                  {/* 당첨자용 축하 메시지 / 낙첨자용 재도전 아이콘 */}
                  <div className="mb-8">
                    {isWon ? (
                      <div className="py-4 px-6 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl">
                        <p className="text-yellow-500 font-black text-2xl uppercase tracking-tighter mb-1">Congratulations!</p>
                        <p className="text-zinc-400 text-sm font-bold uppercase tracking-widest">The Spirit of Marpo is with you.</p>
                      </div>
                    ) : isLose ? (
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-zinc-500 font-black text-lg uppercase tracking-widest">Better luck next time!</p>
                        <button onClick={() => window.scrollTo({top: 500, behavior: 'smooth'})} className="mt-2 text-red-500 border-b border-red-500 text-sm font-black uppercase pb-1 active:scale-95">🏎️💨 Drive Again</button>
                      </div>
                    ) : null}
                  </div>

                  {/* 번호 대조 섹션 */}
                  <div className="flex flex-col gap-6">
                    <div>
                      <p className="text-xs text-zinc-600 uppercase font-black tracking-[0.3em] mb-3">Your Selection</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {ticket?.selectedNumbers?.main?.map((n: number, i: number) => (
                          <span key={`mt-${i}`} className={`w-10 h-10 flex items-center justify-center text-base font-black rounded-full border ${isWon ? 'bg-yellow-500 text-black border-yellow-400' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>{n}</span>
                        ))}
                        <div className="w-[1px] h-10 bg-zinc-800 mx-1"></div>
                        {ticket?.selectedNumbers?.spirit?.map((n: number, i: number) => (
                          <span key={`st-${i}`} className={`w-10 h-10 flex items-center justify-center text-base font-black rounded-full border ${isWon ? 'bg-red-600 text-white border-red-500' : 'bg-red-900/20 text-red-500 border-red-900/50'}`}>{n}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <WinnerBoard />

      <div className="w-full max-w-md mt-10">
        <button onClick={handleCheckTickets} disabled={isChecking || myTickets.length === 0} className={`w-full py-10 rounded-[2.5rem] font-black text-3xl tracking-[0.1em] uppercase transition-all shadow-xl ${(isChecking || myTickets.length === 0) ? 'bg-zinc-800 text-zinc-600' : 'bg-gradient-to-b from-zinc-800 to-zinc-900 border-2 border-zinc-700 text-white hover:border-yellow-500 hover:text-yellow-500 active:scale-95'}`}>
          {isChecking ? 'SCANNING...' : 'CHECK MY TICKETS'}
        </button>
      </div>

      <div className="w-full max-w-md mt-12 mb-10 text-center">
        <Link href="/whitepaper" className="text-xl text-zinc-500 hover:text-yellow-500 font-black tracking-widest uppercase transition-colors underline decoration-zinc-800 underline-offset-8">Read Whitepaper</Link>
      </div>

      {/* 결제 모달창 생략 (기존과 동일) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex justify-center items-center z-50 p-6">
          <div className="bg-zinc-900 border-2 border-yellow-500/50 p-10 rounded-[2.5rem] w-full max-w-md relative shadow-2xl text-center">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-zinc-400 text-3xl hover:text-white transition-colors">✕</button>
            <h2 className="text-4xl font-black text-yellow-500 mb-8 uppercase italic">Confirm Play</h2>
            <div className="bg-zinc-800/50 border border-zinc-800 rounded-2xl p-8 mb-10 text-center">
              <p className="text-zinc-400 text-lg uppercase tracking-widest font-black mb-4">Price for Entry</p>
              <p className="text-[2.5rem] font-black text-white tracking-tighter leading-none">{ticketPrice.toFixed(5)} <span className="text-2xl text-zinc-500">Pi</span></p>
            </div>
            <button onClick={handlePaymentSubmit} disabled={isStoring} className="w-full bg-gradient-to-r from-yellow-500 to-yellow-400 text-black font-black text-3xl py-6 rounded-2xl uppercase tracking-widest shadow-lg hover:scale-[1.02] active:scale-95">{isStoring ? 'STORING...' : 'PAY NOW'}</button>
          </div>
        </div>
      )}
    </div>
  );
}