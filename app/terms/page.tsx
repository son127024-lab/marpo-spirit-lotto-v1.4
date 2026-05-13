"use client";
import React from 'react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 p-8 md:p-20 font-sans leading-relaxed">
      <div className="max-w-4xl mx-auto bg-zinc-900/50 border border-zinc-800 p-10 rounded-[2rem] shadow-2xl">
        <h1 className="text-3xl font-black text-amber-500 mb-8 uppercase tracking-tighter italic">
          Terms of Service
        </h1>
        <div className="space-y-8 text-sm md:text-base">
          <section>
            <h2 className="text-xl font-bold text-white mb-4 italic">1. Purpose</h2>
            <p>These Terms of Service govern the use of "MARPO SPIRIT: L.O.T.T.O WORLD," a Web3 SaaS platform provided by Marpo Group ("Company"), establishing the rights, obligations, and procedures between the users and the Company.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 italic">2. Definitions</h2>
            <p>1. <strong>Pioneer:</strong> Any user accessing this service using a verified Pi Network account.</p>
            <p>2. <strong>Web3 SaaS Subscription:</strong> A tiered service (Basic, Premium, VIP) where users utilize Pi to unlock tactical mining protocols.</p>
            <p>3. <strong>MAR-Ω:</strong> Virtual energy credits awarded based on user strategy, luck, and ecosystem contribution.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 italic">3. Service Nature: Fun & Transparency</h2>
            <p>1. <strong>Initial Version:</strong> This application is currently in its initial Beta release. Our primary goal at this stage is to provide an engaging, fun, and thrilling experience for Pioneers while testing the viability of a deflationary utility model.</p>
            <p>2. <strong>Testnet Operations:</strong> <span className="text-amber-500 font-bold">[Transparency Notice]</span> The service currently operates on the Pi Testnet. No real Pi coins are deducted or transferred. The transition to the Mainnet will be aligned with the Pi Core Team's official roadmap.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 italic">4. Ecosystem Expansion & Future Integration</h2>
            <p>1. <strong>Cross-App Universe:</strong> L.O.T.T.O WORLD is just the beginning. The Marpo Group is building a continuous ecosystem. The assets, MAR-Ω credits, and loyalty tiers earned here are planned to be fully integrated and utilized in upcoming Marpo DApps (such as future gaming titles), creating a unified Web3 universe.</p>
            <p>2. <strong>NFT Roadmap:</strong> Users can earn a "Genesis Honor Badge" within the app. Upon Mainnet launch and technical readiness, the Company plans to convert these digital badges into 1:1 NFTs directly airdropped to the Pioneer's wallet.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 italic">5. Limitation of Liability</h2>
            <p>The Company is not responsible for service interruptions caused by blockchain network instability or policy changes by the Pi Network. Users are solely responsible for the security of their own Pi wallets.</p>
          </section>
        </div>
        <div className="mt-12 pt-8 border-t border-zinc-800 text-center text-xs text-zinc-600 uppercase tracking-widest">
          © 2026 MARPO GROUP. ALL RIGHTS RESERVED.
        </div>
      </div>
    </div>
  );
}