"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import WinnerBoard from '../components/WinnerBoard';

export default function MarpoLottoPage() {
  // 1. 상태 변수 설정
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

  // 2. 오라클 동기화 함수 (에러 방어 로직 강화)
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
    } catch (e) {
      console.error("Oracle sync fail - keeping previous data.");
    }
  }, []);

  // 3. 티켓 데이터 호출 함수
  const fetchMyTickets = useCallback(async (userId: string) => {
    if (!userId) return;
    try {
      const response = await fetch(`/api/tickets?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) setMyTickets(data.tickets);
      }
    } catch (error) {
      console.error("Ticket fetch error:", error);
    }
  }, []);

  // 4. 초기화 및 사용자 인증 (로컬/실서버 완벽 분리)
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
                await fetch('/api/payments/complete', { 
                  method: 'POST', 
                  headers: { 'Content-Type': 'application/json' }, 
                  body: JSON.stringify({ paymentId: p.identifier, txid: p.transaction?.txid || 'cleanup' }) 
                });
              });
              setUser(auth.user);
              fetchMyTickets(auth.user.username);
            }
          } catch (err) {
            setUser({ username: "GUEST_MARPO" });
          }
        };
        initPi();
      }
    }
    
    fetchOracleSettings();
    const oracleTimer = setInterval(fetchOracleSettings, 30000);
    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    return () => { clearInterval(oracleTimer); clearInterval(clockTimer); };
  }, [fetchOracleSettings, fetchMyTickets]);

  // 5. 티켓 필터링 및 시간 계산
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

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-4 font-sans relative pb-32 text-center">
      
      {/* 🚀 상단 헤더: 로고(170px) 및 ID 표시 복구 */}
      <div className="w-full max-w-md flex flex-col items-center pt-8 mb-10">
        <Image src="/marpo-group-logo.png" alt="MARPO GROUP" width={170} height={170} priority />
        <p className="text-yellow-500 font-black text-2xl uppercase tracking-tighter italic mt-5">Marpo Spirit</p>
        
        <div className="mt-3 px-5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full">
          <p className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase">
            CONNECTED ID: <span className="text-yellow-500 ml-1">{user?.username || "CONNECTING..."}</span>
          </p>
        </div>
      </div>

      {/* 🚀 잭팟 섹션: 오라클 가격창 레이아웃 완벽 복구 */}
      <section className="w-full max-w-md bg-zinc-900 border border-yellow-500/20 p-8 rounded-[2.5rem] mb-12 shadow-2xl relative overflow-hidden">
          <p className="text-zinc-500 text-xs font-black uppercase tracking-[0.4em] mb-3">Live Jackpot Pool</p>
          <p className="text-5xl font-black text-white tracking-tighter mb-8">
            {jackpot.toLocaleString(undefined, {minimumFractionDigits: 4})} <span className="text-xl text-zinc-600 font-normal">Pi</span>
          </p>

          <div className="pt-6 border-t border-zinc-800/80 flex justify-between items-end px-1">
            <div className="text-left">
              <span className="text-[9px] text-zinc-600 font-black uppercase block mb-1 tracking-wider">Current Oracle</span>
              <span className="text-xs text-zinc-300 font-bold uppercase tracking-tighter">1 Pi Value</span>
            </div>
            <div className="text-right">
              <p className="text-xl font-black text-white tracking-tight leading-none">
                $ {peggedUsd.toLocaleString(undefined, {minimumFractionDigits: 3})}
                <span className="text-[10px] text-zinc-500 ml-1.5 font-bold">USD</span>
              </p>
            </div>
          </div>
      </section>

      {/* 번호 선택 UI */}
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
            }} className={`h-11 w-11 rounded-full text-sm font-black border transition-all ${mainNumbers.includes(n) ? 'bg-yellow-500 text-black border-yellow-500 scale-110 shadow-lg' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}>{n}</button>
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
            }} className={`h-11 w-11 rounded-full text-sm font-black border transition-all ${spiritNumbers.includes(n) ? 'bg-red-600 text-white border-red-600 scale-110 shadow-lg' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}>{n}</button>
          ))}
        </div>
      </section>

      <button onClick={() => setIsModalOpen(true)} disabled={mainNumbers.length !== 8 || spiritNumbers.length !== 2 || !user} className="w-full max-w-md py-7 rounded-[2rem] font-black text-2xl mb-14 bg-gradient-to-r from-yellow-600 to-yellow-400 text-black shadow-xl disabled:opacity-20 uppercase tracking-widest">
        PLAY <span className="text-lg ml-2">{ticketPrice.toFixed(5)} PI</span>
      </button>

      {/* 내 티켓 관리 */}
      {user && (
        <section className="w-full max-w-md mb-16 text-left px-1">
          <h2 className="text-xl font-black text-yellow-500 uppercase italic mb-6 border-b border-zinc-900 pb-2">Active Tickets</h2>
          {activeTickets.length > 0 ? (
            <div className="flex flex-col gap-4">
              {activeTickets.map((t, i) => (
                <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center shadow-xl">
                  <p className="text-[10px] text-yellow-500 font-black uppercase mb-3 animate-pulse tracking-[0.2em]">● Draw Countdown</p>
                  <p className="text-4xl font-black text-white tracking-widest">{getTimeRemaining()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-700 font-bold text-center py-10 uppercase tracking-widest text-xs italic">No tickets in this draw</p>
          )}

          {historyTickets.length > 0 && (
            <div className="mt-12">
              <button onClick={() => setShowHistory(!showHistory)} className="w-full py-5 border border-zinc-800 rounded-2xl text-zinc-600 font-black text-[11px] uppercase tracking-[0.3em] hover:text-zinc-300">
                {showHistory ? '▲ Hide Past Records' : '▼ View Records (Last 30 Days)'}
              </button>
              {showHistory && (
                <div className="mt-8 flex flex-col gap-6">
                  {historyTickets.map((t, i) => {
                    const isWon = t.status === 'WON' || t.status === 'CLAIMED';
                    return (
                        <div key={i} className={`bg-zinc-900/50 border rounded-3xl p-8 ${isWon ? 'border-yellow-500 shadow-lg' : 'border-zinc-800 opacity-60'}`}>
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-[11px] text-zinc-600 font-black">{new Date(t.createdAt).toLocaleDateString()}</span>
                                <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${isWon ? 'bg-yellow-500 text-black' : 'text-zinc-500'}`}>{t.status}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {t.selectedNumbers.main.map((n:number, j:number) => <span key={j} className="w-9 h-9 flex items-center justify-center bg-black border border-zinc-800 rounded-full text-[11px] font-black">{n}</span>)}
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

      <div className="w-full max-w-md mt-12 mb-20">
        <button onClick={async () => {
            setIsChecking(true);
            try { await fetch('/api/draw', {method: 'POST'}); if(user) fetchMyTickets(user.username); }
            catch(e) {} finally { setIsChecking(false); }
        }} disabled={isChecking || myTickets.length === 0} className="w-full py-8 rounded-[2rem] font-black text-xl border-2 border-zinc-800 text-zinc-600 hover:border-yellow-500 hover:text-white transition-all uppercase tracking-widest">
          {isChecking ? 'SCANNING...' : 'CHECK MY TICKETS'}
        </button>
      </div>

      {/* 🚀 결제 모달: 구문 오류(await res=...) 및 변수 중복 선언 전면 수정 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex justify-center items-center z-50 p-6 text-center">
          <div className="bg-zinc-900 border-2 border-yellow-500/30 p-10 rounded-[3rem] w-full max-w-md relative shadow-2xl">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-zinc-500 text-2xl">✕</button>
            <h2 className="text-3xl font-black text-yellow-500 mb-8 uppercase italic tracking-tighter">Confirm Play</h2>
            <div className="bg-black border border-zinc-800 rounded-3xl p-8 mb-10">
              <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mb-2">Total Entry Fee</p>
              <p className="text-4xl font-black text-white">{ticketPrice.toFixed(5)} <span className="text-lg text-zinc-500 ml-1">Pi</span></p>
            </div>
            
            <button 
              onClick={async () => {
                if (isStoring) return; 
                setIsStoring(true);
                try {
                  const safeAmount = Number(ticketPrice.toFixed(5));
                  const Pi = (window as any).Pi;
                  
                  if (!Pi || window.location.hostname === 'localhost') {
                    // 로컬 테스트용
                    const res = await fetch('/api/tickets', { 
                      method: 'POST', 
                      headers: { 'Content-Type': 'application/json' }, 
                      body: JSON.stringify({ numbers: { main: mainNumbers, spirit: spiritNumbers }, userId: user?.username, amount: safeAmount, transactionId: "DEV_" + Date.now() }) 
                    });
                    if (res.ok) { alert("Ticket Sealed! 🏎️💨"); if(user) fetchMyTickets(user.username); }
                  } else {
                    // 실서버 Pi 결제용
                    await Pi.createPayment({
                        amount: safeAmount,
                        memo: "Marpo Spirit Entry",
                        metadata: { type: "lotto_ticket" }
                    }, {
                        onReadyForServerApproval: (pid: string) => fetch('/api/payments/approve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentId: pid }) }),
                        onReadyForServerCompletion: async (pid: string, txid: string) => {
                            await fetch('/api/payments/complete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentId: pid, txid }) });
                            const ticketRes = await fetch('/api/tickets', { 
                              method: 'POST', 
                              headers: { 'Content-Type': 'application/json' }, 
                              body: JSON.stringify({ numbers: { main: mainNumbers, spirit: spiritNumbers }, userId: user?.username, amount: safeAmount, transactionId: txid }) 
                            });
                            if(ticketRes.ok) { alert("Ticket Sealed! 🏎️💨"); if(user) fetchMyTickets(user.username); }
                        },
                        onCancel: () => setIsStoring(false),
                        onError: (e: Error) => { setIsStoring(false); console.error(e); }
                    });
                  }
                } catch(e) { console.error(e); }
                finally { setIsStoring(false); setIsModalOpen(false); setMainNumbers([]); setSpiritNumbers([]); }
              }} 
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