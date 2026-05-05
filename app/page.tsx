"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import WinnerBoard from '../components/WinnerBoard';

export default function MarpoLottoPage() {
  // 1. 상태 변수 설정
  const [user, setUser] = useState<any>(null);
  const [ticketPrice, setTicketPrice] = useState<number>(0.13014); 
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

  // 2. 오라클 데이터 실시간 호출 (에러 방지 강화)
  const fetchOracleSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/settings', { cache: 'no-store' });
      if (!res.ok) throw new Error("Network response was not ok");
      const json = await res.json();
      if (json.success && json.settings) {
        setTicketPrice(Number(Number(json.settings.ticketPricePi || 0.1).toFixed(5)));
        setPeggedUsd(Number(json.settings.peggedUsd || 314.159));
        setJackpot(Number(json.settings.realJackpot || 0));
      }
    } catch (e) { 
      console.error("Oracle Sync Error:", e);
    }
  }, []);

  // 3. 내 티켓 목록 가져오기
  const fetchMyTickets = async (userId: string) => {
    if (!userId) return;
    try {
      const response = await fetch(`/api/tickets?userId=${userId}`);
      const data = await response.json();
      if (data.success) setMyTickets(data.tickets);
    } catch (error) { console.error("Fetch Tickets Error:", error); }
  };

  // 4. 초기화 및 사용자 인증 (로컬/실서버 구분 강화)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      if (isLocal) {
        // 로컬 개발 환경: 즉시 아이디 고정
        const devUser = { username: "MARPO_DEV" };
        setUser(devUser);
        fetchMyTickets(devUser.username);
      } else {
        // 실서버: 파이 브라우저 인증
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
          } catch (err) { 
            setUser({ username: "GUEST_USER" }); 
          }
        };
        initPi();
      }
    }
    
    fetchOracleSettings();
    const oracleTimer = setInterval(fetchOracleSettings, 30000); // 30초 동기화
    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => { clearInterval(oracleTimer); clearInterval(clockTimer); };
  }, [fetchOracleSettings]);

  // 추첨 타이머 및 티켓 분류 로직
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
      
      {/* 🚀 상단 헤더: 로고 + 아이디 표시 (복구 완료) */}
      <div className="w-full max-w-md flex flex-col items-center pt-8 mb-8">
        <Image src="/marpo-group-logo.png" alt="MARPO GROUP" width={110} height={110} priority />
        <p className="text-yellow-500 font-black text-xl uppercase tracking-tighter italic mt-3">Marpo Spirit</p>
        
        {/* 접속된 아이디 표시창 */}
        <div className="mt-2 px-4 py-1 bg-zinc-900 border border-zinc-800 rounded-full">
          <p className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase">
            ID: <span className="text-yellow-500">{user?.username || "CONNECTING..."}</span>
          </p>
        </div>
      </div>

      {/* 🚀 잭팟 섹션: 실시간 오라클 가격창 (복구 완료) */}
      <section className="w-full max-w-md bg-zinc-900 border border-yellow-500/20 p-8 rounded-[2.5rem] mb-10 shadow-2xl relative">
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-3">Live Jackpot Pool</p>
          <p className="text-5xl font-black text-white tracking-tighter mb-8">
            {jackpot.toLocaleString(undefined, {minimumFractionDigits: 4})} <span className="text-xl text-zinc-600 font-normal">Pi</span>
          </p>

          {/* 복구된 오라클 가격 레이아웃 */}
          <div className="pt-6 border-t border-zinc-800 flex justify-between items-end px-1">
            <div className="text-left">
              <span className="text-[9px] text-zinc-600 font-black uppercase block mb-1">Current Oracle</span>
              <span className="text-xs text-zinc-300 font-black uppercase tracking-tighter">1 Pi Value</span>
            </div>
            <div className="text-right">
              <p className="text-xl font-black text-white tracking-tight leading-none">
                $ {peggedUsd.toLocaleString(undefined, {minimumFractionDigits: 3})}
                <span className="text-[10px] text-zinc-500 ml-1 font-bold">USD</span>
              </p>
            </div>
          </div>
      </section>

      {/* 번호 선택 섹션 */}
      <section className="w-full max-w-md mb-12">
        <div className="flex justify-between items-center mb-4 px-1">
          <p className="text-sm font-black text-zinc-500 uppercase tracking-widest italic">Main Numbers</p>
          <span className="text-lg font-black text-yellow-500">{mainNumbers.length} / 8</span>
        </div>
        <div className="grid grid-cols-7 gap-2 mb-10">
          {Array.from({ length: 45 }, (_, i) => i + 1).map((n) => (
            <button key={`m-${n}`} onClick={() => {
                if (mainNumbers.includes(n)) setMainNumbers(mainNumbers.filter(x => x !== n));
                else if (mainNumbers.length < 8) setMainNumbers([...mainNumbers, n].sort((a,b)=>a-b));
            }} className={`h-11 w-11 rounded-full text-sm font-black border transition-all ${mainNumbers.includes(n) ? 'bg-yellow-500 text-black border-yellow-500 shadow-lg scale-110' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}>{n}</button>
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
            }} className={`h-11 w-11 rounded-full text-sm font-black border transition-all ${spiritNumbers.includes(n) ? 'bg-red-600 text-white border-red-600 shadow-lg scale-110' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}>{n}</button>
          ))}
        </div>
      </section>

      {/* 플레이 버튼 */}
      <button onClick={() => setIsModalOpen(true)} disabled={mainNumbers.length !== 8 || spiritNumbers.length !== 2 || !user} className="w-full max-w-md py-7 rounded-[2rem] font-black text-2xl mb-14 bg-gradient-to-r from-yellow-600 to-yellow-400 text-black shadow-xl disabled:opacity-20 uppercase tracking-widest">
        PLAY <span className="text-lg ml-2">{ticketPrice.toFixed(5)} PI</span>
      </button>

      {/* 내 티켓 관리 (Active/History) */}
      {user && (
        <section className="w-full max-w-md mb-16 text-left">
          <h2 className="text-lg font-black text-yellow-500 uppercase italic mb-6 border-b border-zinc-900 pb-2">Active Tickets</h2>
          {activeTickets.length > 0 ? (
            <div className="flex flex-col gap-4">
              {activeTickets.map((t, i) => (
                <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center">
                  <p className="text-xs text-yellow-500 font-black uppercase mb-3 animate-pulse">● Draw Countdown</p>
                  <p className="text-4xl font-black text-white tracking-widest">{getTimeRemaining()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-700 font-bold text-center py-10 uppercase tracking-widest">No active tickets</p>
          )}

          {historyTickets.length > 0 && (
            <div className="mt-10">
              <button onClick={() => setShowHistory(!showHistory)} className="w-full py-4 border border-zinc-800 rounded-2xl text-zinc-500 font-black text-xs uppercase tracking-widest">
                {showHistory ? '▲ Hide Past Records' : '▼ View Records (30 Days)'}
              </button>
              {showHistory && (
                <div className="mt-6 flex flex-col gap-4">
                  {historyTickets.map((t, i) => (
                    <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] text-zinc-600 font-black">{new Date(t.createdAt).toLocaleDateString()}</span>
                        <span className="text-[10px] text-yellow-500 font-black uppercase">{t.status}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {t.selectedNumbers.main.map((n:number, j:number) => <span key={j} className="w-8 h-8 flex items-center justify-center bg-black border border-zinc-800 rounded-full text-[10px] font-black">{n}</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      <WinnerBoard />

      {/* 티켓 체크 버튼 */}
      <div className="w-full max-w-md mt-12 mb-20">
        <button onClick={async () => {
            setIsChecking(true);
            try { await fetch('/api/draw', {method: 'POST'}); if(user) fetchMyTickets(user.username); }
            finally { setIsChecking(false); }
        }} disabled={isChecking || myTickets.length === 0} className="w-full py-8 rounded-[2rem] font-black text-xl border-2 border-zinc-800 text-zinc-500 uppercase tracking-widest hover:border-yellow-500 transition-colors">
          {isChecking ? 'SCANNING...' : 'CHECK MY TICKETS'}
        </button>
      </div>

      {/* 결제 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex justify-center items-center z-50 p-6">
          <div className="bg-zinc-900 border-2 border-yellow-500/30 p-10 rounded-[3rem] w-full max-w-md relative text-center shadow-2xl">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-zinc-500 text-2xl">✕</button>
            <h2 className="text-3xl font-black text-yellow-500 mb-8 uppercase italic">Confirm Play</h2>
            <div className="bg-black border border-zinc-800 rounded-3xl p-8 mb-10">
              <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mb-2">Total Entry Fee</p>
              <p className="text-4xl font-black text-white">{ticketPrice.toFixed(5)} <span className="text-lg text-zinc-500 ml-1">Pi</span></p>
            </div>
            <button onClick={async () => {
                if (isStoring) return; setIsStoring(true);
                try {
                  const safeAmount = Number(ticketPrice.toFixed(5));
                  const res = await fetch('/api/tickets', { 
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' }, 
                    body: JSON.stringify({ numbers: { main: mainNumbers, spirit: spiritNumbers }, userId: user?.username, amount: safeAmount, transactionId: "DEV_TX_" + Date.now() }) 
                  });
                  if (res.ok) {
                    alert("Ticket Sealed! 🏎️💨");
                    if(user) fetchMyTickets(user.username);
                  }
                } finally { setIsStoring(false); setIsModalOpen(false); setMainNumbers([]); setSpiritNumbers([]); }
            }} className="w-full bg-yellow-500 text-black font-black text-2xl py-6 rounded-2xl uppercase shadow-lg active:scale-95 transition-transform">{isStoring ? 'STORING...' : 'PAY NOW'}</button>
          </div>
        </div>
      )}
    </div>
  );
}