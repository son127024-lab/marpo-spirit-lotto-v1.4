"use client";
import React from 'react';
import { CreditCard, CheckCircle2, Clock } from 'lucide-react';

export default function PiPaymentLogHud() {
  const transactions = [
    { id: 'TX-9921', user: 'Pioneer_K1', tier: 'VIP', amount: '3 Pi', status: 'COMPLETED' },
    { id: 'TX-9920', user: 'Marpo_Fan', tier: 'PREMIUM', amount: '1 Pi', status: 'PENDING' },
  ];

  return (
    <section className="bg-marpo-zinc/30 border border-marpo-zinc rounded-[2.5rem] p-8 backdrop-blur-xl group hover:border-marpo-amber/50 transition-all">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-marpo-amber/10 p-3 rounded-xl border border-marpo-amber/20">
            <CreditCard className="text-marpo-amber" size={24} />
          </div>
          <h3 className="text-2xl font-black italic text-white uppercase tracking-widest font-urbanist">Pi Payment Logs</h3>
        </div>
      </div>

      <div className="space-y-4">
        {transactions.map((tx) => (
          <div key={tx.id} className="bg-black/40 border border-marpo-zinc p-4 rounded-2xl flex justify-between items-center hover:bg-white/5 transition-all">
            <div className="flex gap-4 items-center">
              <div className={tx.status === 'COMPLETED' ? "text-marpo-neon" : "text-zinc-600"}>
                {tx.status === 'COMPLETED' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
              </div>
              <div>
                <p className="text-sm font-black text-white italic">{tx.user}</p>
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter">{tx.tier} Subscription</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-marpo-amber font-black italic">{tx.amount}</p>
              <p className="text-[9px] text-zinc-500 font-mono">{tx.id}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}