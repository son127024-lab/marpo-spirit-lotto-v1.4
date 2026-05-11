"use client";
import { BellRing, Send, Clock } from 'lucide-react';

export default function NotificationControlHud() {
  return (
    <section className="bg-marpo-zinc/30 border border-marpo-zinc rounded-[2.5rem] p-8 backdrop-blur-xl group hover:border-marpo-neon/50 transition-all">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <BellRing className="text-marpo-neon" size={28} />
          <h3 className="text-2xl font-black italic text-white uppercase tracking-widest font-urbanist">Auto-Alarm Control</h3>
        </div>
        <span className="text-[10px] bg-marpo-neon/10 text-marpo-neon px-3 py-1 rounded-full border border-marpo-neon/20 font-black uppercase">Every 4 Hours</span>
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-[10px] text-zinc-600 font-black uppercase mb-3 tracking-widest">Push Notification Message</p>
          <textarea 
            className="w-full bg-black/40 border border-marpo-zinc rounded-2xl p-4 text-sm text-white font-bold focus:border-marpo-neon outline-none transition-all"
            rows={3}
            defaultValue="Pioneer! Your Ω Energy has been fully recharged. Start your Mars Mining mission now! 🚀"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1 bg-black/50 p-4 rounded-2xl border border-marpo-zinc">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={14} className="text-zinc-500" />
              <p className="text-[10px] text-zinc-600 font-black uppercase">Next Global Push</p>
            </div>
            <p className="text-lg font-black italic text-white">IN 03:59:12</p>
          </div>
          <button className="px-8 bg-marpo-neon text-black rounded-2xl font-black uppercase text-xs flex items-center gap-2 hover:scale-105 active:scale-95 transition-all">
            <Send size={16} /> Broadcast Now
          </button>
        </div>
      </div>
    </section>
  );
}