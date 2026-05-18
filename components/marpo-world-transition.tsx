"use client";

import { useEffect } from "react";

type MarpoWorldTransitionProps = {
  onComplete: () => void;
};

export default function MarpoWorldTransition({
  onComplete,
}: MarpoWorldTransitionProps) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      onComplete();
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <section className="relative flex min-h-[calc(100vh-80px)] w-full items-center justify-center overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(88,28,135,0.65),transparent_35%),radial-gradient(circle_at_bottom,rgba(14,165,233,0.25),transparent_45%)]" />

      <div className="absolute inset-0 opacity-40">
        <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 animate-spin rounded-full border border-purple-500/30 border-t-purple-300" />
        <div className="absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 animate-spin rounded-full border border-cyan-500/20 border-b-cyan-300 [animation-duration:6s]" />
        <div className="absolute left-1/2 top-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black shadow-[0_0_80px_rgba(168,85,247,0.8)]" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="mb-8 text-7xl animate-bounce">🐰</div>

        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-cyan-300">
          MARPO WORLD GATE
        </p>

        <h1 className="mt-3 text-4xl font-black italic uppercase md:text-6xl">
          Entering MAR
        </h1>

        <p className="mt-4 max-w-xl text-sm font-bold leading-relaxed text-zinc-300">
          The guide rabbit jumps into the mining loop. Blackhole transfer is in
          progress. Arriving at the MAR world...
        </p>

        <div className="mt-8 h-2 w-72 overflow-hidden rounded-full bg-zinc-900">
          <div className="h-full w-full origin-left animate-[marpoTravel_5s_linear_forwards] bg-gradient-to-r from-cyan-400 via-purple-400 to-amber-400" />
        </div>
      </div>

      <style jsx>{`
        @keyframes marpoTravel {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }
      `}</style>
    </section>
  );
}