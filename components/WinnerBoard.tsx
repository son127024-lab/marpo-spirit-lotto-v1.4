"use client";
import React, { useState, useEffect } from 'react';
import { History, Award } from 'lucide-react';

export default function WinnerBoard() {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/history')
      .then(res => res.json())
      .then(data => {
        if (data.success) setHistory(data.history);
      })
      .catch(err => console.error("History Load Failed", err));
  }, []);

  return (
    /* 1. w-full과 min-w-0으로 화면 밖 이탈을 원천 차단합니다. */
    <div className="w-full min-w-0 mt-8 mb-12">
      
      {/* 헤더: 마르포 전용 앰버 컬러와 라인 디자인 */}
      <div className="flex items-center justify-center gap-4 mb-10">
        <div className="h-[2px] bg-marpo-amber/20 flex-1"></div>
        <div className="flex items-center gap-2">
          <History className="text-marpo-amber" size={20} />
          <h2 className="text-2xl font-black text-marpo-amber uppercase italic tracking-[0.3em] font-urbanist">
            Draw Archive
          </h2>
        </div>
        <div className="h-[2px] bg-marpo-amber/20 flex-1"></div>
      </div>

      <div className="flex flex-col gap-6">
        {history.length === 0 ? (
          <div className="bg-marpo-zinc/20 border border-marpo-zinc p-10 rounded-[2rem] text-center">
            <p className="text-zinc-600 text-xs uppercase font-black tracking-widest">No Tactical History Recorded</p>
          </div>
        ) : (
          history.map((draw, idx) => (
            /* 2. 카드 디자인을 다른 HUD와 통일 (marpo-zinc 사용) */
            <div key={idx} className="bg-marpo-zinc/30 border border-marpo-zinc p-6 rounded-[2.5rem] backdrop-blur-md hover:border-marpo-amber/40 transition-all">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <Award size={14} className="text-marpo-neon" />
                  <span className="text-xs font-black text-marpo-amber uppercase tracking-widest italic">
                    Operation #{history.length - idx}
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono font-bold tracking-tighter">
                  {new Date(draw.drawDate).toLocaleDateString()}
                </span>
              </div>

              {/* 3. 로또 번호 시각화: F1 엔진 느낌의 강렬한 서클 */}
              <div className="flex flex-wrap gap-2 justify-center items-center py-4 bg-black/40 rounded-3xl border border-white/5">
                {draw.numbers.main.map((n: any) => (
                  <span key={n} className="w-9 h-9 flex items-center justify-center bg-zinc-800 text-white text-xs font-black rounded-full border border-zinc-700 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                    {n}
                  </span>
                ))}
                
                <div className="w-[2px] h-8 bg-marpo-zinc mx-2"></div>
                
                {draw.numbers.spirit.map((n: any) => (
                  <span key={n} className="w-9 h-9 flex items-center justify-center bg-marpo-amber/10 text-marpo-amber text-xs font-black rounded-full border border-marpo-amber/40 shadow-[0_0_15px_rgba(243,156,18,0.1)]">
                    {n}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex justify-center">
                <p className="px-4 py-1 bg-marpo-neon/10 text-marpo-neon text-[9px] font-black uppercase tracking-widest rounded-full border border-marpo-neon/20 italic">
                  1st ~ 6th Ranking Verified
                </p>
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}