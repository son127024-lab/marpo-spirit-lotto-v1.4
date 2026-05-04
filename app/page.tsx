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
  
  // 🟢 모든 상태는 순수한 숫자(Number)로 관리하여 에러 원천 차단
  const [ticketPrice, setTicketPrice] = useState<number>(0.13014); 
  const [peggedUsd, setPeggedUsd] = useState<number>(38.42);
  const [jackpot, setJackpot] = useState<number>(0);

  // 다음 추첨일 계산 로직
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
      
      {/* 🚨 에러 1번 해결: Next.js 안전 규격의 스타일 주입 방식 */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slowGlow {
          0%, 100% { opacity: 0.4; filter: brightness(0.8); }
          50% { opacity: 1; filter: brightness(1.2); }
        }
        .animate-slow-glow { animation: slowGlow 3s ease-in-out infinite; }
      `}} />

      {/* 헤더 영역 */}
      <div className="w-full max-w-md flex flex-col items-center pt-6 mb-8 px-2 relative mt-4 gap-6">
        <div className="flex flex-col items-center text-center">
          <Image src="/marpo-group-logo.png" alt="MARPO GROUP" width={140} height={140} priority />
          <p className="mt-4 text-yellow-500 font-black text-xl tracking-widest uppercase">@{user?.username || "GUEST"}</p>
        </div>

        <div className="flex flex-col items-center gap-4 w-full">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl px-6 py-4 flex flex-col items-center shadow-lg backdrop-blur-sm w-full">
            <p className="text-base text-zinc-400 uppercase tracking-widest font-black mb-2 text-center">Global Pi Price</p>
            <p className="text-3xl font-black text-white tracking-wider text-center">$ {peggedUsd.toLocaleString()} <span className="text-zinc-500 text-lg">USD</span></p>
          </div>
          
          <div className="flex flex-col items-center animate-slow-glow w-full bg-yellow-900/10 py-3 rounded-xl border border-yellow-500/20">
            <p className="text-sm text-zinc-400 leading-relaxed tracking-tight text-center uppercase font-bold mb-1">
              Price fluctuates based on Pi value.
            </p>
            <p className="text-lg text-yellow-600 font-black leading-tight tracking-tight text-center uppercase">
              MARPO GROUP SUPPORTS <span className="text-yellow-500">GCV</span>
            </p>
          </div>
        </div>
      </div>

      <h1 className="text-6xl font-black tracking-[0.1em] mb-3 text-yellow-500 uppercase italic">Marpo Spirit</h1>
      <p className="text-zinc-400 mb-12 uppercase tracking-[0.2em] text-lg font-black">Lottoworld Global Jackpot</p>

      {/* 잭팟 전광판 */}
      <section className="w-full max-w-md bg-gradient-to-b from-zinc-900 to-black p-8 rounded-[2.5rem] border border-yellow-500/30 mb-12 shadow-[0_20px_50px_rgba(234,179,8,0.15)]">
        <p className="text-zinc-400 text-lg uppercase tracking-[0.2em] font-black mb-6 text-red-500 animate-pulse">● Live Total Prize</p>
        <p className="text-[3.5rem] leading-none font-black text-white tracking-tighter mb-10">{jackpot.toLocaleString(undefined, {minimumFractionDigits: 4})} <br/><span className="text-3xl text-zinc-500 mt-2 block">Pi</span></p>
        
        <div className="flex flex-col gap-4 bg-zinc-800/50 py-6 px-6 rounded-2xl border border-zinc-700/50">
          <div className="text-center">
            <p className="text-base text-zinc-400 uppercase font-black tracking-widest mb-2">Draw Date</p>
            <p className="text-2xl text-yellow-500 font-black uppercase italic">Friday, 20:00 KST</p>
          </div>
          <div className="w-full h-px bg-zinc-600/50 my-2"></div>
          <div className="text-center">
            <p className="text-base text-zinc-400 uppercase font-black tracking-widest mb-2">Status</p>
            <p className="text-2xl text-green-500 font-black uppercase animate-pulse">Open</p>
          </div>
        </div>
      </section>

      {/* 번호 선택 버튼 */}
      <section className="w-full max-w-md mb-14">
        <p className="text-xl font-black text-zinc-500 mb-4 uppercase tracking-widest">Main Numbers</p>
        <div className="grid grid-cols-7 gap-3 mb-10">
          {Array.from({ length: 45 }, (_, i) => i + 1).map((n) => (
            <button key={`m-${n}`} onClick={() => toggleMainNumber(n)} className={`h-12 w-12 rounded-full text-xl font-black transition-all ${mainNumbers.includes(n) ? 'bg-yellow-500 text-black scale-110 shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 'bg-zinc-800 text-zinc-300 border border-zinc-700/50 hover:bg-zinc-700'}`}>{n}</button>
          ))}
        </div>
        <p className="text-xl font-black text-red-500 mb-4 uppercase tracking-widest">Spirit Numbers</p>
        <div className="grid grid-cols-7 gap-3">
          {Array.from({ length: 45 }, (_, i) => i + 1).map((n) => (
            <button key={`s-${n}`} onClick={() => toggleSpiritNumber(n)} className={`h-12 w-12 rounded-full text-xl font-black transition-all ${spiritNumbers.includes(n) ? 'bg-red-600 text-white scale-110 shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'bg-zinc-800 text-zinc-300 border border-zinc-700/50 hover:bg-zinc-700'}`}>{n}</button>
          ))}
        </div>
      </section>

      {/* 결제 버튼 (5자리 정밀도 안전 적용) */}
      <button onClick={() => setIsModalOpen(true)} disabled={mainNumbers.length !== 8 || spiritNumbers.length !== 2 || !user} className="w-full max-w-md py-8 rounded-[2rem] font-black text-3xl tracking-widest mb-16 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black shadow-xl disabled:opacity-50 transition-all uppercase hover:scale-[1.02] active:scale-95 leading-tight">
        PLAY <br/>{ticketPrice.toFixed(5)} PI
      </button>

      {/* 🚨 에러 2,3번 해결: 사라졌던 '내 구매 내역(My Tickets)' 복구 및 2배 크기 적용 */}
      {user && myTickets.length > 0 && (
        <section className="w-full max-w-md mb-16">
          <div className="flex items-center justify-between mb-8 border-b border-zinc-800 pb-4">
            <h2 className="text-2xl font-black text-yellow-500 tracking-widest uppercase italic">My Tickets</h2>
            <span className="text-sm text-zinc-500 font-black tracking-widest bg-zinc-900 px-4 py-2 rounded-full border border-zinc-800">{myTickets.length} ENTRY</span>
          </div>
          
          <div className="flex flex-col gap-8">
            {myTickets.map((ticket: any, index: number) => {
              const drawDate = ticket.drawDate ? new Date(ticket.drawDate) : null;
              const expiryDate = drawDate ? new Date(drawDate.getTime() + 365 * 24 * 60 * 60 * 1000) : null;
              const isExpired = expiryDate && new Date() > expiryDate;

              return (
                <div key={index} className={`bg-zinc-900/80 border rounded-[2rem] p-8 shadow-xl text-center transition-all ${ticket.status === 'WON' ? 'border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.2)]' : ticket.status === 'CLAIMED' ? 'border-green-900' : 'border-zinc-800'}`}>
                  <div className="flex justify-between items-center mb-6 text-center">
                    <span className="text-sm font-black text-zinc-500 uppercase">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    <span className={`text-sm font-black px-5 py-2 rounded-full uppercase ${
                      ticket.status === 'WON' ? 'bg-yellow-500 text-black animate-pulse' : 
                      ticket.status === 'CLAIMED' ? 'bg-green-600 text-white' :
                      ticket.status === 'LOSE' ? 'bg-zinc-800 text-zinc-600' : 'bg-zinc-800 text-yellow-500'
                    }`}>
                      {ticket.status === 'COMPLETED' ? '⌛ Waiting' : isExpired && ticket.status === 'WON' ? 'Expired' : ticket.status}
                    </span>
                  </div>

                  {ticket.status === 'COMPLETED' ? (
                    <div className="bg-zinc-800/40 border border-dashed border-zinc-700 rounded-2xl p-8 mb-6">
                      <p className="text-sm text-yellow-500/70 font-black uppercase tracking-[0.2em] mb-4">Ticket Sealed</p>
                      <p className="text-4xl font-black text-white tracking-widest animate-pulse">{getTimeRemaining()}</p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3 mb-6 justify-center">
                      {ticket.selectedNumbers.main.map((n: number, i: number) => <span key={`mt-${i}`} className={`w-12 h-12 flex items-center justify-center text-lg font-black rounded-full border shadow-lg ${ticket.status === 'WON' ? 'bg-yellow-500 text-black border-yellow-400' : 'bg-zinc-800 text-white border-zinc-700'}`}>{n}</span>)}
                      <div className="w-[2px] h-12 bg-zinc-800 mx-2"></div>
                      {ticket.selectedNumbers.spirit.map((n: number, i: number) => <span key={`st-${i}`} className={`w-12 h-12 flex items-center justify-center text-lg font-black rounded-full border shadow-lg ${ticket.status === 'WON' ? 'bg-red-600 text-white border-red-500' : 'bg-red-900/30 text-red-500 border-red-900/50'}`}>{n}</span>)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      <WinnerBoard />

      <div className="w-full max-w-md mt-10">
        <button onClick={handleCheckTickets} disabled={isChecking || myTickets.length === 0} className={`w-full py-8 rounded-[2rem] font-black text-2xl tracking-[0.1em] uppercase transition-all shadow-lg ${(isChecking || myTickets.length === 0) ? 'bg-zinc-800 text-zinc-500' : 'bg-zinc-900 border border-zinc-700 text-white hover:border-yellow-500 hover:text-yellow-500 active:scale-95'}`}>
          {isChecking ? 'SCANNING...' : 'CHECK MY TICKETS'}
        </button>
      </div>

      <div className="w-full max-w-md mt-10 mb-10 text-center">
        <Link href="/whitepaper" className="text-xl text-zinc-400 hover:text-yellow-500 font-black tracking-widest uppercase transition-colors underline decoration-zinc-700 hover:decoration-yellow-500/50 underline-offset-8">
          Read Marpo Whitepaper
        </Link>
      </div>

      {/* 결제 확인 모달창 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex justify-center items-center z-50 p-6">
          <div className="bg-zinc-900 border-2 border-yellow-500/50 p-10 rounded-[2.5rem] w-full max-w-md relative shadow-2xl">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-zinc-400 text-3xl hover:text-white transition-colors">✕</button>
            <h2 className="text-4xl font-black text-yellow-500 mb-8 uppercase italic">Confirm Play</h2>
            <div className="bg-zinc-800/50 border border-zinc-800 rounded-2xl p-8 mb-10">
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