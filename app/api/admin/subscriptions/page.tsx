"use client";

import { useMemo, useState } from "react";

type AdminSubscription = {
  id?: string;
  username?: string;
  uid?: string | null;
  status?: "active" | "cancelled" | "expired";
  tier?: "premium" | "vip";
  amount?: number;
  paymentId?: string | null;
  txid?: string | null;
  orderId?: string | null;
  activatedAt?: number;
  nextBillingAt?: number;
  cancelAtPeriodEnd?: boolean;
  createdAt?: number;
  updatedAt?: number;
};

type AdminApiResponse = {
  success: boolean;
  error?: string;
  summary?: {
    total: number;
    active: number;
    cancelled: number;
    expired: number;
  };
  subscriptions?: AdminSubscription[];
};

function formatDate(value?: number) {
  if (!value || typeof value !== "number") return "-";

  return new Date(value).toLocaleString();
}

function shortValue(value?: string | null) {
  if (!value) return "-";
  if (value.length <= 14) return value;

  return `${value.slice(0, 7)}...${value.slice(-6)}`;
}

export default function AdminSubscriptionsPage() {
  const [adminKey, setAdminKey] = useState("");
  const [status, setStatus] = useState("all");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState<AdminApiResponse["summary"] | null>(
    null
  );
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);

  const canLoad = useMemo(() => adminKey.trim().length > 0, [adminKey]);

  const loadSubscriptions = async () => {
    if (!canLoad) {
      setError("Enter the admin monitor key first.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      params.set("status", status);

      if (username.trim()) {
        params.set("username", username.trim());
      }

      const response = await fetch(
        `/api/admin/subscriptions?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "x-admin-key": adminKey.trim(),
          },
          cache: "no-store",
        }
      );

      const text = await response.text();

      let data: AdminApiResponse;

      try {
        data = JSON.parse(text) as AdminApiResponse;
      } catch {
        throw new Error(
          `Server did not return valid JSON. Status: ${
            response.status
          }. Response: ${text.slice(0, 200)}`
        );
      }

      if (!response.ok || data.success !== true) {
        throw new Error(data.error || "Failed to load subscriptions.");
      }

      setSummary(data.summary ?? null);
      setSubscriptions(data.subscriptions ?? []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load subscriptions.";

      setError(message);
      setSummary(null);
      setSubscriptions([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white p-5 md:p-10">
      <section className="max-w-7xl mx-auto space-y-6">
        <div className="border border-zinc-800 bg-black/60 rounded-3xl p-6 md:p-8">
          <p className="text-[10px] uppercase tracking-[0.4em] text-amber-500 font-black">
            MARPO GROUP ADMIN
          </p>
          <h1 className="text-3xl md:text-5xl font-black italic uppercase mt-2">
            Subscription Monitor
          </h1>
          <p className="text-zinc-400 text-xs md:text-sm mt-3 max-w-3xl leading-relaxed">
            Internal monitor for MARPO SPIRIT Pi Testnet subscription prototype.
            This page reads MongoDB subscription records through a protected
            server route.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.6fr_0.6fr_auto] gap-3 border border-zinc-800 bg-zinc-950/80 rounded-3xl p-4">
          <input
            type="password"
            value={adminKey}
            onChange={(event) => setAdminKey(event.target.value)}
            placeholder="ADMIN_MONITOR_KEY"
            className="bg-black border border-zinc-800 rounded-2xl px-4 py-3 text-sm outline-none focus:border-amber-500"
          />

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="bg-black border border-zinc-800 rounded-2xl px-4 py-3 text-sm outline-none focus:border-amber-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
          </select>

          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Search username"
            className="bg-black border border-zinc-800 rounded-2xl px-4 py-3 text-sm outline-none focus:border-amber-500"
          />

          <button
            type="button"
            onClick={loadSubscriptions}
            disabled={isLoading}
            className="bg-amber-500 text-black rounded-2xl px-6 py-3 text-sm font-black uppercase disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Load"}
          </button>
        </div>

        {error && (
          <div className="border border-red-900/70 bg-red-950/30 text-red-300 rounded-2xl p-4 text-sm font-bold">
            {error}
          </div>
        )}

        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5">
              <p className="text-zinc-500 text-[10px] font-black uppercase">
                Loaded
              </p>
              <p className="text-3xl font-black">{summary.total}</p>
            </div>
            <div className="bg-zinc-950 border border-lime-900/60 rounded-3xl p-5">
              <p className="text-zinc-500 text-[10px] font-black uppercase">
                Active
              </p>
              <p className="text-3xl font-black text-lime-400">
                {summary.active}
              </p>
            </div>
            <div className="bg-zinc-950 border border-red-900/60 rounded-3xl p-5">
              <p className="text-zinc-500 text-[10px] font-black uppercase">
                Cancelled
              </p>
              <p className="text-3xl font-black text-red-400">
                {summary.cancelled}
              </p>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5">
              <p className="text-zinc-500 text-[10px] font-black uppercase">
                Expired
              </p>
              <p className="text-3xl font-black text-zinc-300">
                {summary.expired}
              </p>
            </div>
          </div>
        )}

        <div className="overflow-x-auto border border-zinc-800 rounded-3xl bg-black/70">
          <table className="w-full min-w-[1100px] text-left text-xs">
            <thead className="bg-zinc-950 text-zinc-400 uppercase text-[10px]">
              <tr>
                <th className="p-4">Username</th>
                <th className="p-4">Tier</th>
                <th className="p-4">Status</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Next Billing</th>
                <th className="p-4">Cancel</th>
                <th className="p-4">Payment ID</th>
                <th className="p-4">TXID</th>
                <th className="p-4">Updated</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.length === 0 ? (
                <tr>
                  <td className="p-6 text-zinc-500" colSpan={9}>
                    No subscription records loaded.
                  </td>
                </tr>
              ) : (
                subscriptions.map((item) => (
                  <tr
                    key={item.id ?? `${item.username}-${item.paymentId}`}
                    className="border-t border-zinc-900 hover:bg-zinc-950/80"
                  >
                    <td className="p-4 font-bold text-amber-400">
                      {item.username ?? "-"}
                    </td>
                    <td className="p-4 uppercase">{item.tier ?? "-"}</td>
                    <td className="p-4 uppercase">
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-black ${
                          item.status === "active"
                            ? "bg-lime-950 text-lime-400"
                            : item.status === "cancelled"
                              ? "bg-red-950 text-red-400"
                              : "bg-zinc-900 text-zinc-400"
                        }`}
                      >
                        {item.status ?? "-"}
                      </span>
                    </td>
                    <td className="p-4">{item.amount ?? "-"} Pi</td>
                    <td className="p-4">{formatDate(item.nextBillingAt)}</td>
                    <td className="p-4">
                      {item.cancelAtPeriodEnd ? "Yes" : "No"}
                    </td>
                    <td className="p-4 font-mono">
                      {shortValue(item.paymentId)}
                    </td>
                    <td className="p-4 font-mono">{shortValue(item.txid)}</td>
                    <td className="p-4">{formatDate(item.updatedAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}