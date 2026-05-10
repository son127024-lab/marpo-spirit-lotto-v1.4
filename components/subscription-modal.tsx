"use client";
import React, { useState } from 'react';
import { Zap, Crown, Check, Shield } from 'lucide-react';

interface SubscriptionModalProps {
  onSelect: (tier: string) => void;
}

export default function SubscriptionModal({ onSelect }: SubscriptionModalProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (tier: string, price: number) => {
    setLoading(tier);
    try {
      if (price === 0) {
        onSelect('BASIC');
      } else {
        const Pi = (window as any).Pi;
        if (Pi && Pi.createPayment) {
          await Pi.createPayment({
            amount: price,
            memo: `Marpo Spirit ${tier} Subscription`,
            metadata: { tier: tier }
          }, {
            onReadyForServerApproval: (paymentId: string) => { },
            onReadyForServerCompletion: (paymentId: string, txid: string) => {
              onSelect(tier); 
            },
            onCancel: () => setLoading(null),
            onError: (error: Error) => { alert(error.message); setLoading(null); }
          });
        } else {
          setTimeout(() => onSelect(tier), 1000);
        }
      }
    } catch (err) {
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0d1b3e]/95 backdrop-blur-md z-[200] flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="max-w-5xl w-full grid md:grid-cols-3 gap-6 py-10">
        
        {/* BASIC */}
        <div className="bg-black/40 border border-zinc-800 p-8 rounded-[2.5rem] flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center mb-6"><Zap size={24} className="text-zinc-400" /></div>
          <h3 className="text-xl font-bold mb-2 text-white">BASIC</h3>
          <p className="text-3xl font-black mb-8 text-white">FREE</p>
          <ul className="text-xs text-zinc-500 space-y-4 mb-10 text-left w-full">
            <li className="flex gap-2"><Check size={14} className="text-zinc-600" /> 1 Energy / 3 Ads (Mining)</li>
            <li className="flex gap-2"><Check size={14} className="text-zinc-600" /> Standard Match Access</li>
          </ul>
          <button onClick={() => handleSubscribe('BASIC', 0)} className="w-full py-4 bg-zinc-800 text-white rounded-2xl font-bold mt-auto active:scale-95 transition-transform">GET STARTED</button>
        </div>

        {/* PREMIUM */}
        <div className="bg-[#1a2a4e] border-2 border-[#f39c12]/30 p-8 rounded-[2.5rem] flex flex-col items-center text-center relative scale-105 shadow-2xl">
          <div className="absolute -top-4 bg-[#f39c12] text-black text-[10px] font-black px-4 py-1 rounded-full uppercase">Most Efficient</div>
          <div className="w-12 h-12 bg-[#f39c12] rounded-2xl flex items-center justify-center mb-6"><Shield size={24} className="text-black" /></div>
          <h3 className="text-xl font-bold mb-2 text-white">PREMIUM</h3>
          <p className="text-3xl font-black mb-8 text-white">1.0 <span className="text-lg text-zinc-500">π / mo</span></p>
          <ul className="text-xs text-zinc-300 space-y-4 mb-10 text-left w-full">
            <li className="flex gap-2"><Check size={14} className="text-[#f39c12]" /> 5 Auto-Energy Daily</li>
            <li className="flex gap-2"><Check size={14} className="text-[#f39c12]" /> 1 Energy / 1 Ad (Instant)</li>
            <li className="flex gap-2"><Check size={14} className="text-[#f39c12]" /> 30% Ad Reduction</li>
          </ul>
          <button disabled={!!loading} onClick={() => handleSubscribe('PREMIUM', 1.0)} className="w-full py-4 bg-[#f39c12] text-black rounded-2xl font-bold mt-auto shadow-lg active:scale-95 transition-transform font-sans">
            {loading === 'PREMIUM' ? 'PROCESSING...' : 'SUBSCRIBE NOW'}
          </button>
        </div>

        {/* VIP */}
        <div className="bg-black/40 border border-zinc-800 p-8 rounded-[2.5rem] flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-purple-600/20 rounded-2xl flex items-center justify-center mb-6"><Crown size={24} className="text-purple-500" /></div>
          <h3 className="text-xl font-bold mb-2 text-white">VIP</h3>
          <p className="text-3xl font-black mb-8 text-white">3.0 <span className="text-lg text-zinc-500">π / mo</span></p>
          <ul className="text-xs text-zinc-500 space-y-4 mb-10 text-left w-full">
            <li className="flex gap-2"><Check size={14} className="text-purple-500" /> 10 Auto-Energy Daily</li>
            <li className="flex gap-2"><Check size={14} className="text-purple-500" /> 90% Ad Reduction</li>
            <li className="flex gap-2"><Check size={14} className="text-purple-500" /> Spirit Booster Access</li>
          </ul>
          <button disabled={!!loading} onClick={() => handleSubscribe('VIP', 3.0)} className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold mt-auto active:scale-95 transition-transform">
            {loading === 'VIP' ? 'PROCESSING...' : 'GET VIP STATUS'}
          </button>
        </div>
      </div>
    </div>
  );
}