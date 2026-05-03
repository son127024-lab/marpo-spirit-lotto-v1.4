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
      const text = await response.text(); 
      try {
        const data = JSON.parse(text); 
        if (data.success) {
          setMyTickets(data.tickets);
        }
      } catch (parseError) {
        console.error("API 에러");
      }
    } catch (error) {
      console.error(error);
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

  // 🚨 완벽 수정 1: 어떤 에러가 나더라도 무조건 창을 닫고 티켓을 새로고침하는 '강제 실행(finally)' 로직
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
        setTimeout(() => alert("MARPO VAULT: 결제 완료! 티켓이 금고에 안전하게 보관되었습니다! 🏎️💨"), 300);
      } else {
        setTimeout(() => alert("결제는 성공했으나 금고 저장에 실패했습니다."), 300);
      }
    } catch (error) {
      setTimeout(() => alert("네트워크 오류로 금고와 연결이 끊겼습니다."), 300);
    } finally {
      // ✅ 서버 응답에 상관없이 무조건 실행되어 창을 닫고 번호를 비워줍니다.
      setIsStoring(false);
      setIsModalOpen(false);
      setMainNumbers([]);
      setSpiritNumbers([]);
      if (user?.username) {
        // 창이 닫히자마자 티켓 목록을 다시 불러와 하단에 표시합니다.
        setTimeout(() => fetchMyTickets(user.username), 1000);
      }
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
          try {
            await fetch('/api/payments/approve', { 
              method: 'POST', 
              headers: { 'Content-Type': 'application/json' }, 
              body: JSON.stringify({ paymentId }) 
            });
          } catch(e) { console.error(e); }
        },
        // 🚨 완벽 수정 2: 서버 완료 신호가 실패해도(catch) 금고 저장은 무조건 시도하도록 방어막 설치
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          try {
            await fetch('/api/payments/complete', { 
              method: 'POST', 
              headers: { 'Content-Type': 'application/json' }, 
              body: JSON.stringify({ paymentId, txid }) 
            });
          } catch(e) {
            console.error(e);
          } finally {
            // 통신 에러가 나도 코드가 기절하지 않고 티켓 저장 및 모달 닫기를 수행합니다.
            await saveTicketToDB(txid);
          }
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
      alert(`결제 시작 에러: ${error.message}`);
      setIsStoring(false);
      setIsModalOpen(false);
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

      <h1 className="text-4xl font-black tracking-[0.2em] mb-1 text-yellow-500 uppercase italic">Marpo Spirit</h1>
      <p className="text-zinc-500 mb-8 uppercase tracking-[0.4em] text-[10px]">Lottoworld Global Jackpot</p>

      {/* JACKPOT DASHBOARD */}
      <section className="w-full max-w-md bg-gradient-to-b from-zinc-900 to-black p-8 rounded-[2.5rem] border border-yellow-500/30 mb-10 text-center shadow-[0_20px_50px_rgba(234,179,8,0.1)]">
        <p className="text-zinc-500 text-[10px] uppercase tracking-[0.5em] font-black mb-3">Current Accumulated Prize</p>
        <div className="relative inline-block">
          <p className="text-6xl font-black text-white tracking-tighter mb-6 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            {mockJackpot}
          </p>
        </div>
        
        <div className="flex items-center justify-center gap-4 bg-zinc-800/40 py-3 px-6 rounded-2xl border border-zinc-700/30">
          <div className="text-left">
            <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">Next Draw Date</p>
            <p className="text-sm text-yellow-500 font-black uppercase italic">Friday, 20:00 KST</p>
          </div>
          <div className="w-px h-8 bg-zinc-700/50"></div>
          <div className="text-left">
            <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">Status</p>
            <p className="text-sm text-green-500 font-black uppercase animate-pulse">Open</p>
          </div>
        </div>
      </section>

      {/* Main Numbers */}
      <section className="w-full max-w-md bg-zinc-900/50 backdrop-blur-md p-6 rounded-3xl border border-zinc-800 mb-6">
        <div className="flex justify-between items-end mb-6 px-1">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Main Numbers</h2>
          <span className="text-2xl font-black text-yellow-500 italic">{mainNumbers.length}<span className="text-zinc-600 text-sm not-italic ml-1">/ 8</span></span>
        </div>
        <div className="grid grid-cols-7 gap-2.5">
          {Array.from({ length: 45 }, (_, i) => i + 1).map((num) => (
            <button
              key={`main-${num}`}
              onClick={() => toggleMainNumber(num)}
              className={`h-11 w-11 rounded-full text-sm font-black transition-all duration-300 ${
                mainNumbers.includes(num) ? 'bg-yellow-500 text-black scale-110 shadow-[0_0_20px_rgba(234,179,8,0.6)]' : 'bg-zinc-800/50 text-zinc-500 border border-zinc-700/50'
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </section>

      {/* Spirit Numbers */}
      <section className="w-full max-w-md bg-zinc-900/50 backdrop-blur-md p-6 rounded-3xl border border-red-900/20 mb-10">
        <div className="flex justify-between items-end mb-6 px-1">
          <h2 className="text-xs font-bold text-red-500/70 uppercase tracking-widest">Spirit Numbers</h2>
          <span className="text-2xl font-black text-red-600 italic">{spiritNumbers.length}<span className="text-zinc-600 text-sm not-italic ml-1">/ 2</span></span>
        </div>
        <div className="grid grid-cols-7 gap-2.5">
          {Array.from({ length: 45 }, (_, i) => i + 1).map((num) => (
            <button
              key={`spirit-${num}`}
              onClick={() => toggleSpiritNumber(num)}
              className={`h-11 w-11 rounded-full text-sm font-black transition-all duration-300 ${
                spiritNumbers.includes(num) ? 'bg-red-600 text-white scale-110 shadow-[0_0_25px_rgba(220,38,38,0.6)]' : 'bg-zinc-800/50 text-zinc-500 border border-zinc-700/50'
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </section>

      {/* PLAY Button */}
      <button 
        onClick={() => setIsModalOpen(true)}
        disabled={mainNumbers.length !== 8 || spiritNumbers.length !== 2 || !user}
        className={`w-full max-w-md py-5 rounded-2xl font-black text-2xl tracking-[0.3em] mb-16 transition-all duration-500 ${
          mainNumbers.length === 8 && spiritNumbers.length === 2 && user 
            ? 'bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 text-black shadow-[0_10px_50px_rgba(234,179,8,0.4)] cursor-pointer' 
            : 'bg-zinc-800 text-zinc-600 cursor-not-allowed opacity-50'
        }`}
      >
        {user ? 'PLAY 1 PI' : 'INITIALIZING...'}
      </button>

      {/* MY TICKETS SECTION (원본 UI 완벽 복구) */}
      {user && (
        <section className="w-full max-w-md mb-16">
          <div className="flex items-center justify-between mb-6 border-b border-zinc-800 pb-3">
            <h2 className="text-lg font-black text-yellow-500 tracking-widest uppercase italic">My Tickets</h2>
            <span className="text-xs text-zinc-500 font-bold tracking-widest bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
              {myTickets.length} ENTRY
            </span>
          </div>
          
          {myTickets.length === 0 ? (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-10 text-center">
              <p className="text-zinc-600 text-sm font-bold tracking-widest uppercase">No tickets found</p>
              <p className="text-zinc-700 text-[10px] mt-2 italic">Start your engine and play!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {myTickets.map((ticket, index) => (
                <div key={index} className="bg-zinc-900/80 border border-zinc-800 rounded-[2rem] p-6 shadow-xl relative overflow-hidden group hover:border-yellow-500/30 transition-all">
                  <div className="flex justify-between items-center mb-5">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-zinc-600 tracking-widest uppercase">Purchase Date</span>
                      <span className="text-xs font-bold text-zinc-300">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${
                      ticket.status === 'WON' ? 'bg-yellow-500 text-black' : 
                      ticket.status === 'LOSE' ? 'bg-zinc-800 text-zinc-600' : 'bg-zinc-800 text-yellow-500'
                    }`}>
                      {ticket.status === 'COMPLETED' ? '⌛ Waiting' : ticket.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-5">
                    {ticket.selectedNumbers.main.map((num: number, i: number) => (
                      <span key={i} className="w-10 h-10 flex items-center justify-center bg-zinc-800 text-zinc-200 text-xs font-black rounded-full border border-zinc-700 shadow-lg">{num}</span>
                    ))}
                    <div className="w-[1px] h-10 bg-zinc-800 mx-1"></div>
                    {ticket.selectedNumbers.spirit.map((num: number, i: number) => (
                      <span key={i} className="w-10 h-10 flex items-center justify-center bg-red-900/30 text-red-500 text-xs font-black rounded-full border border-red-900/50">{num}</span>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-zinc-800/50">
                    <p className="text-[11px] font-bold italic text-zinc-500">
                      {ticket.status === 'COMPLETED' ? ">> 이번 주 금요일 20:00(KST) 추첨 대기 중..." : 
                       ticket.status === 'WON' ? `>> 축하합니다! ${ticket.prize || '10'} Pi 당첨!` : 
                       ">> 아쉽게도 낙첨되었습니다. 다음 기회에!"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <WinnerBoard />

      {/* 결제 모달 (원본 UI 완벽 복구) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex justify-center items-center z-50 p-6">
          <div className="bg-zinc-900 border-2 border-yellow-500/50 p-8 rounded-[2.5rem] w-full max-w-md relative shadow-[0_0_100px_rgba(0,0,0,1)]">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <div className="text-center">
              <h2 className="text-3xl font-black text-yellow-500 mb-1 uppercase italic tracking-tighter">Marpo Spirit</h2>
              <p className="text-zinc-500 text-[10px] mb-8 uppercase tracking-[0.3em]">Confirmation</p>
              
              <div className="bg-zinc-800/50 border border-zinc-800 rounded-2xl p-6 mb-8">
                <p className="text-zinc-500 text-[10px] mb-2 uppercase tracking-widest font-bold">Estimated Jackpot</p>
                <p className="text-5xl font-black text-white tracking-tighter">{mockJackpot}</p>
              </div>

              <div className="mb-8">
                <div className="flex flex-wrap justify-center gap-2 mb-3">
                  {mainNumbers.map(num => <span key={num} className="bg-yellow-500 text-black text-xs font-black px-2.5 py-1.5 rounded-lg">{num}</span>)}
                </div>
                <div className="flex justify-center gap-2">
                  {spiritNumbers.map(num => <span key={num} className="bg-red-600 text-white text-xs font-black px-2.5 py-1.5 rounded-lg">{num}</span>)}
                </div>
              </div>

              <button 
                onClick={handlePaymentSubmit} 
                disabled={isStoring}
                className={`w-full bg-gradient-to-r from-yellow-500 to-yellow-400 text-black font-black text-xl py-5 rounded-2xl uppercase tracking-widest shadow-lg ${isStoring ? 'opacity-50 cursor-wait' : ''}`}
              >
                {isStoring ? 'STORING...' : 'Confirm & Pay'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}