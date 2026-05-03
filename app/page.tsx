"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import WinnerBoard from '../components/WinnerBoard';

export default function MarpoLottoPage() {
  const [user, setUser] = useState<any>(null);
  const [mainNumbers, setMainNumbers] = useState<number[]>([]);
  const [spiritNumbers, setSpiritNumbers] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStoring, setIsStoring] = useState(false);
  const [myTickets, setMyTickets] = useState<any[]>([]);
  
  const mockJackpot = "15,420 Pi";

  const fetchMyTickets = async (userId: string) => {
    try {
      const response = await fetch(`/api/tickets?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setMyTickets(data.tickets);
      }
    } catch (error) {
      console.error("티켓 불러오기 실패:", error);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      if (isLocalhost) {
        setTimeout(() => {
          const mockUser = { username: "MARPO_LOCAL_DEV" };
          setUser(mockUser);
          fetchMyTickets(mockUser.username); 
        }, 500);
        return; 
      }

      const initPi = async () => {
        try {
          // 🚨 파이 엔진 강제 소환 로직
          if (!(window as any).Pi) {
            const script = document.createElement('script');
            script.src = "https://sdk.minepi.com/pi-sdk.js";
            document.head.appendChild(script);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }

          if ((window as any).Pi) {
            const Pi = (window as any).Pi;
            await Pi.init({ version: "2.0", sandbox: true }); 
            
            const auth = await Pi.authenticate(['username', 'payments'], async (payment: any) => {
              try {
                await fetch('/api/payments/complete', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    paymentId: payment.identifier,
                    txid: payment.transaction?.txid || 'cleanup'
                  })
                });
              } catch (e) {
                console.error("찌꺼기 청소 에러");
              }
            });
            
            setUser(auth.user);
            fetchMyTickets(auth.user.username);
          } else {
            throw new Error("파이 엔진 로드 실패");
          }
        } catch (err) {
          console.error(err);
          setUser({ username: "OUTSIDE_PI_BROWSER" });
        }
      };
      
      initPi();
    }
  }, []);

  const toggleMainNumber = (num: number) => {
    if (mainNumbers.includes(num)) {
      setMainNumbers(mainNumbers.filter(n => n !== num));
    } else if (mainNumbers.length < 8) {
      setMainNumbers([...mainNumbers, num].sort((a, b) => a - b));
    }
  };

  const toggleSpiritNumber = (num: number) => {
    if (spiritNumbers.includes(num)) {
      setSpiritNumbers(spiritNumbers.filter(n => n !== num));
    } else if (spiritNumbers.length < 2) {
      setSpiritNumbers([...spiritNumbers, num].sort((a, b) => a - b));
    }
  };

  const saveTicketToDB = async (txid: string) => {
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numbers: { main: mainNumbers, spirit: spiritNumbers },
          userId: user?.username || "Guest_User",
          amount: 1,
          transactionId: txid 
        }),
      });

      const data = await response.json();
      if (data.success) {
        setTimeout(() => alert("MARPO VAULT: 티켓이 보관되었습니다! 🏎️💨"), 500);
        setIsModalOpen(false);
        setMainNumbers([]);
        setSpiritNumbers([]);
        if (user?.username) fetchMyTickets(user.username);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsStoring(false);
    }
  };

  const handlePaymentSubmit = async () => {
    if (isStoring) return;
    setIsStoring(true);

    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocalhost) {
      await saveTicketToDB("LOCAL_TEST_TXID");
      return;
    }

    try {
      const Pi = (window as any).Pi;
      Pi.createPayment({
        amount: 1, 
        memo: "Marpo Spirit - 1 Entry", 
        metadata: { type: "lotto_ticket" }
      }, {
        onReadyForServerApproval: async (paymentId: string) => {
          await fetch('/api/payments/approve', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ paymentId }) 
          });
        },
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          await fetch('/api/payments/complete', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ paymentId, txid }) 
          });
          await saveTicketToDB(txid);
        },
        onCancel: () => setIsStoring(false),
        onError: (error: Error) => {
          alert(`에러: ${error.message}`);
          setIsStoring(false);
        }
      });
    } catch (error: any) {
      setIsStoring(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-4 font-sans relative">
      <div className="mt-10 mb-6">
        <Image src="/marpo-group-logo.png" alt="MARPO GROUP" width={180} height={180} priority />
      </div>

      <div className="mb-6 h-6">
        {user ? (
          <p className="text-yellow-500 font-black tracking-widest uppercase">
            Welcome, @{user.username}
          </p>
        ) : (
          <p className="text-zinc-600 text-sm tracking-[0.3em] uppercase animate-pulse">Connecting...</p>
        )}
      </div>

      <h1 className="text-4xl font-black tracking-[0.2em] mb-1 text-yellow-500 uppercase italic text-center">Marpo Spirit</h1>
      <p className="text-zinc-500 mb-8 uppercase tracking-[0.4em] text-[10px] text-center">Lottoworld Global Jackpot</p>

      {/* JACKPOT DASHBOARD */}
      <section className="w-full max-w-md bg-gradient-to-b from-zinc-900 to-black p-8 rounded-[2.5rem] border border-yellow-500/30 mb-10 text-center shadow-[0_20px_50px_rgba(234,179,8,0.1)]">
        <p className="text-zinc-500 text-[10px] uppercase tracking-[0.5em] font-black mb-3 text-center">Current Prize</p>
        <p className="text-6xl font-black text-white tracking-tighter mb-6">{mockJackpot}</p>
        <div className="flex items-center justify-center gap-4 bg-zinc-800/40 py-3 px-6 rounded-2xl border border-zinc-700/30">
          <div className="text-left">
            <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">Next Draw</p>
            <p className="text-sm text-yellow-500 font-black uppercase italic text-center">Friday 20:00</p>
          </div>
          <div className="w-px h-8 bg-zinc-700/50"></div>
          <div className="text-left">
            <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest text-center">Status</p>
            <p className="text-sm text-green-500 font-black uppercase animate-pulse text-center">Open</p>
          </div>
        </div>
      </section>

      {/* Numbers Selection */}
      <section className="w-full max-w-md bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800 mb-6">
        <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6">Main ({mainNumbers.length}/8)</h2>
        <div className="grid grid-cols-7 gap-2.5">
          {Array.from({ length: 45 }, (_, i) => i + 1).map((num) => (
            <button key={`main-${num}`} onClick={() => toggleMainNumber(num)} className={`h-11 w-11 rounded-full text-sm font-black transition-all ${mainNumbers.includes(num) ? 'bg-yellow-500 text-black scale-110' : 'bg-zinc-800/50 text-zinc-500 border border-zinc-700/50'}`}>{num}</button>
          ))}
        </div>
      </section>

      <section className="w-full max-w-md bg-zinc-900/50 p-6 rounded-3xl border border-red-900/20 mb-10">
        <h2 className="text-xs font-bold text-red-500/70 uppercase tracking-widest mb-6">Spirit ({spiritNumbers.length}/2)</h2>
        <div className="grid grid-cols-7 gap-2.5">
          {Array.from({ length: 45 }, (_, i) => i + 1).map((num) => (
            <button key={`spirit-${num}`} onClick={() => toggleSpiritNumber(num)} className={`h-11 w-11 rounded-full text-sm font-black transition-all ${spiritNumbers.includes(num) ? 'bg-red-600 text-white scale-110' : 'bg-zinc-800/50 text-zinc-500 border border-zinc-700/50'}`}>{num}</button>
          ))}
        </div>
      </section>

      <button onClick={() => setIsModalOpen(true)} disabled={mainNumbers.length !== 8 || spiritNumbers.length !== 2} className="w-full max-w-md py-5 rounded-2xl font-black text-2xl tracking-[0.3em] mb-16 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black disabled:opacity-50">PLAY 1 PI</button>

      {/* MY TICKETS */}
      <section className="w-full max-w-md mb-16">
        <h2 className="text-lg font-black text-yellow-500 tracking-widest uppercase italic border-b border-zinc-800 pb-3 mb-6 text-center">My Tickets</h2>
        <div className="flex flex-col gap-5 text-center">
          {myTickets.length === 0 ? <p className="text-zinc-600 uppercase text-xs text-center font-bold">No tickets found</p> : 
            myTickets.map((ticket, index) => (
            <div key={index} className="bg-zinc-900/80 border border-zinc-800 rounded-[2rem] p-6 text-center">
              <div className="flex justify-between items-center mb-5 text-center">
                <span className="text-[9px] font-black text-zinc-600 uppercase text-center">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                <span className="text-[10px] font-black px-4 py-1.5 rounded-full uppercase bg-zinc-800 text-yellow-500 text-center">{ticket.status === 'COMPLETED' ? '⌛ Waiting' : ticket.status}</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-5 justify-center">
                {ticket.selectedNumbers.main.map((n: any, i: any) => <span key={i} className="w-10 h-10 flex items-center justify-center bg-zinc-800 text-white text-xs font-black rounded-full border border-zinc-700 text-center">{n}</span>)}
                <div className="w-[1px] h-10 bg-zinc-800 mx-1"></div>
                {ticket.selectedNumbers.spirit.map((n: any, i: any) => <span key={i} className="w-10 h-10 flex items-center justify-center bg-red-900/30 text-red-500 text-xs font-black rounded-full border border-red-900/50 text-center">{n}</span>)}
              </div>
            </div>
          ))}
        </div>
      </section>

      <WinnerBoard />

      {/* 결제 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/95 flex justify-center items-center z-50 p-6">
          <div className="bg-zinc-900 border-2 border-yellow-500/50 p-8 rounded-[2.5rem] w-full max-w-md text-center">
            <h2 className="text-3xl font-black text-yellow-500 mb-8 uppercase italic text-center">Confirm Pay</h2>
            <div className="mb-8 flex flex-wrap justify-center gap-2">
              {mainNumbers.map(n => <span key={n} className="bg-yellow-500 text-black text-xs font-black px-2 py-1 rounded text-center">{n}</span>)}
              {spiritNumbers.map(n => <span key={n} className="bg-red-600 text-white text-xs font-black px-2 py-1 rounded text-center">{n}</span>)}
            </div>
            <button onClick={handlePaymentSubmit} disabled={isStoring} className="w-full bg-yellow-500 text-black font-black py-4 rounded-xl text-center uppercase tracking-widest">{isStoring ? 'STORING...' : 'Pay 1 Pi'}</button>
            <button onClick={() => setIsModalOpen(false)} className="mt-4 text-zinc-500 text-xs font-bold text-center uppercase">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}