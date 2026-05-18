"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type EnergyProfile = {
  app?: string;
  username?: string;
  uid?: string | null;
  energy?: number;
  spiritPoints?: number;
  lastDailyClaimAt?: number | null;
  createdAt?: number;
  updatedAt?: number;
};

type EnergyApiResponse = {
  success: boolean;
  error?: string;
  tier?: "basic" | "premium" | "vip";
  dailyEnergy?: number;
  alreadyClaimed?: boolean;
  message?: string;
  profile?: EnergyProfile | null;
};

function formatDate(value?: number | null) {
  if (!value || typeof value !== "number") return "Not claimed yet";
  return new Date(value).toLocaleString();
}

function getStoredUsername() {
  if (typeof window === "undefined") return null;

  const username = localStorage.getItem("marpo_pi_username")?.trim();
  return username || null;
}

function getStoredUid() {
  if (typeof window === "undefined") return null;

  const uid = localStorage.getItem("marpo_pi_uid")?.trim();
  return uid || null;
}

function getTierLabel(tier?: string) {
  if (tier === "vip") return "VIP";
  if (tier === "premium") return "PREMIUM";
  return "BASIC";
}

export default function MarpoSpiritDashboardV2() {
  const [username, setUsername] = useState<string | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [tier, setTier] = useState<"basic" | "premium" | "vip">("basic");
  const [dailyEnergy, setDailyEnergy] = useState(1);
  const [profile, setProfile] = useState<EnergyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const energy = profile?.energy ?? 0;
  const spiritPoints = profile?.spiritPoints ?? 0;

  const tierDescription = useMemo(() => {
    if (tier === "vip") return "VIP ACCESS · 10 DAILY ENERGY";
    if (tier === "premium") return "PREMIUM ACCESS · 5 DAILY ENERGY";
    return "BASIC ACCESS · 1 DAILY ENERGY";
  }, [tier]);

  const loadEnergy = useCallback(async (targetUsername: string) => {
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const params = new URLSearchParams({
        username: targetUsername,
      });

      const response = await fetch(`/api/energy?${params.toString()}`, {
        method: "GET",
        cache: "no-store",
      });

      const data = (await response.json()) as EnergyApiResponse;

      if (!response.ok || data.success !== true) {
        throw new Error(data.error || "Failed to load Energy profile.");
      }

      setTier(data.tier ?? "basic");
      setDailyEnergy(data.dailyEnergy ?? 1);
      setProfile(data.profile ?? null);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to load Energy profile.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const claimDailyEnergy = async () => {
    if (!username) {
      setError("Pi username is missing. Please sign in through Pi first.");
      return;
    }

    setIsClaiming(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/energy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({
          username,
          uid,
          action: "daily_claim",
        }),
      });

      const data = (await response.json()) as EnergyApiResponse;

      if (!response.ok || data.success !== true) {
        throw new Error(data.error || "Daily Energy claim failed.");
      }

      setTier(data.tier ?? "basic");
      setDailyEnergy(data.dailyEnergy ?? 1);
      setProfile(data.profile ?? null);

      if (data.alreadyClaimed) {
        setMessage("Daily Energy has already been claimed today.");
      } else {
        setMessage(
          data.message ||
            `Daily Energy claimed successfully. +${data.dailyEnergy ?? dailyEnergy} Energy`
        );
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Daily Energy claim failed.";
      setError(msg);
    } finally {
      setIsClaiming(false);
    }
  };

  useEffect(() => {
    const storedUsername = getStoredUsername();
    const storedUid = getStoredUid();

    setUsername(storedUsername);
    setUid(storedUid);

    if (storedUsername) {
      void loadEnergy(storedUsername);
    }
  }, [loadEnergy]);

  return (
    <section className="w-full rounded-[2rem] border border-zinc-800 bg-black/80 p-5 text-white shadow-2xl md:p-8">
      <div className="mb-6">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500">
          MARPO SPIRIT HUB
        </p>
        <h2 className="mt-2 text-3xl font-black italic uppercase md:text-5xl">
          Dashboard V2
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-400">
          Utility-based Energy system for MARPO SPIRIT. This section does not
          use betting, jackpot, or cash-prize mechanics.
        </p>
      </div>

      {!username && (
        <div className="mb-6 rounded-2xl border border-amber-900/70 bg-amber-950/20 p-4 text-sm font-bold text-amber-300">
          Pi username was not found in this browser session. Open the app
          through Pi Browser and sign in first.
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-2xl border border-red-900/70 bg-red-950/30 p-4 text-sm font-bold text-red-300">
          {error}
        </div>
      )}

      {message && (
        <div className="mb-6 rounded-2xl border border-lime-900/70 bg-lime-950/30 p-4 text-sm font-bold text-lime-300">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
          <p className="text-[10px] font-black uppercase text-zinc-500">
            User
          </p>
          <p className="mt-2 text-xl font-black text-amber-400">
            {username ?? "Not connected"}
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
          <p className="text-[10px] font-black uppercase text-zinc-500">
            Tier
          </p>
          <p className="mt-2 text-xl font-black text-lime-400">
            {getTierLabel(tier)}
          </p>
          <p className="mt-1 text-[10px] font-bold uppercase text-zinc-500">
            {tierDescription}
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
          <p className="text-[10px] font-black uppercase text-zinc-500">
            Energy
          </p>
          <p className="mt-2 text-4xl font-black">{energy}</p>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
          <p className="text-[10px] font-black uppercase text-zinc-500">
            Spirit Points
          </p>
          <p className="mt-2 text-4xl font-black">{spiritPoints}</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
          <p className="text-[10px] font-black uppercase text-zinc-500">
            Last Daily Claim
          </p>
          <p className="mt-2 text-sm font-bold text-zinc-300">
            {formatDate(profile?.lastDailyClaimAt)}
          </p>
        </div>

        <button
          type="button"
          onClick={claimDailyEnergy}
          disabled={!username || isClaiming || isLoading}
          className="rounded-3xl bg-amber-500 px-8 py-5 text-sm font-black uppercase text-black disabled:opacity-50"
        >
          {isClaiming ? "Claiming..." : `Claim +${dailyEnergy} Energy`}
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-purple-900/60 bg-purple-950/20 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-300">
            Coming Soon
          </p>
          <h3 className="mt-2 text-2xl font-black uppercase">Marpo Run</h3>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            A lightweight action mini-game designed to earn Energy through
            daily activity and skill-based play.
          </p>
        </div>

        <div className="rounded-3xl border border-cyan-900/60 bg-cyan-950/20 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-300">
            Coming Soon
          </p>
          <h3 className="mt-2 text-2xl font-black uppercase">Fusion Lab</h3>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            A utility lab for combining future materials, points, and Energy
            into non-cash in-app progress items.
          </p>
        </div>

        <div className="rounded-3xl border border-lime-900/60 bg-lime-950/20 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-lime-300">
            Safe Utility
          </p>
          <h3 className="mt-2 text-2xl font-black uppercase">Reward Inventory</h3>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            Future home for Energy history, Spirit Points, and utility rewards.
            No betting or cash-prize mechanic is included in this phase.
          </p>
        </div>
      </div>
    </section>
  );
}