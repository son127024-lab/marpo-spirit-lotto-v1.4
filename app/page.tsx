"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// 🏆 [DB 연동 완료] 공식 당첨 리포트 컴포넌트
const WinningReport = () => {
  // DB에서 불러온 당첨 기록을 저장할 상태 변수
  const [winners, setWinners] = useState<any[]>([]);

  // 화면이 켜질 때 백엔드 API(/api/history)를 통해 당첨 기록을 가져옵니다.
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/history', { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.history) {
            setWinners(data.history);
          }
        }
      } catch (error) {
        console.error("Winner history fetch error", error);
      }
    };
    fetchHistory();
  }, []);

  // 아직 관리자가 등록한 당첨 내역이 없다면 이 섹션을 숨깁니다.
  if (winners.length === 0) return null;

  return (
    <section className="w-full max-w-md mt-16 px-1">
      <h2 className="text-xl font-black text-yellow-500 uppercase italic mb-6 border-b-2 border-zinc-900 pb-2 flex justify-between items-center tracking-tighter">
        Winner's Hall <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Official Report</span>
      </h2>
      <div className="flex flex-col gap-6 text-left">
        {winners.map((w, i) => (
          <div key={i} className="bg-zinc-900/80 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl relative">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xl font-black text-white">{w.draw} <span className="text-[11px] text-zinc-600 ml-2 font-normal">{w.date}</span></span>
            </div>
            <p className="text-[10px] text-zinc-600 font-black uppercase mb-2 tracking-widest">Winning Numbers</p>
            <div className="flex flex-wrap gap-1.5 mb-6">
               {w.numbers?.split(',').map((n: string, idx: number) => (
                 <span key={`w-m-${idx}`} className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800 text-[11px] font-black text-white border border-zinc-700">{n.trim()}</span>
               ))}
               <span className="text-zinc-700 mx-1">|</span>
               {w.spirit?.split(',').map((n: string, idx: number) => (
                 <span key={`w-s-${idx}`} className="w-8 h-8 flex items-center justify-center rounded-full bg-red-900/30 text-[11px] font-black text-red-500 border border-red-900/50">{n.trim()}</span>
               ))}
            </div>
            <div className="grid grid-cols-3 gap-3 border-t border-zinc-800/50 pt-5">
              <div><p className="text-[9px] text-zinc-600 font-black uppercase mb-1">1st Rank</p><p className="text-sm font-black text-white">{w.first} π</p></div>
              <div><p className="text-[9px] text-zinc-600 font-black uppercase mb-1">2nd Rank</p><p className="text-sm font-black text-white">{w.second} π</p></div>
              <div><p className="text-[9px] text-zinc-600 font-black uppercase mb-1">3rd Rank</p><p className="text-sm font-black text-white">{w.third} π</p></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default function MarpoLottoPage() {
  const [user, setUser] = useState<any>(null);
  const [ticketPrice, setTicketPrice] = useState<number>(1.0); 
  const [peggedUsd, setPeggedUsd] = useState<number>(314.159);
  const [jackpot, setJackpot] = useState<number>(0);
  const [mainNumbers, setMainNumbers] = useState<number[]>([]);
  const [spiritNumbers, setSpiritNumbers] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isStoring, setIsStoring] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // 1. API 호출 함수 (독립 선언)
  const fetchMyTickets = useCallback(async (userId: string) => {
    if (!userId) return;
    try {
      const response = await fetch(`/api/tickets?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) setMyTickets(data.tickets);
      }
    } catch (error) { console.error("Ticket fetch error", error); }
  }, []);

  const fetchOracleSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/settings', { cache: 'no-store' });
      if (response.ok) {
        const json = await response.json();
        if (json.success && json.settings) {
          setTicketPrice(Number(Number(json.settings.ticketPricePi).toFixed(5)));
          setPeggedUsd(Number(json.settings.peggedUsd));
          setJackpot(Number(json.settings.realJackpot));
        }
      }
    } catch (error) { console.error("Oracle Sync Fail"); }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (isLocal) {
        const devUser = { username: "MARPO_DEV" };
        setUser(devUser);
        fetchMyTickets(devUser.username);
      } else {
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
          } catch (err) { setUser({ username: "GUEST_USER" }); }
        };
        initPi();
      }
    }
    fetchOracleSettings();
    const oracleTimer = setInterval(fetchOracleSettings, 30000);
    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => { clearInterval(oracleTimer); clearInterval(clockTimer); };
  }, [fetchOracleSettings, fetchMyTickets]);

  const activeTickets = myTickets.filter(t => t.status === 'COMPLETED');
  const historyTickets = myTickets.filter(t => {
    if (t.status === 'COMPLETED') return false;
    const createdDate = new Date(t.createdAt).getTime();
    return (new Date().getTime() - createdDate) < (30 * 24 * 60 * 60 * 1000);
  });

  const getNextDrawDate = () => {
    const nextFriday = new Date();
    nextFriday.setDate(nextFriday.getDate() + (5 - nextFriday.getDay() + 7) % 7);
    nextFriday.setHours(20, 0, 0, 0);
    if (new Date() > nextFriday) nextFriday.setDate(nextFriday.getDate() + 7);
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

  // 🚩 수령 신청 로직 독립 함수화
  const handleClaimPrize = async (ticket: any) => {
    if (!confirm(`당첨금 수령을 신청하시겠습니까?`)) return;
    try {
      const response = await fetch('/api/tickets/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: ticket._id || ticket.id, userId: user?.username })
      });
      if (response.ok) { 
        alert("수령 신청 완료! 관리자에게 전송되었습니다."); 
        if (user?.username) fetchMyTickets(user.username); 
      } else {
        alert("신청 처리 중 오류가 발생했습니다.");
      }
    } catch (error) { 
      alert("서버 통신 오류"); 
    }
  };

  // 🚩 티켓 스캔 로직 독립 함수화
  const handleCheckTickets = async () => {
    setIsChecking(true);
    try { 
      await fetch('/api/draw', { method: 'POST' }); 
      if (user?.username) {
        fetchMyTickets(user.username); 
      }
    } catch (error) { 
      console.error("Check tickets error:", error); 
    } finally { 
      setIsChecking(false); 
    }
  };

  // 🚩 결제 처리 로직 독립 함수화
  const handlePaymentSubmit = async () => {
    if (isStoring) return; 
    setIsStoring(true);
    try {
      const safeAmount = Number(ticketPrice.toFixed(5));
      const Pi = typeof window !== 'undefined' ? (window as any).Pi : null;

      if (!Pi || window.location.hostname === 'localhost') {
        const resTest = await fetch('/api/tickets', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ numbers: { main: mainNumbers, spirit: spiritNumbers }, userId: user?.username, amount: safeAmount, transactionId: "DEV_" + Date.now() }) 
        });
        if (resTest.ok) { 
          alert("Ticket Sealed! 🏎️💨"); 
          if (user?.username) fetchMyTickets(user.username); 
        }
      } else {
        await Pi.createPayment({ amount: safeAmount, memo: "Marpo Spirit Entry", metadata: { type: "lotto_ticket" } }, {
          onReadyForServerApproval: (pid: string) => fetch('/api/payments/approve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentId: pid }) }),
          onReadyForServerCompletion: async (pid: string, txid: string) => {
            await fetch('/api/payments/complete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentId: pid, txid }) });
            const resReal = await fetch('/api/tickets', { 
              method: 'POST', 
              headers: { 'Content-Type': 'application/json' }, 
              body: JSON.stringify({ numbers: { main: mainNumbers, spirit: spiritNumbers }, userId: user?.username, amount: safeAmount, transactionId: txid }) 
            });
            if (resReal.ok) { 
              alert("Ticket Sealed! 🏎️💨"); 
              if (user?.username) fetchMyTickets(user.username); 
            }
          },
          onCancel: () => setIsStoring(false),
          onError: (error: Error) => { setIsStoring(false); console.error(error); }
        });
      }
    } catch (error) { 
      console.error(error); 
    } finally { 
      setIsStoring(false); 
      setIsModalOpen(false); 
      setMainNumbers([]); 
      setSpiritNumbers([]); 
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-4 font-sans relative pb-40 text-center">
      
      {/* 🚀 헤더 섹션 유지 */}
      <div className="w-full max-w-md flex flex-col items-center pt-8 mb-10">
        <Image src="/marpo-group-logo.png" alt="MARPO GROUP" width={170} height={170} priority />
        <p className="text-yellow-500 font-black text-2xl uppercase tracking-tighter italic mt-5">Marpo Spirit</p>
        <div className="mt-3 px-5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full">
          <p className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase">ID: <span className="text-yellow-500">{user?.username || "CONNECTING..."}</span></p>
        </div>
      </div>

      <section className="w-full max-w-md bg-zinc-900 border border-yellow-500/20 p-8 rounded-[2.5rem] mb-12 shadow-2xl relative overflow-hidden">
          <p className="text-zinc-500 text-xs font-black uppercase tracking-[0.4em] mb-3">Live Jackpot Pool</p>
          <p className="text-5xl font-black text-white tracking-tighter mb-8">{jackpot.toLocaleString(undefined, {minimumFractionDigits: 4})} <span className="text-xl text-zinc-600 font-normal">π</span></p>
          <div className="pt-6 border-t border-zinc-800/80 flex justify-between items-end px-1">
            <div className="text-left"><span className="text-[9px] text-zinc-600 font-black uppercase block mb-1">Oracle Price</span><span className="text-xs text-zinc-300 font-bold uppercase tracking-tighter">1 Pi Value</span></div>
            <div className="text-right"><p className="text-xl font-black text-white tracking-tight leading-none">$ {peggedUsd.toLocaleString(undefined, {minimumFractionDigits: 3})} <span className="text-[10px] text-zinc-500 ml-1.5 font-bold uppercase">usd</span></p></div>
          </div>
      </section>

      {/* 🚀 번호 선택 섹션 유지 */}
      <section className="w-full max-w-md mb-14">
        <div className="flex justify-between items-center mb-4 px-1">
          <p className="text-sm font-black text-zinc-500 uppercase tracking-widest italic">Main Numbers</p>
          <span className="text-lg font-black text-yellow-500">{mainNumbers.length} / 8</span>
        </div>
        <div className="grid grid-cols-7 gap-2 mb-10">
          {Array.from({ length: 45 }, (_, i) => i + 1).map((n) => (
            <button key={`m-${n}`} onClick={() => {
                if (mainNumbers.includes(n)) setMainNumbers(mainNumbers.filter(x => x !== n));
                else if (mainNumbers.length < 8) setMainNumbers([...mainNumbers, n].sort((a,b)=>a-b));
            }} className={`h-11 w-11 rounded-full text-sm font-black border transition-all active:scale-95 ${mainNumbers.includes(n) ? 'bg-yellow-500 text-black border-yellow-500 shadow-lg scale-110' : 'bg-zinc-800 text-zinc-500 border-zinc-700 hover:border-zinc-500'}`}>{n}</button>
          ))}
        </div>
        
        <div className="flex justify-between items-center mb-4 px-1">
          <p className="text-sm font-black text-red-500 uppercase tracking-widest italic">Spirit Numbers</p>
          <span className="text-lg font-black text-red-500">{spiritNumbers.length} / 2</span>
        </div>
        <div className="grid grid-cols-7 gap-2 mb-10">
          {Array.from({ length: 45 }, (_, i) => i + 1).map((n) => (
            <button key={`s-${n}`} onClick={() => {
                if (spiritNumbers.includes(n)) setSpiritNumbers(spiritNumbers.filter(x => x !== n));
                else if (spiritNumbers.length < 2) setSpiritNumbers([...spiritNumbers, n].sort((a,b)=>a-b));
            }} className={`h-11 w-11 rounded-full text-sm font-black border transition-all active:scale-95 ${spiritNumbers.includes(n) ? 'bg-red-600 text-white border-red-600 shadow-lg scale-110' : 'bg-zinc-800 text-zinc-500 border-zinc-700 hover:border-zinc-500'}`}>{n}</button>
          ))}
        </div>
      </section>

      <button onClick={() => setIsModalOpen(true)} disabled={mainNumbers.length !== 8 || spiritNumbers.length !== 2 || !user} className="w-full max-w-md py-7 rounded-[2rem] font-black text-2xl mb-14 bg-gradient-to-r from-yellow-600 to-yellow-400 text-black shadow-xl disabled:opacity-20 uppercase tracking-widest active:scale-95 transition-transform">
        PLAY <span className="text-lg ml-2">{ticketPrice.toFixed(5)} π</span>
      </button>

      {/* 🚀 Active 및 History 섹션 유지 (번호 우측 상태표시 포함) */}
      {user && (
        <section className="w-full max-w-md mb-8 text-left px-1">
          <h2 className="text-xl font-black text-yellow-500 uppercase italic mb-6 border-b border-zinc-900 pb-2">My Active Tickets</h2>
          
          {activeTickets.length > 0 ? (
            <div className="flex flex-col gap-4">
              {activeTickets.map((t, i) => (
                <div key={`active-${i}`} className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 text-center shadow-xl">
                  <p className="text-[10px] text-yellow-500 font-black uppercase mb-3 animate-pulse tracking-[0.2em]">● Draw Countdown</p>
                  <p className="text-4xl font-black text-white tracking-widest mb-6">{getTimeRemaining()}</p>
                  <div className="flex flex-wrap gap-1.5 justify-center pt-4 border-t border-zinc-800/50">
                    {t.selectedNumbers?.main?.map((n:number, idx:number) => <span key={`am-${idx}`} className="w-7 h-7 flex items-center justify-center rounded-full bg-zinc-800 text-[10px] font-black text-white">{n}</span>)}
                    <span className="text-zinc-700 mx-1">|</span>
                    {t.selectedNumbers?.spirit?.map((n:number, idx:number) => <span key={`as-${idx}`} className="w-7 h-7 flex items-center justify-center rounded-full bg-red-900/30 text-[10px] font-black text-red-500 border border-red-900/50">{n}</span>)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-700 font-bold text-center py-6 uppercase tracking-widest text-xs italic">No tickets in this draw</p>
          )}

          {historyTickets.length > 0 && (
            <div className="mt-10">
              <button onClick={() => setShowHistory(!showHistory)} className="w-full py-5 border border-zinc-800 rounded-2xl text-zinc-600 font-black text-[11px] uppercase tracking-[0.3em] hover:text-zinc-300 transition-colors">
                {showHistory ? '▲ Hide My Records' : '▼ View My Records (Status)'}
              </button>
              {showHistory && (
                <div className="mt-8 flex flex-col gap-6">
                  {historyTickets.map((t, i) => {
                    const isWinner = t.status === 'WON';
                    const isClaimed = t.status === 'CLAIMED';

                    return (
                        <div key={`hist-${i}`} className={`bg-zinc-900 border rounded-[2rem] p-6 transition-all flex flex-col gap-4 ${isWinner ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'border-zinc-800 opacity-70'}`}>
                            <div className="text-left">
                                <span className="text-[11px] text-zinc-500 font-black tracking-widest">{new Date(t.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex flex-wrap gap-1.5 flex-1">
                                    {t.selectedNumbers?.main?.map((n:number, j:number) => (
                                        <span key={`hm-${j}`} className="w-7 h-7 flex items-center justify-center bg-black border border-zinc-800 rounded-full text-[10px] font-black text-zinc-300">{n}</span>
                                    ))}
                                </div>
                                <div className="flex-shrink-0 ml-3 text-right flex flex-col items-end justify-center min-h-[30px]">
                                    {isWinner ? (
                                        <button onClick={() => handleClaimPrize(t)} className="bg-yellow-500 text-black font-black text-[10px] px-3 py-2 rounded-xl uppercase active:scale-95 transition-transform animate-pulse shadow-md whitespace-nowrap">
                                            🎁 CLAIM
                                        </button>
                                    ) : isClaimed ? (
                                        <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest">CLAIMED</span>
                                    ) : (
                                        <span className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">FINISHED</span>
                                    )}
                                </div>
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

      {/* 🚀 당첨 리포트 (DB 연동) */}
      <WinningReport />

      <div className="w-full max-w-md mt-16 mb-16">
        <button 
          onClick={handleCheckTickets} 
          disabled={isChecking || myTickets.length === 0} 
          className="w-full py-8 rounded-[2rem] font-black text-xl border-2 border-zinc-800 text-zinc-600 uppercase tracking-widest hover:border-yellow-500 hover:text-white transition-all active:scale-95"
        >
          {isChecking ? 'SCANNING...' : 'CHECK MY TICKETS'}
        </button>
      </div>

      <div className="w-full max-w-md flex justify-center pb-10">
         <Link href="/whitepaper" className="flex flex-col items-center gap-2 opacity-40 hover:opacity-100 transition-opacity">
            <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center shadow-lg"><span className="text-white font-black text-xl italic">W</span></div>
            <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Whitepaper</span>
         </Link>
      </div>

      {/* 🚀 결제 모달 유지 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex justify-center items-center z-50 p-6 text-center">
          <div className="bg-zinc-900 border-2 border-yellow-500/30 p-10 rounded-[3rem] w-full max-w-md relative shadow-2xl">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-zinc-500 text-2xl">✕</button>
            <h2 className="text-3xl font-black text-yellow-500 mb-10 uppercase italic tracking-tighter">Confirm Entry</h2>
            <div className="bg-black border border-zinc-800 rounded-3xl p-8 mb-10 text-center">
              <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mb-2">Total Price</p>
              <p className="text-4xl font-black text-white">{ticketPrice.toFixed(5)} <span className="text-lg text-zinc-500 ml-1">π</span></p>
            </div>
            <button 
              onClick={handlePaymentSubmit} 
              className="w-full bg-yellow-500 text-black font-black text-2xl py-6 rounded-2xl uppercase shadow-lg active:scale-95 transition-transform"
            >
              {isStoring ? 'STORING...' : 'PAY NOW'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}