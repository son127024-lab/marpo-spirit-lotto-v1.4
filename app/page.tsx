"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import WinnerBoard from '../components/WinnerBoard';

export default function MarpoLottoPage() {
  // 1. 유저 상태 및 기본값 설정
  const [user, setUser] = useState<any>(null);
  const [ticketPrice, setTicketPrice] = useState<number>(0.13014); 
  const [peggedUsd, setPeggedUsd] = useState<number>(314.159); // 기본값 설정
  const [jackpot, setJackpot] = useState<number>(0);
  
  const [mainNumbers, setMainNumbers] = useState<number[]>([]);
  const [spiritNumbers, setSpiritNumbers] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isStoring, setIsStoring] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // 오라클 데이터 호출 함수
  const fetchOracleSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/settings', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && json.settings) {
        setTicketPrice(Number(Number(json.settings.ticketPricePi).toFixed(5)));
        setPeggedUsd(Number(json.settings.peggedUsd));
        setJackpot(Number(json.settings.realJackpot));
      }
    } catch (e) { console.error("Oracle Sync Error"); }
  }, []);

  // 티켓 조회 함수
  const fetchMyTickets = async (userId: string) => {
    try {
      const response = await fetch(`/api/tickets?userId=${userId}`);
      const data = await response.json();
      if (data.success) setMyTickets(data.tickets);
    } catch (error) { console.error(error); }
  };

  // 🚩 [수정] 아이디 및 초기화 로직 강화
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      if (isLocal) {
        // 로컬에서는 즉시 마르포 개발자 아이디 할당
        const devUser = { username: "MARPO_DEV" };
        setUser(devUser);
        fetchMyTickets(devUser.username);
      } else {
        // 실서버 파이 앱 초기화
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
          } catch (err) { setUser({ username: "GUEST_MARPO" }); }
        };
        initPi();
      }
    }
    
    fetchOracleSettings();
    const oracleTimer = setInterval(fetchOracleSettings, 30000);
    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => { clearInterval(oracleTimer); clearInterval(clockTimer); };
  }, [fetchOracleSettings]);

  // 나머지 로직(번호 선택, 결제 등)은 동일하므로 생략하지 않고 전체 유지 권장...
  // (지면상 핵심 UI 부분만 다시 강조해 드립니다)

  const activeTickets = myTickets.filter(t => t.status === 'COMPLETED');
  const historyTickets = myTickets.filter(t => {
    if (t.status === 'COMPLETED') return false;
    const createdDate = new Date(t.createdAt).getTime();
    return (new Date().getTime() - createdDate) < (30 * 24 * 60 * 60 * 1000);
  });

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

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-4 font-sans relative pb-32 text-center">
      
      {/* 로고 영역 */}
      <div className="w-full max-w-md flex flex-col items-center pt-8 mb-6">
        <Image src="/marpo-group-logo.png" alt="MARPO GROUP" width={120} height={120} priority />
        <p className="text-yellow-500 font-black text-xl uppercase tracking-tighter italic mt-4">Marpo Spirit</p>
        {/* 아이디 표시 부분 복구 */}
        {user && <p className="text-[10px] text-zinc-500 mt-2 font-mono">CONNECTED: {user.username}</p>}
      </div>

      {/* 🚀 잭팟 및 가격창 (절대 누락 금지 섹션) */}
      <section className="w-full max-w-md bg-zinc-900 border border-yellow-500/20 p-8 rounded-[2.5rem] mb-10 shadow-2xl">
          <p className="text-zinc-500 text-xs font-black uppercase tracking-[0.3em] mb-3">Live Jackpot</p>
          <p className="text-5xl font-black text-white tracking-tighter mb-8">
            {jackpot.toLocaleString(undefined, {minimumFractionDigits: 4})} <span className="text-xl text-zinc-600">Pi</span>
          </p>

          <div className="pt-6 border-t border-zinc-800 flex justify-between items-center px-2">
            <div className="text-left">
              <span className="text-[10px] text-zinc-600 font-black uppercase block">Oracle Price</span>
              <span className="text-xs text-zinc-400 font-bold uppercase">1 Pi Value</span>
            </div>
            <div className="text-right">
              <p className="text-xl font-black text-white tracking-tight">
                $ {peggedUsd.toLocaleString(undefined, {minimumFractionDigits: 3})} <span className="text-xs text-zinc-500">USD</span>
              </p>
            </div>
          </div>
      </section>

      {/* 번호 선택 및 하단 버튼 로직... (이하 동일하게 유지) */}
      {/* [생략된 번호 선택 UI 및 결제 버튼 코드들...] */}
      
      <section className="w-full max-w-md mb-10">
        <div className="flex justify-between items-center mb-4 px-1">
          <p className="text-lg font-black text-zinc-500 uppercase">Main 8</p>
          <span className="text-xl font-black text-yellow-500">{mainNumbers.length}/8</span>
        </div>
        <div className="grid grid-cols-7 gap-2 mb-8">
          {Array.from({ length: 45 }, (_, i) => i + 1).map((n) => (
            <button key={`m-${n}`} onClick={() => {
                if (mainNumbers.includes(n)) setMainNumbers(mainNumbers.filter(x => x !== n));
                else if (mainNumbers.length < 8) setMainNumbers([...mainNumbers, n].sort((a,b)=>a-b));
            }} className={`h-11 w-11 rounded-full text-sm font-black border ${mainNumbers.includes(n) ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>{n}</button>
          ))}
        </div>
        <div className="flex justify-between items-center mb-4 px-1">
          <p className="text-lg font-black text-red-500 uppercase">Spirit 2</p>
          <span className="text-xl font-black text-red-500">{spiritNumbers.length}/2</span>
        </div>
        <div className="grid grid-cols-7 gap-2 mb-10">
          {Array.from({ length: 45 }, (_, i) => i + 1).map((n) => (
            <button key={`s-${n}`} onClick={() => {
                if (spiritNumbers.includes(n)) setSpiritNumbers(spiritNumbers.filter(x => x !== n));
                else if (spiritNumbers.length < 2) setSpiritNumbers([...spiritNumbers, n].sort((a,b)=>a-b));
            }} className={`h-11 w-11 rounded-full text-sm font-black border ${spiritNumbers.includes(n) ? 'bg-red-600 text-white border-red-600' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>{n}</button>
          ))}
        </div>
      </section>

      <button onClick={() => setIsModalOpen(true)} disabled={mainNumbers.length !== 8 || spiritNumbers.length !== 2 || !user} className="w-full max-w-md py-6 rounded-[2rem] font-black text-2xl mb-12 bg-yellow-500 text-black disabled:opacity-30">
        PLAY {ticketPrice.toFixed(5)} PI
      </button>

      <WinnerBoard />
      
      {/* 티켓 체크 버튼 */}
      <div className="w-full max-w-md mt-10">
        <button onClick={async () => {
            setIsChecking(true);
            try { await fetch('/api/draw', {method: 'POST'}); if(user) fetchMyTickets(user.username); }
            finally { setIsChecking(false); }
        }} disabled={isChecking || myTickets.length === 0} className="w-full py-8 rounded-[2rem] font-black text-2xl border-2 border-zinc-800 text-zinc-500">
          {isChecking ? 'SCANNING...' : 'CHECK MY TICKETS'}
        </button>
      </div>

      {/* 모달 창 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex justify-center items-center z-50 p-6">
          <div className="bg-zinc-900 border-2 border-yellow-500/30 p-10 rounded-[2.5rem] w-full max-w-md relative text-center">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-zinc-500 text-2xl">✕</button>
            <h2 className="text-3xl font-black text-yellow-500 mb-8 uppercase italic">Confirm</h2>
            <button onClick={async () => {
                if (isStoring) return; setIsStoring(true);
                try {
                    // 결제 로직 (실서버/로컬 구분)
                    if (window.location.hostname === 'localhost') {
                        const safeAmount = Number(ticketPrice.toFixed(5));
                        await fetch('/api/tickets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ numbers: { main: mainNumbers, spirit: spiritNumbers }, userId: user?.username, amount: safeAmount, transactionId: "DEV_TX" }) });
                        alert("Ticket Sealed!");
                        if(user) fetchMyTickets(user.username);
                    } else {
                        // 실서버 Pi 결제 로직...
                    }
                } finally { setIsStoring(false); setIsModalOpen(false); setMainNumbers([]); setSpiritNumbers([]); }
            }} className="w-full bg-yellow-500 text-black font-black text-2xl py-5 rounded-2xl">{isStoring ? 'STORING...' : 'PAY NOW'}</button>
          </div>
        </div>
      )}

    </div>
  );
}