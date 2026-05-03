"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import WinnerBoard from '../components/WinnerBoard';

// 🚨 에러 방어막: TypeScript 검사기 무시 명령어
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
  
  const mockJackpot = "15,420 Pi";

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
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchMyTickets = async (userId: string) => {
    try {
      const response = await fetch(`/api/tickets?userId=${userId}`);
      if (!response.ok) return;
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
          if (!(window as any).Pi) {
            const script = document.createElement('script');
            script.src = "https://sdk.minepi.com/pi-sdk.js";
            document.head.appendChild(script);
            await new Promise(r => setTimeout(r, 1000));
          }
          if ((window as any).Pi) {
            const Pi = (window as any).Pi;
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
      const res = await fetch('/api/tickets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ numbers: { main: mainNumbers, spirit: spiritNumbers }, userId: user?.username, amount: 1, transactionId: txid }) });
      if (res.ok) { 
        alert("MARPO VAULT: Your ticket has been safely sealed! 🏎️💨");
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
      Pi.createPayment({ amount: 1, memo: "Marpo Spirit Entry", metadata: { type: "lotto_ticket" } }, {
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

  const handleClaimPrize = async (ticketId: string) => {
    try {
      const res = await fetch('/api/claim', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ticketId }) });
      const data = await res.json();
      alert(data.message);
      if (data.success && user?.username) fetchMyTickets(user.username);
    } catch (e) { alert("Network Error"); }
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
        
        if (latestTicket.status === "COMPLETED") {
          alert(`Your ticket is still sealed, @${user?.username}.\nPlease wait for the draw (Friday 20:00 KST)! 🏎️💨`);
        } else if (latestTicket.status === "WON" || latestTicket.status === "CLAIMED") {
          try {
            const audio = new Audio('/win.mp3');
            audio.play().catch(() => console.log("Sound muted by browser"));
          } catch (e) {}

          confetti({
            particleCount: 200,
            spread: 120,
            origin: { y: 0.6 },
            colors: ['#EAB308', '#DC2626', '#FFFFFF'], 
            zIndex: 9999
          });

          setTimeout(() => {
            alert(`🎉 Congratulations, @${user?.username}!\nYou won the ${latestTicket.rank} prize in the latest draw! 🏆`);
          }, 500);
        } else {
          alert(`Unfortunately, @${user?.username}, your latest ticket didn't win.\nBetter luck next time!`);
        }
      } else {
        alert("No tickets found. Please play 1 PI first!");
      }
    } catch (e) {
      alert("Network error: Could not connect to the draw server.");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-4 font-sans relative pb-20">
      <div className="mt-10 mb-6"><Image src="/marpo-group-logo.png" alt="MARPO GROUP" width={180} height={180} priority /></div>
      <div className="mb-6 h-6">{user ? <p className="text-yellow-500 font-black tracking-widest uppercase">Welcome, @{user.username}</p> : <p className="text-zinc-600 text-sm tracking-[0.3em] uppercase animate-pulse">Connecting...</p>}</div>
      <h1 className="text-4xl font-black tracking-[0.2em] mb-1 text-yellow-500 uppercase italic">Marpo Spirit</h1>
      <p className="text-zinc-500 mb-8 uppercase tracking-[0.4em] text-[10px]">Lottoworld Global Jackpot</p>

      <section className="w-full max-w-md bg-gradient-to-b from-zinc-900 to-black p-8 rounded-[2.5rem] border border-yellow-500/30 mb-10 text-center shadow-[0_20px_50px_rgba(234,179,8,0.1)]">
        <p className="text-zinc-500 text-[10px] uppercase tracking-[0.5em] font-black mb-3">Current Accumulated Prize</p>
        <p className="text-6xl font-black text-white tracking-tighter mb-6">{mockJackpot}</p>
        <div className="flex items-center justify-center gap-4 bg-zinc-800/40 py-3 px-6 rounded-2xl border border-zinc-700/30">
          <div className="text-left"><p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">Next Draw Date</p><p className="text-sm text-yellow-500 font-black uppercase italic">Friday, 20:00 KST</p></div>
          <div className="w-px h-8 bg-zinc-700/50"></div>
          <div className="text-left"><p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest text-center">Status</p><p className="text-sm text-green-500 font-black uppercase animate-pulse text-center">Open</p></div>
        </div>
      </section>

      <section className="w-full max-w-md bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800 mb-6">
        <div className="flex justify-between items-end mb-6 px-1"><h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Main Numbers</h2><span className="text-2xl font-black text-yellow-500 italic">{mainNumbers.length}<span className="text-zinc-600 text-sm not-italic ml-1">/ 8</span></span></div>
        <div className="grid grid-cols-7 gap-2.5">{Array.from({ length: 45 }, (_, i) => i + 1).map((n) => (<button key={`m-${n}`} onClick={() => toggleMainNumber(n)} className={`h-11 w-11 rounded-full text-sm font-black transition-all ${mainNumbers.includes(n) ? 'bg-yellow-500 text-black scale-110 shadow-[0_0_20px_rgba(234,179,8,0.4)]' : 'bg-zinc-800/50 text-zinc-500 border border-zinc-700/50'}`}>{n}</button>))}</div>
      </section>

      <section className="w-full max-w-md bg-zinc-900/50 p-6 rounded-3xl border border-red-900/20 mb-10">
        <div className="flex justify-between items-end mb-6 px-1"><h2 className="text-xs font-bold text-red-500/70 uppercase tracking-widest">Spirit Numbers</h2><span className="text-2xl font-black text-red-600 italic">{spiritNumbers.length}<span className="text-zinc-600 text-sm not-italic ml-1">/ 2</span></span></div>
        <div className="grid grid-cols-7 gap-2.5">{Array.from({ length: 45 }, (_, i) => i + 1).map((n) => (<button key={`s-${n}`} onClick={() => toggleSpiritNumber(n)} className={`h-11 w-11 rounded-full text-sm font-black transition-all ${spiritNumbers.includes(n) ? 'bg-red-600 text-white scale-110 shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'bg-zinc-800/50 text-zinc-500 border border-zinc-700/50'}`}>{n}</button>))}</div>
      </section>

      <button onClick={() => setIsModalOpen(true)} disabled={mainNumbers.length !== 8 || spiritNumbers.length !== 2 || !user} className="w-full max-w-md py-5 rounded-2xl font-black text-2xl tracking-[0.3em] mb-16 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black shadow-xl disabled:opacity-50 transition-all">PLAY 1 PI</button>

      {user && (
        <section className="w-full max-w-md mb-16">
          <div className="flex items-center justify-between mb-6 border-b border-zinc-800 pb-3"><h2 className="text-lg font-black text-yellow-500 tracking-widest uppercase italic">My Tickets</h2><span className="text-xs text-zinc-500 font-bold tracking-widest bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">{myTickets.length} ENTRY</span></div>
          <div className="flex flex-col gap-5">
            {myTickets.map((ticket, index) => {
              const drawDate = ticket.drawDate ? new Date(ticket.drawDate) : null;
              const expiryDate = drawDate ? new Date(drawDate.getTime() + 365 * 24 * 60 * 60 * 1000) : null;
              const isExpired = expiryDate && new Date() > expiryDate;

              return (
                <div key={index} className={`bg-zinc-900/80 border rounded-[2rem] p-6 shadow-xl text-center transition-all ${ticket.status === 'WON' ? 'border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.2)]' : ticket.status === 'CLAIMED' ? 'border-green-900' : 'border-zinc-800'}`}>
                  <div className="flex justify-between items-center mb-5 text-center">
                    <span className="text-[9px] font-black text-zinc-600 uppercase text-center">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase text-center ${
                      ticket.status === 'WON' ? 'bg-yellow-500 text-black animate-pulse' : 
                      ticket.status === 'CLAIMED' ? 'bg-green-600 text-white' :
                      ticket.status === 'LOSE' ? 'bg-zinc-800 text-zinc-600' : 'bg-zinc-800 text-yellow-500'
                    }`}>
                      {ticket.status === 'COMPLETED' ? '⌛ Waiting' : isExpired && ticket.status === 'WON' ? 'Expired' : ticket.status}
                    </span>
                  </div>

                  {ticket.status === 'COMPLETED' ? (
                    <div className="bg-zinc-800/40 border border-dashed border-zinc-700 rounded-2xl p-6 mb-5">
                      <p className="text-[10px] text-yellow-500/70 font-black uppercase tracking-[0.2em] mb-2">Ticket Sealed</p>
                      <p className="text-2xl font-black text-white tracking-widest animate-pulse">{getTimeRemaining()}</p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 mb-5 justify-center">
                      {ticket.selectedNumbers.main.map((n: any, i: any) => <span key={i} className={`w-10 h-10 flex items-center justify-center text-xs font-black rounded-full border text-center shadow-lg ${ticket.status === 'WON' ? 'bg-yellow-500 text-black border-yellow-400' : 'bg-zinc-800 text-white border-zinc-700'}`}>{n}</span>)}
                      <div className="w-[1px] h-10 bg-zinc-800 mx-1"></div>
                      {ticket.selectedNumbers.spirit.map((n: any, i: any) => <span key={i} className={`w-10 h-10 flex items-center justify-center text-xs font-black rounded-full border text-center shadow-lg ${ticket.status === 'WON' ? 'bg-red-600 text-white border-red-500' : 'bg-red-900/30 text-red-500 border-red-900/50'}`}>{n}</span>)}
                    </div>
                  )}

                  <div className="pt-4 border-t border-zinc-800/50">
                    {ticket.status === 'WON' && !isExpired ? (
                      <div className="flex flex-col items-center">
                        <p className="text-yellow-500 font-black text-lg mb-3">JACKPOT: {ticket.prize} Pi</p>
                        <button onClick={() => handleClaimPrize(ticket._id)} className="bg-yellow-500 text-black font-black py-3 px-8 rounded-xl uppercase tracking-widest hover:scale-105 transition-all">CLAIM PRIZE</button>
                        <p className="text-[9px] text-zinc-500 mt-3 uppercase font-bold">Expiry: {expiryDate?.toLocaleDateString()}</p>
                      </div>
                    ) : ticket.status === 'CLAIMED' ? (
                      <p className="text-green-500 font-bold italic">▶ Processing payment...</p>
                    ) : (
                      <p className="text-[11px] font-bold italic text-zinc-500">
                        {ticket.status === 'COMPLETED' ? "▶ Your numbers are locked for fairness." : isExpired ? "▶ The claim period has expired." : "▶ Better luck next time."}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <WinnerBoard />

      <div className="w-full max-w-md mt-6">
        <button onClick={handleCheckTickets} disabled={isChecking || myTickets.filter(t => t.status === 'COMPLETED').length === 0} className={`w-full py-5 rounded-2xl font-black text-xl tracking-[0.2em] uppercase transition-all shadow-lg ${isChecking ? 'bg-zinc-800 text-zinc-500' : 'bg-zinc-900 border border-zinc-700 text-white hover:border-yellow-500 hover:text-yellow-500'}`}>
          {isChecking ? 'SCANNING...' : 'CHECK MY TICKETS'}
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex justify-center items-center z-50 p-6">
          <div className="bg-zinc-900 border-2 border-yellow-500/50 p-8 rounded-[2.5rem] w-full max-w-md relative shadow-[0_0_100px_rgba(0,0,0,1)] text-center">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white">✕</button>
            <h2 className="text-3xl font-black text-yellow-500 mb-1 uppercase italic tracking-tighter text-center">Marpo Spirit</h2>
            <p className="text-zinc-500 text-[10px] mb-8 uppercase tracking-[0.3em] text-center">Confirmation</p>
            <div className="bg-zinc-800/50 border border-zinc-800 rounded-2xl p-6 mb-8 text-center"><p className="text-zinc-500 text-[10px] mb-2 uppercase tracking-widest font-bold">Estimated Jackpot</p><p className="text-5xl font-black text-white tracking-tighter">{mockJackpot}</p></div>
            <div className="mb-8 flex flex-wrap justify-center gap-2">
              {mainNumbers.map(n => <span key={n} className="bg-yellow-500 text-black text-xs font-black px-2.5 py-1.5 rounded-lg text-center">{n}</span>)}
              {spiritNumbers.map(n => <span key={n} className="bg-red-600 text-white text-xs font-black px-2.5 py-1.5 rounded-lg text-center">{n}</span>)}
            </div>
            <button onClick={handlePaymentSubmit} disabled={isStoring} className="w-full bg-gradient-to-r from-yellow-500 to-yellow-400 text-black font-black text-xl py-5 rounded-2xl uppercase tracking-widest shadow-lg text-center">{isStoring ? 'STORING...' : 'Confirm & Pay'}</button>
          </div>
        </div>
      )}
    </div>
  );
}