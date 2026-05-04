"use client";

import React from 'react';
import Link from 'next/link';

export default function WhitepaperPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-300 p-6 font-sans pb-20 relative">
      {/* 뒤로가기 & 헤더 */}
      <div className="w-full max-w-2xl mx-auto pt-8 mb-10 flex items-center justify-between">
        <Link href="/" className="text-zinc-500 hover:text-yellow-500 transition-colors text-sm font-bold uppercase tracking-widest">
          ← Back to Vault
        </Link>
        <span className="text-[10px] text-zinc-600 uppercase tracking-[0.3em]">Version 1.0</span>
      </div>

      <div className="w-full max-w-2xl mx-auto space-y-12">
        {/* 타이틀 섹션 */}
        <div className="text-center border-b border-zinc-800 pb-10">
          <p className="text-yellow-500 font-black tracking-[0.5em] uppercase text-xs mb-4">Marpo Group Official</p>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic mb-6 shadow-yellow-500/20 drop-shadow-2xl">
            Marpo Token<br />Whitepaper
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-lg mx-auto">
            Defining the vision, technical architecture, and economic model of the core asset driving the next-generation platform ecosystem.
          </p>
        </div>

        {/* 1. Executive Summary */}
        <section className="bg-zinc-900/40 p-8 rounded-3xl border border-zinc-800/50 hover:border-yellow-500/30 transition-all">
          <h2 className="text-xl font-black text-yellow-500 tracking-widest uppercase mb-4">1. Executive Summary</h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            MARPO GROUP aims to construct a global platform ecosystem operating on the Pi Network. Through our core assets—Pi domains, specialized DApps, and the <span className="text-white font-bold">'Marpo Token'</span> serving as the reserve currency—we will realize an unprecedented economic ecosystem. The first milestone, <span className="text-white font-bold">'Marpo Spirit'</span>, is a global jackpot lottery system that acts as the primary engine to absorb the ecosystem's liquidity and generate immense value.
          </p>
        </section>

        {/* 2. The Ecosystem Engine */}
        <section className="bg-zinc-900/40 p-8 rounded-3xl border border-zinc-800/50 hover:border-yellow-500/30 transition-all">
          <h2 className="text-xl font-black text-yellow-500 tracking-widest uppercase mb-4">2. The Ecosystem Engine: Marpo Spirit</h2>
          <p className="text-sm leading-relaxed text-zinc-400 mb-6">
            Marpo Spirit is a global jackpot platform targeting the world's 8 billion population and tens of millions of Pi Network Pioneers.
          </p>
          <ul className="space-y-3 text-sm text-zinc-300">
            <li className="flex items-start"><span className="text-yellow-500 mr-2">▶</span> <strong>Game Structure:</strong> Main Numbers (8/45) + Spirit Numbers (2/45)</li>
            <li className="flex items-start"><span className="text-yellow-500 mr-2">▶</span> <strong>Entry Fee:</strong> 1 Pi (Global Standard)</li>
            <li className="flex items-start"><span className="text-yellow-500 mr-2">▶</span> <strong>1st Prize Probability:</strong> Approx. 1 in 212.3 Billion (Designed for mega-rollover)</li>
            <li className="flex items-start"><span className="text-yellow-500 mr-2">▶</span> <strong>Primary Objective:</strong> Absorbing global Pi liquidity</li>
          </ul>
        </section>

        {/* 3. Tokenomics */}
        <section className="bg-zinc-900/40 p-8 rounded-3xl border border-zinc-800/50 hover:border-yellow-500/30 transition-all">
          <h2 className="text-xl font-black text-yellow-500 tracking-widest uppercase mb-4">3. Marpo Tokenomics</h2>
          <p className="text-sm leading-relaxed text-zinc-400 mb-6">
            The Marpo Token is the primary medium of payment, reward, and value storage within the Marpo Ecosystem.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-black p-5 rounded-2xl border border-zinc-800">
              <h3 className="text-xs font-black text-white uppercase tracking-widest mb-2">Token Sink</h3>
              <p className="text-xs text-zinc-500">Defends intrinsic value utilizing locked Pi assets as collateral.</p>
            </div>
            <div className="bg-black p-5 rounded-2xl border border-zinc-800">
              <h3 className="text-xs font-black text-white uppercase tracking-widest mb-2">House Edge (8%)</h3>
              <p className="text-xs text-zinc-500">Allocated for system advancement and securing capital.</p>
            </div>
            <div className="bg-black p-5 rounded-2xl border border-zinc-800">
              <h3 className="text-xs font-black text-white uppercase tracking-widest mb-2">Child Fund (5%)</h3>
              <p className="text-xs text-zinc-500">Supports underprivileged children worldwide.</p>
            </div>
            <div className="bg-black p-5 rounded-2xl border border-zinc-800 border-b-2 border-b-yellow-500">
              <h3 className="text-xs font-black text-yellow-500 uppercase tracking-widest mb-2">Jackpot Pool (87%)</h3>
              <p className="text-xs text-zinc-500">Accumulated as global prize and LP base asset.</p>
            </div>
          </div>
        </section>

        {/* 4. Liquidity & 5. Vision */}
        <section className="bg-zinc-900/40 p-8 rounded-3xl border border-zinc-800/50 hover:border-yellow-500/30 transition-all">
          <h2 className="text-xl font-black text-yellow-500 tracking-widest uppercase mb-4">4. Liquidity & Redistribution</h2>
          <p className="text-sm leading-relaxed text-zinc-400 mb-8">
            Beyond merely freezing capital, we adopt an advanced economic model that recirculates locked Pi back into the market via Pi/Marpo Liquidity Pools (LP) and strategic redistribution of secondary prizes.
          </p>

          <h2 className="text-xl font-black text-yellow-500 tracking-widest uppercase mb-4">5. Vision & Roadmap</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-zinc-300 marker:text-zinc-600 font-bold">
            <li><span className="font-normal">Launch of Marpo Spirit global jackpot.</span></li>
            <li><span className="font-normal">Sequential launch of specialized DApps.</span></li>
            <li><span className="font-normal">Completion of Marpo Token DeFi ecosystem.</span></li>
            <li><span className="font-normal">Expansion into offline global businesses.</span></li>
          </ol>
        </section>

        {/* 하단 고지사항 */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 p-6 rounded-2xl text-center">
          <p className="text-[10px] text-yellow-500/70 uppercase tracking-widest font-black mb-2">[ Governance Notice ]</p>
          <p className="text-xs text-zinc-500 italic">
            This economic model evolves organically. All operational revenues and settlements are executed transparently based on verified on-chain data.
          </p>
        </div>
      </div>
    </div>
  );
}