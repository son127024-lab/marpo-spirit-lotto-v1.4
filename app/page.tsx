"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import MarpoSpiritPage from "../components/marpo-spirit-page";
import { usePiAuth } from "./pi-auth-provider";

type UserTier = "basic" | "premium" | "vip";

type PaymentApiResponse = {
  success?: boolean;
  error?: string;
  [key: string]: unknown;
};

type PiIncompletePayment = {
  identifier?: string;
  paymentId?: string;
  amount?: number;
  memo?: string;
  metadata?: {
    tier?: "premium" | "vip";
    amount?: number;
    orderId?: string;
    [key: string]: unknown;
  };
  transaction?: {
    txid?: string;
    _id?: string;
  };
  txid?: string;
};

type MarpoSubscription = {
  status: "active" | "cancelled" | "expired";
  tier: "premium" | "vip";
  amount: number;
  paymentId?: string;
  txid?: string;
  orderId?: string;
  activatedAt: number;
  nextBillingAt: number;
  cancelAtPeriodEnd: boolean;
};

type SubscriptionApiResponse = PaymentApiResponse & {
  subscription?: (MarpoSubscription & Record<string, unknown>) | null;
};

export default function MainGameLobby() {
  const [isReady, setIsReady] = useState(false);
  const [view, setView] = useState<"intro" | "subscription" | "dashboard">(
    "intro"
  );
  const [agreed, setAgreed] = useState(false);
  const [lang, setLang] = useState<"ko" | "en">("ko");
  const [subscription, setSubscription] = useState<MarpoSubscription | null>(
    null
  );

  const {
    user: piUser,
    isAuthenticating,
    error: authError,
    signIn,
  } = usePiAuth();

  const readApiResponse = async (
    response: Response
  ): Promise<PaymentApiResponse> => {
    const text = await response.text();

    try {
      return JSON.parse(text) as PaymentApiResponse;
    } catch {
      return {
        success: false,
        error: `Server did not return valid JSON. Status: ${response.status}. Response: ${text.slice(
          0,
          200
        )}`,
      };
    }
  };

  const persistSubscriptionLocally = (data: MarpoSubscription) => {
    localStorage.setItem("marpo_subscription_state", JSON.stringify(data));
    localStorage.setItem("marpo_session", "active");
    localStorage.setItem("marpo_tier", data.tier);
    setSubscription(data);
  };

  const clearSubscriptionLocally = () => {
    localStorage.removeItem("marpo_subscription_state");
    localStorage.removeItem("marpo_session");
    localStorage.removeItem("marpo_tier");
    localStorage.removeItem("marpo_payment_id");
    localStorage.removeItem("marpo_payment_txid");
    setSubscription(null);
  };

  const normalizeServerSubscription = (
    data: SubscriptionApiResponse["subscription"]
  ): MarpoSubscription | null => {
    if (!data) return null;

    if (
      data.status !== "active" &&
      data.status !== "cancelled" &&
      data.status !== "expired"
    ) {
      return null;
    }

    if (data.tier !== "premium" && data.tier !== "vip") {
      return null;
    }

    if (typeof data.amount !== "number") return null;
    if (typeof data.activatedAt !== "number") return null;
    if (typeof data.nextBillingAt !== "number") return null;

    return {
      status: data.status,
      tier: data.tier,
      amount: data.amount,
      paymentId: typeof data.paymentId === "string" ? data.paymentId : undefined,
      txid: typeof data.txid === "string" ? data.txid : undefined,
      orderId: typeof data.orderId === "string" ? data.orderId : undefined,
      activatedAt: data.activatedAt,
      nextBillingAt: data.nextBillingAt,
      cancelAtPeriodEnd: data.cancelAtPeriodEnd === true,
    };
  };

  const syncSubscriptionToServer = async (data: MarpoSubscription) => {
    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const result = (await readApiResponse(response)) as SubscriptionApiResponse;

      if (!response.ok || result.success !== true) {
        console.warn("Subscription server sync failed:", result.error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Subscription server sync error:", error);
      return false;
    }
  };

  const fetchSubscriptionFromServer = async () => {
    try {
      const response = await fetch("/api/subscriptions", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const result = (await readApiResponse(response)) as SubscriptionApiResponse;

      if (!response.ok || result.success !== true) {
        console.warn("Subscription server fetch failed:", result.error);
        return null;
      }

      return normalizeServerSubscription(result.subscription);
    } catch (error) {
      console.error("Subscription server fetch error:", error);
      return null;
    }
  };

  const saveSubscription = (data: MarpoSubscription) => {
    persistSubscriptionLocally(data);
    void syncSubscriptionToServer(data);
  };

  const loadSubscription = () => {
    const raw = localStorage.getItem("marpo_subscription_state");

    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as MarpoSubscription;

      if (!parsed?.status || !parsed?.tier || !parsed?.activatedAt) {
        return null;
      }

      if (
        parsed.status === "active" &&
        parsed.nextBillingAt &&
        Date.now() > parsed.nextBillingAt
      ) {
        const expiredSubscription: MarpoSubscription = {
          ...parsed,
          status: "expired",
        };

        localStorage.setItem(
          "marpo_subscription_state",
          JSON.stringify(expiredSubscription)
        );

        void syncSubscriptionToServer(expiredSubscription);

        return expiredSubscription;
      }

      return parsed;
    } catch {
      return null;
    }
  };

  const cancelSubscription = async () => {
    let current = loadSubscription();

    if (!current) {
      current = await fetchSubscriptionFromServer();
    }

    if (!current) {
      alert(
        lang === "ko"
          ? "취소할 구독 상태가 없습니다."
          : "No subscription status found."
      );
      return;
    }

    const cancelled: MarpoSubscription = {
      ...current,
      status: "cancelled",
      cancelAtPeriodEnd: true,
    };

    persistSubscriptionLocally(cancelled);

    try {
      const response = await fetch("/api/subscriptions/cancel", {
        method: "POST",
        credentials: "include",
      });

      const result = (await readApiResponse(response)) as SubscriptionApiResponse;

      if (!response.ok || result.success !== true) {
        console.warn("Server subscription cancel failed:", result.error);
        void syncSubscriptionToServer(cancelled);
      }
    } catch (error) {
      console.error("Server subscription cancel error:", error);
      void syncSubscriptionToServer(cancelled);
    }

    alert(
      lang === "ko"
        ? "구독이 취소되었습니다. 현재 Testnet 프로토타입에서는 추가 자동 결제가 진행되지 않습니다."
        : "Subscription cancelled. In this Testnet prototype, no further automatic billing will continue."
    );
  };

  useEffect(() => {
    const savedSubscription = loadSubscription();

    if (
      savedSubscription &&
      savedSubscription.status === "active" &&
      savedSubscription.cancelAtPeriodEnd === false
    ) {
      setSubscription(savedSubscription);
      setView("dashboard");
    } else if (savedSubscription) {
      setSubscription(savedSubscription);
    }

    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!piUser) return;

    let isMounted = true;

    const syncFromServer = async () => {
      const serverSubscription = await fetchSubscriptionFromServer();

      if (!isMounted || !serverSubscription) return;

      persistSubscriptionLocally(serverSubscription);

      if (
        serverSubscription.status === "active" &&
        serverSubscription.cancelAtPeriodEnd === false
      ) {
        setView("dashboard");
      }
    };

    void syncFromServer();

    return () => {
      isMounted = false;
    };
  }, [piUser]);

  const showRewardedAd = async () => {
    const Pi = window.Pi;

    if (!Pi?.Ads?.showRewardedVideo) {
      alert("광고 시스템 연결 중... 잠시 후 다시 시도해 주세요.");
      return false;
    }

    try {
      const adResult = await Pi.Ads.showRewardedVideo();
      return adResult.adFinished;
    } catch (err) {
      console.error("광고 호출 실패:", err);
      alert("시청 가능한 광고가 없습니다.");
      return false;
    }
  };

  const handleIncompletePayment = async (
    payment: unknown
  ): Promise<boolean> => {
    const incompletePayment = payment as PiIncompletePayment;

    const paymentId =
      incompletePayment.identifier ?? incompletePayment.paymentId ?? null;

    const txid =
      incompletePayment.transaction?.txid ??
      incompletePayment.transaction?._id ??
      incompletePayment.txid ??
      null;

    const tier = incompletePayment.metadata?.tier;

    const amount =
      typeof incompletePayment.metadata?.amount === "number"
        ? incompletePayment.metadata.amount
        : incompletePayment.amount;

    const orderId =
      typeof incompletePayment.metadata?.orderId === "string"
        ? incompletePayment.metadata.orderId
        : `recovered_${Date.now()}`;

    console.log("Incomplete Pi payment found:", {
      paymentId,
      txid,
      tier,
      amount,
      orderId,
      payment: incompletePayment,
    });

    if (!paymentId || !txid || (tier !== "premium" && tier !== "vip")) {
      console.warn("Incomplete payment could not be recovered safely.");
      return false;
    }

    const expectedAmount = tier === "premium" ? 1 : 3;

    if (amount !== expectedAmount) {
      console.warn("Incomplete payment amount does not match tier.");
      return false;
    }

    const response = await fetch("/api/payments/complete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentId,
        txid,
        tier,
        amount,
        orderId,
      }),
    });

    const data = await readApiResponse(response);

    if (!response.ok || data.success !== true) {
      throw new Error(
        data.error ||
          `Incomplete payment recovery failed. Status: ${response.status}`
      );
    }

    const activatedAt = Date.now();
    const nextBillingAt = activatedAt + 30 * 24 * 60 * 60 * 1000;

    saveSubscription({
      status: "active",
      tier,
      amount: expectedAmount,
      paymentId,
      txid,
      orderId,
      activatedAt,
      nextBillingAt,
      cancelAtPeriodEnd: false,
    });

    localStorage.setItem("marpo_payment_id", paymentId);
    localStorage.setItem("marpo_payment_txid", txid);

    setView("dashboard");
    return true;
  };

  const requestPiPaymentPermission = async (): Promise<boolean> => {
    if (!window.Pi) {
      throw new Error("Pi SDK is not loaded.");
    }

    let recoveryPromise: Promise<boolean> | null = null;

    await window.Pi.authenticate(["username", "payments"], (payment) => {
      recoveryPromise = handleIncompletePayment(payment).catch((error) => {
        console.error("Failed to handle incomplete Pi payment:", error);
        return false;
      });
    });

    if (recoveryPromise) {
      return recoveryPromise;
    }

    return false;
  };

  const createSubscriptionPayment = async (tier: "premium" | "vip") => {
    if (!window.Pi) {
      throw new Error("Pi SDK is not loaded.");
    }

    if (!window.Pi.createPayment) {
      throw new Error("Pi payment SDK is not available.");
    }

    const recoveredIncompletePayment = await requestPiPaymentPermission();

    if (recoveredIncompletePayment) {
      return;
    }

    const amount = tier === "premium" ? 1 : 3;
    const orderId = `marpo_${tier}_${Date.now()}`;

    return new Promise<void>((resolve, reject) => {
      let finished = false;

      const finishSuccess = () => {
        if (finished) return;
        finished = true;
        resolve();
      };

      const finishFail = (error: unknown) => {
        if (finished) return;
        finished = true;

        reject(
          error instanceof Error ? error : new Error("Pi payment failed.")
        );
      };

      window.Pi!.createPayment!(
        {
          amount,
          memo:
            tier === "premium"
              ? "MARPO SPIRIT Premium Subscription Access"
              : "MARPO SPIRIT VIP Subscription Access",
          metadata: {
            app: "MARPO_SPIRIT",
            type: "subscription",
            tier,
            amount,
            orderId,
            purpose: "utility_access",
          },
        },
        {
          onReadyForServerApproval: async (paymentId: string) => {
            try {
              const response = await fetch("/api/payments/approve", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  paymentId,
                  tier,
                  amount,
                  orderId,
                }),
              });

              const data = await readApiResponse(response);

              if (!response.ok || data.success !== true) {
                throw new Error(
                  data.error ||
                    `Payment approval failed. Status: ${response.status}`
                );
              }
            } catch (error) {
              console.error("Payment approval error:", error);
              finishFail(error);
            }
          },

          onReadyForServerCompletion: async (
            paymentId: string,
            txid: string
          ) => {
            try {
              const response = await fetch("/api/payments/complete", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  paymentId,
                  txid,
                  tier,
                  amount,
                  orderId,
                }),
              });

              const data = await readApiResponse(response);

              if (!response.ok || data.success !== true) {
                throw new Error(
                  data.error ||
                    `Payment completion failed. Status: ${response.status}`
                );
              }

              const activatedAt = Date.now();
              const nextBillingAt = activatedAt + 30 * 24 * 60 * 60 * 1000;

              saveSubscription({
                status: "active",
                tier,
                amount,
                paymentId,
                txid,
                orderId,
                activatedAt,
                nextBillingAt,
                cancelAtPeriodEnd: false,
              });

              localStorage.setItem("marpo_payment_id", paymentId);
              localStorage.setItem("marpo_payment_txid", txid);

              finishSuccess();
            } catch (error) {
              console.error("Payment completion error:", error);
              finishFail(error);
            }
          },

          onCancel: (paymentId: string) => {
            console.log("Pi payment cancelled:", paymentId);
            finishFail(new Error("Payment was cancelled."));
          },

          onError: (error: unknown, payment?: unknown) => {
            console.error("Pi payment error:", error, payment);

            if (finished) return;

            finishFail(
              error instanceof Error ? error : new Error("Pi payment failed.")
            );
          },
        }
      );
    });
  };

  const handlePayment = async (tier: UserTier) => {
    if (!piUser) {
      await signIn();
      return;
    }

    if (tier === "basic") {
      const isFinished = await showRewardedAd();

      if (!isFinished) return;

      localStorage.setItem("marpo_session", "active");
      localStorage.setItem("marpo_tier", "basic");
      setView("dashboard");
      return;
    }

    try {
      await createSubscriptionPayment(tier);

      alert(
        lang === "ko"
          ? `${tier.toUpperCase()} Testnet 자동구독 프로토타입이 활성화되었습니다.`
          : `${tier.toUpperCase()} Testnet auto-subscription prototype activated.`
      );

      setView("dashboard");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Payment failed.";

      console.error("Subscription payment error:", error);

      alert(
        lang === "ko"
          ? `Pi 결제에 실패했습니다. ${message}`
          : `Pi payment failed. ${message}`
      );
    }
  };

  if (!isReady) return null;

  const t = {
    ko: {
      warnSub:
        "MARPO SPIRIT은 Pi Network 기반 Web3 유틸리티 리워드 플랫폼입니다. 본 앱은 도박, 베팅, 현실 화폐 로또, 증권, 투자 서비스를 제공하지 않습니다.",

      platformTitle: "Pi Network 기반 Web3 유틸리티 리워드 플랫폼",
      visionTitle: "MARPO GROUP 순환경제 비전",

      visionDesc1:
        "MARPO SPIRIT은 Pi 생태계 안에서 순환형 참여 경제를 만들기 위해 설계되었습니다. 사용자는 Pi 인증을 통해 접속하고, MAR 에너지, 디지털 원소 발견, 숙성, 금고 보관, 융합 시스템을 통해 앱 내부 유틸리티 경제에 참여합니다.",

      visionDesc2:
        "이 앱에 참여하는 것은 Pi의 실제 사용성, 앱 기반 활동, 생태계 내부 순환에 기여하는 것을 목표로 합니다. Pi를 단순히 보유하는 것에 머무르지 않고, 실제 서비스 안에서 사용하고 참여하는 경험을 제공합니다.",

      visionDesc3:
        "MAR Energy는 앱 내부 참여도와 진행 상태를 나타내는 유틸리티 포인트입니다. 향후 기술 개발, 생태계 규칙, 준법 요건을 충족하는 경우 MARPO GROUP 산하의 디지털 서비스 또는 MARPO 관련 유틸리티 시스템과 연동될 수 있습니다.",

      noticeTitle: "중요 안내",

      noticeDesc:
        "MARPO SPIRIT은 엔터테인먼트 및 유틸리티 기반 리워드 플랫폼입니다. 본 앱은 도박, 베팅, 현실 화폐 로또, 증권, 투자 서비스를 제공하지 않습니다. 앱 내부의 포인트, 원소, 융합제, 융합 결과는 앱 유틸리티와 참여 경험을 위한 목적으로만 사용됩니다. 금전적 수익, 토큰 가치, 보상은 보장되지 않습니다.",

      langBtn: "Read in English",
      agreeLabel: "마르포 그룹의 생태계 순환경제 비전에 동의합니다.",
      accessBtn: "구독 페이지 접속",
      signInBtn: "Pi로 로그인",

      subBasicDesc1: "기본 원소 탐색 권한",
      subBasicDesc2: "매회 광고 시청 필수",
      subBasicDesc3: "SaaS 기본 모듈 접속",

      subPremDesc1: "4시간 내 5회 연속 프리드로우",
      subPremDesc2: "광고 최소화 프로토콜 적용",
      subPremDesc3: "프리미엄 리워드 배율 적용",

      subVipDesc1: "10회 연속 향상된 프리드로우",
      subVipDesc2: "VIP 전용 에어드랍 알고리즘",
      subVipDesc3: "생태계 최우선권 보장",

      cancelBtn: "나중에 하기 (로비로 이동)",
    },

    en: {
      warnSub:
        "MARPO SPIRIT is a Pi Network-based Web3 utility reward platform. It does not provide gambling, betting, cash lottery, securities, or investment services.",

      platformTitle: "Web3 Utility Reward Platform on Pi Network",
      visionTitle: "MARPO GROUP Circular Economy Vision",

      visionDesc1:
        "MARPO SPIRIT is designed to create a circular participation economy inside the Pi ecosystem. Users sign in with Pi and participate in an in-app utility economy through MAR Energy, digital element discovery, maturation, vault storage, and fusion mechanics.",

      visionDesc2:
        "Participation in this app is intended to support Pi utility, app-based activity, and ecosystem circulation. The goal is to help Pi move beyond passive holding and into real service-based usage and engagement.",

      visionDesc3:
        "MAR Energy is an in-app utility point system that reflects user participation and progression. In the future, subject to technical development, ecosystem rules, and compliance requirements, MAR Energy may connect with MARPO GROUP digital services or MARPO-related utility systems.",

      noticeTitle: "Important Notice",

      noticeDesc:
        "MARPO SPIRIT is an entertainment and utility-based reward platform. It does not provide gambling, betting, real-money lottery, securities, or investment services. All in-app points, elements, catalysts, and fusion results are for app utility and engagement purposes only. No financial return, token value, or monetary reward is guaranteed.",

      langBtn: "한국어로 보기",
      agreeLabel:
        "I agree with Marpo Group's vision of the ecosystem's circular economy.",
      accessBtn: "Access Subscription",
      signInBtn: "Sign in with Pi",

      subBasicDesc1: "Basic element search access",
      subBasicDesc2: "Ad watching required per try",
      subBasicDesc3: "Basic SaaS module access",

      subPremDesc1: "5 consecutive free draws per 4 hrs",
      subPremDesc2: "Ad-minimization protocol applied",
      subPremDesc3: "Premium reward multiplier",

      subVipDesc1: "10 enhanced consecutive free draws",
      subVipDesc2: "VIP-exclusive airdrop algorithm",
      subVipDesc3: "Top priority in the ecosystem",

      cancelBtn: "Cancel & Go Back",
    },
  };

  return (
    <>
      {view === "intro" && (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(#f39c12 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative z-10 w-full max-w-4xl flex flex-col items-center gap-6 bg-black/60 p-10 rounded-[3rem] border border-zinc-800 backdrop-blur-md shadow-2xl mt-10">
            <div className="w-full bg-gradient-to-r from-red-600/80 via-red-500/80 to-red-600/80 p-3 rounded-2xl border-2 border-red-400 text-center mb-4 shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse">
              <h2 className="text-white font-black uppercase tracking-widest text-sm md:text-base">
                ⚠️ Official Beta Testnet Utility Notice ⚠️
              </h2>
              <p className="text-white/90 text-xs mt-1 font-bold">
                {t[lang].warnSub}
              </p>
            </div>

            <div className="relative w-40 h-40 md:w-48 md:h-48 mb-2 animate-pulse-slow">
              <Image
                src="/marpo-logo.png"
                alt="MARPO GROUP LOGO"
                fill
                className="object-contain drop-shadow-[0_0_30px_rgba(185,28,28,0.4)]"
                priority
              />
            </div>

            <div className="text-center flex flex-col items-center">
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-amber-500 italic uppercase leading-none">
                MARPO SPIRIT
              </h1>
              <p className="text-2xl md:text-3xl font-black text-white mt-3 italic tracking-widest">
                Mar point
              </p>

              <div className="mt-4 flex flex-col items-center gap-1">
                <p className="text-lg md:text-xl font-black text-amber-400 tracking-[0.3em] uppercase">
                  L.O.T.T.O WORLD
                </p>
                <p className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-widest">
                  ( Loyalty Optimized Token Tactical Operations )
                </p>
              </div>
            </div>

            <div className="w-full bg-zinc-900/80 p-6 md:p-8 rounded-3xl border border-zinc-700 text-left mt-2">
              <h2 className="text-xl font-black text-amber-500 mb-2 uppercase tracking-widest">
                {t[lang].visionTitle}
              </h2>

              <p className="text-sm md:text-base text-zinc-300 font-bold mb-4">
                {t[lang].platformTitle}
              </p>

              <div className="space-y-4 text-zinc-400 text-[12px] md:text-sm leading-relaxed">
                <p>{t[lang].visionDesc1}</p>
                <p>{t[lang].visionDesc2}</p>
                <p>{t[lang].visionDesc3}</p>
              </div>

              <div className="mt-6 bg-black/60 border border-amber-500/30 rounded-2xl p-4">
                <h3 className="text-amber-400 text-xs font-black uppercase tracking-widest mb-2">
                  {t[lang].noticeTitle}
                </h3>
                <p className="text-zinc-400 text-[11px] md:text-xs leading-relaxed">
                  {t[lang].noticeDesc}
                </p>
              </div>
            </div>

            <button
              onClick={() => setLang(lang === "ko" ? "en" : "ko")}
              className="px-5 py-2.5 rounded-full border border-zinc-700 bg-zinc-800/80 text-zinc-300 text-xs font-bold uppercase"
            >
              {lang === "ko" ? "🇺🇸 Read in English" : "🇰🇷 한국어로 보기"}
            </button>

            <div
              onClick={() => setAgreed(!agreed)}
              className="flex items-center gap-4 cursor-pointer p-2 rounded-xl hover:bg-zinc-900/50 w-full justify-center"
            >
              <div
                className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center ${
                  agreed ? "bg-amber-500 border-amber-500" : "border-zinc-500"
                }`}
              >
                {agreed && <span className="text-black font-black">✓</span>}
              </div>

              <span className="text-zinc-300 font-bold text-sm md:text-base">
                {t[lang].agreeLabel}
              </span>
            </div>

            {piUser ? (
              <p className="text-xs font-bold text-lime-400 mt-2">
                Verified as @{piUser.username}
              </p>
            ) : authError ? (
              <p className="text-xs font-bold text-red-400 mt-2 text-center">
                {authError}
              </p>
            ) : (
              <p className="text-xs font-bold text-zinc-500 mt-2">
                {isAuthenticating
                  ? "Waiting for Pi sign-in..."
                  : "Pi sign-in will start automatically."}
              </p>
            )}

            <div className="flex flex-col md:flex-row gap-3">
              <button
                onClick={signIn}
                disabled={isAuthenticating}
                className="font-black uppercase italic tracking-widest px-8 py-4 rounded-2xl transition-all bg-zinc-800 text-amber-400 hover:scale-105 border border-amber-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAuthenticating ? "CONNECTING PI..." : t[lang].signInBtn}
              </button>

              <button
                onClick={async () => {
                  if (!piUser) {
                    await signIn();
                    return;
                  }

                  setView("subscription");
                }}
                disabled={!agreed || isAuthenticating}
                className={`font-black uppercase italic tracking-widest px-12 py-5 rounded-2xl transition-all ${
                  agreed
                    ? "bg-amber-500 text-black hover:scale-105 shadow-[0_0_30px_rgba(243,156,18,0.4)]"
                    : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                }`}
              >
                {isAuthenticating ? "CONNECTING PI..." : t[lang].accessBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {view === "subscription" && (
        <div className="min-h-screen w-full bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative">
          <h2 className="text-3xl md:text-4xl font-black text-white italic uppercase mb-6 tracking-widest">
            Select Tier Protocol
          </h2>

          <div className="w-full max-w-4xl bg-black/60 border border-amber-500/30 rounded-3xl p-5 mb-8 text-center">
            <h3 className="text-amber-400 text-xs font-black uppercase tracking-widest mb-2">
              {t[lang].noticeTitle}
            </h3>
            <p className="text-zinc-400 text-[11px] md:text-xs leading-relaxed">
              {t[lang].noticeDesc}
            </p>

            <p className="text-amber-400 text-[10px] md:text-xs leading-relaxed mt-3 font-bold">
              {lang === "ko"
                ? "현재 이 기능은 Pi Testnet 자동구독 프로토타입입니다. 자동구독 활성화 시 테스트 주기에 따라 Test Pi 반복 결제를 시뮬레이션하며, 사용자는 언제든지 구독을 취소할 수 있습니다."
                : "This feature is a Pi Testnet auto-subscription prototype. When activated, it simulates recurring Test Pi billing on a test schedule, and users can cancel the subscription at any time."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
            <div className="bg-zinc-900 border border-zinc-700 rounded-[3.5rem] p-8 flex flex-col items-center">
              <h3 className="text-xl font-black text-zinc-400 uppercase mb-2">
                Basic
              </h3>
              <p className="text-3xl font-black text-white mb-6">0 Pi</p>

              <ul className="text-zinc-500 text-[11px] font-bold space-y-3 mb-8">
                <li>{t[lang].subBasicDesc1}</li>
                <li>{t[lang].subBasicDesc2}</li>
                <li>{t[lang].subBasicDesc3}</li>
              </ul>

              <button
                onClick={() => handlePayment("basic")}
                className="w-full py-4 bg-zinc-800 text-white rounded-xl font-black uppercase text-xs"
              >
                Free Access (Ad Required)
              </button>
            </div>

            <div className="bg-zinc-900 border-2 border-amber-500 rounded-[3.5rem] p-8 flex flex-col items-center transform md:-translate-y-4">
              <h3 className="text-xl font-black text-amber-500 uppercase mb-2">
                Premium
              </h3>
              <p className="text-5xl font-black text-white mb-6">1 Pi</p>

              <ul className="text-zinc-500 text-[11px] font-bold space-y-3 mb-8">
                <li>{t[lang].subPremDesc1}</li>
                <li>{t[lang].subPremDesc2}</li>
                <li>{t[lang].subPremDesc3}</li>
              </ul>

              <button
                onClick={() => handlePayment("premium")}
                className="w-full py-5 bg-amber-500 text-black rounded-xl font-black uppercase text-sm"
              >
                Activate Premium Beta - 1 Pi
              </button>
            </div>

            <div className="bg-zinc-900 border border-lime-500/50 rounded-[3.5rem] p-8 flex flex-col items-center">
              <h3 className="text-xl font-black text-lime-400 uppercase mb-2">
                VIP
              </h3>
              <p className="text-3xl font-black text-white mb-6">3 Pi</p>

              <ul className="text-zinc-500 text-[11px] font-bold space-y-3 mb-8">
                <li>{t[lang].subVipDesc1}</li>
                <li>{t[lang].subVipDesc2}</li>
                <li>{t[lang].subVipDesc3}</li>
              </ul>

              <button
                onClick={() => handlePayment("vip")}
                className="w-full py-4 bg-lime-500 text-black rounded-xl font-black uppercase text-xs"
              >
                Activate VIP Beta - 3 Pi
              </button>
            </div>
          </div>

          <button
            onClick={() => setView("intro")}
            className="mt-12 text-zinc-500 text-[10px] font-bold underline"
          >
            {t[lang].cancelBtn}
          </button>
        </div>
      )}

      {view === "dashboard" && (
        <div className="min-h-screen w-full bg-[#050505] text-white relative flex flex-col items-center">
          <header className="w-full p-4 md:px-10 flex justify-between items-center z-50 bg-black/50 backdrop-blur-md sticky top-0 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8">
                <Image
                  src="/marpo-logo.png"
                  alt="Symbol"
                  fill
                  className="object-contain"
                />
              </div>

              <div className="flex flex-col">
                <h2 className="text-[10px] md:text-xs font-black text-zinc-400 uppercase italic tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
                  Pi Connected
                </h2>

                <span className="text-[8px] text-amber-500 font-bold uppercase">
                  Web3 SaaS Utility
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-[10px] font-bold text-amber-400 uppercase">
                Commander: {piUser ? piUser.username : "Verified"}
              </div>

              {subscription && (
                <div className="hidden md:flex flex-col text-[9px] text-zinc-400 font-bold uppercase">
                  <span>Tier: {subscription.tier}</span>
                  <span>Status: {subscription.status}</span>
                  <span>
                    Next Test Billing:{" "}
                    {new Date(subscription.nextBillingAt).toLocaleDateString()}
                  </span>
                </div>
              )}

              {subscription?.status === "active" && (
                <button
                  onClick={cancelSubscription}
                  className="text-red-400 hover:text-red-300 text-[9px] font-bold uppercase border border-red-900/60 px-3 py-1 rounded-full"
                >
                  Cancel Subscription
                </button>
              )}

              <button
                onClick={() => {
                  clearSubscriptionLocally();
                  setView("intro");
                }}
                className="text-zinc-500 hover:text-amber-500 text-[9px] font-bold uppercase border border-zinc-800 px-3 py-1 rounded-full"
              >
                Disconnect
              </button>
            </div>
          </header>

          <main className="w-full flex-1 relative">
            <MarpoSpiritPage lang={lang} />
          </main>
        </div>
      )}
    </>
  );
}
