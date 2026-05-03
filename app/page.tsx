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
      if (!response.ok) return;
      const data = await response.json();
      if (data.success) {
        setMyTickets(data.tickets);
      }
    } catch (error) {
      console.error("티켓 목록 로딩 실패");
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
              await fetch('/api/payments/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId: payment.identifier, txid: payment.transaction?.txid || 'cleanup' })
              });
            });
            setUser(auth.user);
            fetchMyTickets(auth.user.username);
          }
        } catch (err) {
          setUser({ username: "OFFLINE_USER" });
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

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`서버 응답 오류 (${response.status}): ${errorText.substring(0, 50)}`);
      }

      const data = await response.json();
      if (data.success) {
        setTimeout(() => alert("MARPO VAULT: 금고 저장 완료! 🏎️💨"), 300);
      } else {
        throw new Error(data.error || "알 수 없는 금고 오류");
      }
    } catch (error: any) {
      setTimeout(() => alert(`🚨 금고 저장 실패!\n원인: ${error.message}\n(MongoDB 연결이나 API 경로를 확인해주세요)`), 300);
    } finally {
      setIsStoring(false);
      setIsModalOpen(false);
      setMainNumbers([]);
      setSpiritNumbers([]);
      if (user?.username) fetchMyTickets(user.username);
    }
  };

  const handlePaymentSubmit = async () => {
    if (isStoring) return;
    setIsStoring(true);

    if (window.location.hostname === 'localhost') {
      await saveTicketToDB("LOCAL_TEST_TXID");
      return;
    }

    try {
      const Pi = (window as any).Pi;
      Pi.createPayment({
        amount: 1, 
        memo: "Marpo Spirit Entry", 
        metadata: { type: "lotto_ticket" }
      }, {
        onReadyForServerApproval: async (paymentId: string) => {
          await fetch('/api/payments/approve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentId }) });
        },
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          try {
            await fetch('/api/payments/complete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentId, txid }) });
          } catch(e) {}
          await saveTicketToDB(txid);
        },
        onCancel: () => {
          setIsStoring(false);
          setIsModalOpen(false);
        },
        onError: (error: Error) => {
          alert(`지갑 에러: ${error.message}`);
          setIsStoring(false);
          setIsModalOpen(false);
        }
      });
    } catch (error: any) {
      setIsStoring(false);
      setIsModalOpen(false);
    }
  };

  // 🚨 신규 추가: 당첨 추첨 엔진 가동 버튼 로직
  const handleSecretDraw = async () => {
    try {
      const res = await fetch('/api/draw', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        // 추첨 완료 후 즉시 화면 갱신
        if (user?.username) fetchMyTickets(user.username);
      } else {
        alert(`🚨 추첨 실패: ${data.message || data.error}`);
      }
    } catch (e) {
      alert("네트워크 통신 에러");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-4 font-sans relative">
      <div className="mt-10 mb-6">
        <Image src="/marpo-group-logo.png" alt="MARPO GROUP" width={180} height={180} priority />
      </div>

      <div className="mb-6 h-6">
        {user ? (
          <p className="text-yellow-500 font-black tracking-widest uppercase">Welcome, @{user.username}</p>
        ) : (
          <p className="text-zinc-600 text-sm tracking-[0.3em] uppercase animate-pulse">Connecting...</p>
        )}
      </div>

      <h1 className="text-4xl font-black tracking-[0.2em] mb-1 text-yellow-500 uppercase italic">Marpo Spirit</h1>
      <p className="text-zinc-500 mb-8 uppercase tracking-[0.4em] text-[10px]">Lottoworld Global Jackpot</p>

      {/* JACKPOT DASHBOARD */}
      <section className="w-full max-w-md bg-gradient-to-b from-zinc-900 to-black p-8 rounded-[2.5rem] border border-yellow-500/30 mb-10 text-center shadow-[0_20px_50px_rgba(234,179,8,0.1)]">
        <p className="text-zinc-500 text-[10px] uppercase tracking-[0.5em] font-black mb-3">Current Accumulated Prize</p>
        <p className="text-6xl font-black text-white tracking-tighter mb-6">{mockJackpot}</p>
        <div className="flex items-center justify-center gap-4 bg-zinc-800/40 py-3 px-6 rounded-2xl border border-zinc-700/30">
          <div className="text-left">
            <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">Next Draw Date</p>
            <p className="text-sm text-yellow-500 font-black uppercase italic">Friday, 20:00 KST</p>
          </div>
          <div className="w-px h-8 bg-zinc-700/50"></div>
          <div className="text-left">
            <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest text-center">Status</p>
            <p className="text-sm text-green-500 font-black uppercase animate-pulse text-center">Open</p>
          </div>
        </div>
      </section>

      {/* Main Selection */}
      <section className="w-full max-w-md bg-zinc-900/50 backdrop-blur-md p-6 rounded-3xl border border-zinc-800 mb-6">
        <div className="flex justify-between items-end mb-6 px-1">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Main Numbers</h2>
          <span className="text-2xl font-black text-yellow-500 italic">{mainNumbers.length}<span className="text-zinc-600 text-sm not-italic ml-1">/ 8</span></span>
        </div>
        <div className="grid grid-cols-7 gap-2.5">
          {Array.from({ length: 45 }, (_, i) => i + 1).map((num) => (
            <button key={`m-${num}`} onClick={() => toggleMainNumber(num)} className={`h-11 w-11 rounded-full text-sm font-black transition-all ${mainNumbers.includes(num) ? 'bg-yellow-500 text-black scale-110 shadow-[0_0_20px_rgba(234,179,8,0.4)]' : 'bg-zinc-800/50 text-zinc-500 border border-zinc-700/50'}`}>{num}</button>
          ))}
        </div>
      </section>

      {/* Spirit Selection */}
      <section className="w-full max-w-md bg-zinc-900/50 backdrop-blur-md p-6 rounded-3xl border border-red-900/20 mb-10">
        <div className="flex justify-between items-end mb-6 px-1">
          <h2 className="text-xs font-bold text-red-500/70 uppercase tracking-widest">Spirit Numbers</h2>
          <span className="text-2xl font-black text-red-600 italic">{spiritNumbers.length}<span className="text-zinc-600 text-sm not-italic ml-1">/ 2</span></span>
        </div>
        <div className="grid grid-cols-7 gap-2.5">
          {Array.from({ length: 45 }, (_, i) => i + 1).map((num) => (
            <button key={`s-${num}`} onClick={() => toggleSpiritNumber(num)} className={`h-11 w-11 rounded-full text-sm font-black transition-all ${spiritNumbers.includes(num) ? 'bg-red-600 text-white scale-110 shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'bg-zinc-800/50 text-zinc-500 border border-zinc-700/50'}`}>{num}</button>
          ))}
        </div>
      </section>

      <button onClick={() => setIsModalOpen(true)} disabled={mainNumbers.length !== 8 || spiritNumbers.length !== 2 || !user} className="w-full max-w-md py-5 rounded-2xl font-black text-2xl tracking-[0.3em] mb-16 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black shadow-xl disabled:opacity-50">PLAY 1 PI</button>

      {/* MY TICKETS */}
      {user && (
        <section className="w-full max-w-md mb-16">
          <div className="flex items-center justify-between mb-6 border-b border-zinc-800 pb-3 text-center">
            <h2 className="text-lg font-black text-yellow-500 tracking-widest uppercase italic text-center">My Tickets</h2>
            
            {/* 🚨 신규 추가: 대표님 전용 SECRET DRAW 버튼 증축 */}
            <div className="flex gap-2 items-center">
              <button onClick={handleSecretDraw} className="text-[10px] bg-red-900/30 text-red-500 border border-red-900 px-3 py-1.5 rounded-full font-black tracking-widest uppercase hover:bg-red-600 hover:text-white transition-all shadow-lg">SECRET DRAW</button>
              <span className="text-xs text-zinc-500 font-bold tracking-widest bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800 text-center">{myTickets.length} ENTRY</span>
            </div>

          </div>
          
          {myTickets.length === 0 ? (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-10 text-center">
              <p className="text-zinc-600 text-sm font-bold tracking-widest uppercase">No tickets found</p>
              <p className="text-zinc-700 text-[10px] mt-2 italic">Start your engine and play!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {myTickets.map((ticket, index) => (
                <div key={index} className="bg-zinc-900/80 border border-zinc-800 rounded-[2rem] p-6 shadow-xl text-center">
                  <div className="flex justify-between items-center mb-5 text-center">
                    <span className="text-[9px] font-black text-zinc-600 uppercase text-center">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase text-center ${
                      ticket.status === 'WON' ? 'bg-yellow-500 text-black animate-pulse' : 
                      ticket.status === 'LOSE' ? 'bg-zinc-800 text-zinc-600' : 'bg-zinc-800 text-yellow-500'
                    }`}>
                      {ticket.status === 'COMPLETED' ? '⌛ Waiting' : ticket.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-5 justify-center">
                    {ticket.selectedNumbers.main.map((n: number, i: number) => <span key={i} className={`w-10 h-10 flex items-center justify-center text-xs font-black rounded-full border text-center shadow-lg ${ticket.status === 'WON' ? 'bg-yellow-500 text-black border-yellow-400' : 'bg-zinc-800 text-white border-zinc-700'}`}>{n}</span>)}
                    <div className="w-[1px] h-10 bg-zinc-800 mx-1"></div>
                    {ticket.selectedNumbers.spirit.map((n: number, i: number) => <span key={i} className={`w-10 h-10 flex items-center justify-center text-xs font-black rounded-full border text-center shadow-lg ${ticket.status === 'WON' ? 'bg-red-600 text-white border-red-500' : 'bg-red-900/30 text-red-500 border-red-900/50'}`}>{n}</span>)}
                  </div>
                  <div className="pt-4 border-t border-zinc-800/50">
                    <p className={`text-[11px] font-bold italic text-center ${ticket.status === 'WON' ? 'text-yellow-500' : 'text-zinc-500'}`}>
                      {ticket.status === 'COMPLETED' ? "▶ 이번 주 추첨 대기 중..." : 
                       ticket.status === 'WON' ? `▶ 축하합니다! 당첨금 ${ticket.prize || '10'} Pi 지급 완료!` : 
                       "▶ 아쉽게도 낙첨되었습니다."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <WinnerBoard />

      {/* 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex justify-center items-center z-50 p-6">
          <div className="bg-zinc-900 border-2 border-yellow-500/50 p-8 rounded-[2.5rem] w-full max-w-md relative shadow-[0_0_100px_rgba(0,0,0,1)] text-center">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white">✕</button>
            <h2 className="text-3xl font-black text-yellow-500 mb-1 uppercase italic tracking-tighter text-center">Marpo Spirit</h2>
            <p className="text-zinc-500 text-[10px] mb-8 uppercase tracking-[0.3em] text-center">Confirmation</p>
            <div className="bg-zinc-800/50 border border-zinc-800 rounded-2xl p-6 mb-8 text-center">
              <p className="text-zinc-500 text-[10px] mb-2 uppercase tracking-widest font-bold text-center">Estimated Jackpot</p>
              <p className="text-5xl font-black text-white tracking-tighter text-center">{mockJackpot}</p>
            </div>
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