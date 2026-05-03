"use client";

import React from 'react';

// Mock winner data (Will be replaced with real DB data later)
const mockWinners = [
  { id: 1, date: "2026-04-24", username: "pioneer_king", prize: "15,000 Pi", round: 11 },
  { id: 2, date: "2026-04-17", username: "marpo_first", prize: "12,400 Pi", round: 10 },
  { id: 3, date: "2026-04-10", username: "lucky_guy77", prize: "18,200 Pi", round: 9 },
];

export default function WinnerBoard() {
  return (
    <div className="w-full max-w-md mt-12 mb-20">
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="h-px bg-gradient-to-r from-transparent via-yellow-500 to-transparent flex-1"></div>
        <h2 className="text-2xl font-bold tracking-widest text-yellow-500 uppercase">
          Hall of Fame
        </h2>
        <div className="h-px bg-gradient-to-r from-transparent via-yellow-500 to-transparent flex-1"></div>
      </div>

      <p className="text-center text-gray-400 text-sm mb-6 uppercase tracking-widest">
        Recent Jackpot Winners
      </p>

      <div className="flex flex-col gap-4">
        {mockWinners.map((winner, index) => (
          <div 
            key={winner.id} 
            className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-yellow-600 transition-colors duration-300"
          >
            {index === 0 && (
              <div className="absolute -top-6 -right-6 text-yellow-500 opacity-10 text-9xl">
                ★
              </div>
            )}

            <div className="z-10">
              <span className="bg-yellow-500 text-black text-[10px] font-extrabold px-2 py-1 rounded-sm tracking-wider uppercase mb-2 inline-block">
                Round {winner.round}
              </span>
              <p className="text-gray-500 text-xs mt-1">{winner.date}</p>
            </div>

            <div className="text-right z-10">
              <p className="text-white font-bold text-lg mb-1">@{winner.username}</p>
              <p className="text-yellow-400 font-extrabold tracking-wider">{winner.prize}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}