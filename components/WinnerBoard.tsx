"use client";
import React, { useState, useEffect } from 'react';

export default function WinnerBoard() {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/history').then(res => res.json()).then(data => {
      if (data.success) setHistory(data.history);
    });
  }, []);

  return (
    <div className="w-full max-w-md mt-12 mb-20">
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="h-px bg-yellow-500/30 flex-1"></div>
        <h2 className="text-xl font-black text-yellow-500 uppercase italic tracking-widest">Draw History</h2>
        <div className="h-px bg-yellow-500/30 flex-1"></div>
      </div>

      <div className="flex flex-col gap-4">
        {history.length === 0 ? <p className="text-zinc-600 text-center text-xs uppercase font-bold">No history yet</p> : 
          history.map((draw, idx) => (
          <div key={idx} className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-3xl">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Draw #{history.length - idx}</span>
              <span className="text-[10px] text-zinc-500 font-bold">{new Date(draw.drawDate).toLocaleDateString()}</span>
            </div>
            <div className="flex flex-wrap gap-1.5 justify-center mb-2">
              {draw.numbers.main.map((n: any) => <span key={n} className="w-7 h-7 flex items-center justify-center bg-zinc-800 text-zinc-400 text-[10px] font-bold rounded-full border border-zinc-700">{n}</span>)}
              <div className="w-px h-6 bg-zinc-800 mx-1"></div>
              {draw.numbers.spirit.map((n: any) => <span key={n} className="w-7 h-7 flex items-center justify-center bg-red-900/20 text-red-500/70 text-[10px] font-bold rounded-full border border-red-900/30">{n}</span>)}
            </div>
            <p className="text-center text-[9px] text-zinc-600 uppercase font-bold mt-2 italic">1st ~ 6th Ranking Complete</p>
          </div>
        ))}
      </div>
    </div>
  );
}