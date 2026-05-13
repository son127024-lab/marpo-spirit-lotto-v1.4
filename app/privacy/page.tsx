"use client";
import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 p-8 md:p-20 font-sans leading-relaxed">
      <div className="max-w-4xl mx-auto bg-zinc-900/50 border border-zinc-800 p-10 rounded-[2rem] shadow-2xl">
        <h1 className="text-3xl font-black text-amber-500 mb-8 uppercase tracking-tighter italic">
          Privacy Policy
        </h1>
        <div className="space-y-8 text-sm md:text-base">
          <section>
            <h2 className="text-xl font-bold text-white mb-4 italic">1. Information We Collect</h2>
            <p>Marpo Group respects data minimization. Through the Pi Network SDK, we only collect and utilize the following non-sensitive information:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>Required:</strong> Pi Network Username, Unique Identifier (UID).</li>
              <li><strong>Optional:</strong> In-app activity records and Web3 SaaS subscription tier status.</li>
            </ul>
            <p className="mt-2 text-zinc-500 italic">※ We do not directly collect or request sensitive personal information such as real names, email addresses, or phone numbers.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 italic">2. Purpose of Data Use</h2>
            <p>The collected data is strictly used for the following ecosystem purposes:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Managing Web3 SaaS tiers (Basic, Premium, VIP) and granting access rights.</li>
              <li>Maintaining the balance of MAR-Ω rewards and tracking gameplay history.</li>
              <li>Identifying eligible users for future cross-app integrations and 1:1 NFT Genesis airdrops within the expanding Marpo Group ecosystem.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 italic">3. Data Sharing & Third Parties</h2>
            <p>Marpo Group will never sell or share your personal data with external third parties without your explicit consent. All data is securely managed solely to provide a seamless Web3 experience within the Pi ecosystem.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 italic">4. Security Measures</h2>
            <p>We are committed to preventing the misuse of user activity data. We adhere to internal security guidelines and strictly follow the official security protocols provided by the Pi Network Core Team.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 italic">5. User Rights</h2>
            <p>You have the right to discontinue using the service at any time. Upon requesting account deletion, all personal data will be promptly destroyed, except for records required to be retained by applicable laws or blockchain immutability.</p>
          </section>
        </div>
        <div className="mt-12 pt-8 border-t border-zinc-800 text-center text-xs text-zinc-600 uppercase tracking-widest">
          © 2026 MARPO GROUP. ALL RIGHTS RESERVED.
        </div>
      </div>
    </div>
  );
}