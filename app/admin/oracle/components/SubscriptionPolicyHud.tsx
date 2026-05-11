"use client";
import { Users, Crown, Settings2 } from 'lucide-react';

export default function SubscriptionPolicyHud() {
  return (
    <section className="bg-marpo-zinc/30 border border-marpo-zinc rounded-[2.5rem] p-8 backdrop-blur-xl group hover:border-marpo-amber/50 transition-all">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-2xl font-black italic text-marpo-amber uppercase tracking-widest font-urbanist">Subscription Policy</h3>
        <Settings2 className="text-zinc-600 hover:text-white cursor-pointer" size={24} />
      </div>

      <div className="space-y-4">
        {[
          { tier: 'BASIC', price: 'FREE', draws: '3 Ads / Draw', color: 'text-zinc-400' },
          { tier: 'PREMIUM', price: '1 PI', draws: '5 Free / 5h', color: 'text-marpo-neon' },
          { tier: 'VIP', price: '3 PI', draws: '10 Free / 5h', color: 'text-marpo-amber' },
        ].map((item) => (
          <div key={item.tier} className="bg-black/40 border border-marpo-zinc p-5 rounded-3xl flex justify-between items-center">
            <div>
              <p className={`font-black italic text-lg ${item.color}`}>{item.tier}</p>
              <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Fee: {item.price}</p>
            </div>
            <div className="text-right">
              <p className="text-white font-black text-sm">{item.draws}</p>
              <button className="text-[10px] text-marpo-amber font-black underline uppercase mt-1">Edit Policy</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}