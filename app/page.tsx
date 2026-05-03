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
          if ((window as any).Pi) {
            const Pi = (window as any).Pi;
            await Pi.init({ version: "2.0", sandbox: true }); 
            const auth = await Pi.authenticate(['username', 'payments'], onIncompletePaymentFound);
            setUser(auth.user);
            fetchMyTickets(auth.user.username);
          }
        } catch (err) {
          setUser({ username: "OFFLINE_TESTER" });
        }
      };
      initPi();
    }
  }, []);

  // 🚨 K1 긴급 백신: 미완료 찌꺼기를 발견하면 즉시 '완료(complete)' 처리해서 청소합니다!
  const onIncompletePaymentFound = async (payment: any) => {
    console.log("미완료 결제건 발견! 자동 청소 시작:", payment);
    try {
      const res = await fetch('/api/payments/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: payment.identifier,
          txid: payment.transaction?.txid || 'stuck_txid_cleanup'
        })
      });
      const data = await res.json();
      if (!data.error) {
        setTimeout(() => alert("🧹 [시스템] 이전에 멈춰있던 결제 찌꺼기를 성공적으로 청소했습니다! 이제 정상적으로 결제가 가능합니다."), 1000);
      }
    } catch (error) {
      console.error("청소 중 에러:", error);
    }
  };

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

  const handlePlayClick = () => {
    if (mainNumbers.length === 8 && spiritNumbers.length === 2) setIsModalOpen(true);
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
        setTimeout(() => {
          alert("MARPO VAULT: 결제 완료! 티켓이 금고에 안전하게 보관되었습니다! 🏎️💨");
        }, 500);
        setIsModalOpen(false);
        setMainNumbers([]);
        setSpiritNumbers([]);
        if (user?.username) fetchMyTickets(user.username);
      } else {
        setTimeout(() => alert("엔진 오류: 금고 저장 실패"), 500);
      }
    } catch (error) {
      setTimeout(() => alert("네트워크 오류"), 500);
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
      if (!Pi) throw new Error("파이 엔진 없음");

      Pi.createPayment({
        amount: 1, 
        memo: "Marpo Spirit - 1 Entry", 
        metadata: { type: "lotto_ticket" }
      }, {
        onReadyForServerApproval: async (paymentId: string) => {
          try {
            const res = await fetch('/api/payments/approve', { 
              method: 'POST', 
              headers: { 'Content-Type': 'application/json' }, 
              body: JSON.stringify({ paymentId }) 
            });
            const data = await res.json();
            if (data.error) {
              setTimeout(() => alert(`🚨 승인 에러: ${data.error}\n상세: ${data.details || '없음'}`), 500);
            }
          } catch(e: any) { 
            setTimeout(() => alert(`🚨 통신 실패: ${e.message}`), 500);
          }
        },
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          try {
            const res = await fetch('/api/payments/complete', { 
              method: 'POST', 
              headers: { 'Content-Type': 'application/json' }, 
              body: JSON.stringify({ paymentId, txid }) 
            });
            const data = await res.json();
            if (data.error) {
              setTimeout(() => alert(`🚨 완료 에러: ${data.error}`), 500);
            } else {
              await saveTicketToDB(txid);
            }
          } catch(e: any) { 
             setTimeout(() => alert(`🚨 완료 통신 실패: ${e.message}`), 500);
          }
        },
        onCancel: (paymentId: string) => {
          setIsStoring(false);
        },
        onError: (error: Error, payment: any) => {
          setTimeout(() => alert(`지갑 에러: ${error.message}`), 500);
          setIsStoring(false);
        }
      });
    } catch (error: any) {
      setTimeout(() => alert(`결제 시작 실패: ${error.message}`), 500);
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
          <p className="text-yellow-500 font-black tracking-widest uppercase animate-none">
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
        onClick={handlePlayClick}
        disabled={mainNumbers.length !== 8 || spiritNumbers.length !== 2 || !user}
        className={`w-full max-w-md py-5 rounded-2xl font-black text-2xl tracking-[0.3em] mb-16 transition-all duration-500 ${
          mainNumbers.length === 8 && spiritNumbers.length === 2 && user 
            ? 'bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 text-black shadow-[0_10px_50px_rgba(234,179,8,0.4)] cursor-pointer' 
            : 'bg-zinc-800 text-zinc-600 cursor-not-allowed opacity-50'
        }`}
      >
        {user ? 'PLAY 1 PI' : 'INITIALIZING...'}
      </button>

      {/* MY TICKETS SECTION */}
      {user && (
        <section className="w-full max-w-md mb-16">
          <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-2">
            <h2 className="text-lg font-black text-yellow-500 tracking-widest uppercase italic">My Tickets</h2>
            <span className="text-xs text-zinc-500 font-bold tracking-widest bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
              {myTickets.length} ENTRY
            </span>
          </div>
          
          {myTickets.length === 0 ? (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 text-center">
              <p className="text-zinc-600 text-sm font-bold tracking-widest uppercase">No tickets found</p>
              <p className="text-zinc-700 text-xs mt-2">Start your engine and play!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {myTickets.map((ticket, index) => (
                <div key={index} className="bg-gradient-to-r from-zinc-900 to-black border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3 shadow-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-zinc-500 tracking-widest uppercase">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    <span className="text-[10px] font-black text-green-500 bg-green-500/10 px-2 py-1 rounded uppercase tracking-widest">{ticket.status}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {ticket.selectedNumbers.main.map((num: number, i: number) => (
                      <span key={`m-${i}`} className="w-7 h-7 flex items-center justify-center bg-zinc-800 text-zinc-300 text-xs font-black rounded-full border border-zinc-700">{num}</span>
                    ))}
                    <div className="w-px h-7 bg-zinc-700 mx-1"></div>
                    {ticket.selectedNumbers.spirit.map((num: number, i: number) => (
                      <span key={`s-${i}`} className="w-7 h-7 flex items-center justify-center bg-red-900/50 text-red-400 text-xs font-black rounded-full border border-red-900">{num}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <WinnerBoard />

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex justify-center items-center z-50 p-6">
          <div className="bg-zinc-900 border-2 border-yellow-500/50 p-8 rounded-[2.5rem] w-full max-w-md relative shadow-[0_0_100px_rgba(0,0,0,1)]">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <div className="text-center">
              <h2 className="text-3xl font-black text-yellow-500 mb-1 uppercase italic tracking-tighter">Marpo Spirit</h2>
              <p className="text-zinc-500 text-[10px] mb-8 uppercase tracking-[0.3em]">Confirmation</p>
              
              <div className="bg-black border border-zinc-800 rounded-2xl p-6 mb-8">
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