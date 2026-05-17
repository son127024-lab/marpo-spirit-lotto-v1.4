"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import MarpoSpiritPage from "../components/marpo-spirit-page";
import { usePiAuth } from "./pi-auth-provider";

type UserTier = "basic" | "premium" | "vip";

export default function MainGameLobby() {
  const [isReady, setIsReady] = useState(false);
  const [view, setView] = useState<"intro" | "subscription" | "dashboard">("intro");
  const [agreed, setAgreed] = useState(false);
  const [lang, setLang] = useState<"ko" | "en">("ko");

  const {
    user: piUser,
    isAuthenticating,
    error: authError,
    signIn,
  } = usePiAuth();

  useEffect(() => {
    setIsReady(true);
  }, []);

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
  };  const requestPiPaymentPermission = async () => {
    if (!window.Pi) {
      throw new Error("Pi SDK is not loaded.");
    }

    await window.Pi.authenticate(["payments"], (payment) => {
      console.log("Incomplete Pi payment found:", payment);
    });
  };

  const createSubscriptionPayment = async (tier: "premium" | "vip") => {
    if (!window.Pi) {
      throw new Error("Pi SDK is not loaded.");
    }

    if (!window.Pi.createPayment) {
      throw new Error("Pi payment SDK is not available.");
    }

    const amount = tier === "premium" ? 1 : 3;
    const orderId = `marpo_${tier}_${Date.now()}`;

    await requestPiPaymentPermission();

    return new Promise<void>((resolve, reject) => {
      let settled = false;

      const safeResolve = () => {
        if (!settled) {
          settled = true;
          resolve();
        }
      };

      const safeReject = (error: unknown) => {
        if (!settled) {
          settled = true;
          reject(error);
        }
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

              const data = await response.json();

              if (!response.ok || data.success !== true) {
                throw new Error(data.error || "Payment approval failed.");
              }
            } catch (error) {
              safeReject(error);
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

              const data = await response.json();

              if (!response.ok || data.success !== true) {
                throw new Error(data.error || "Payment completion failed.");
              }

              localStorage.setItem("marpo_session", "active");
              localStorage.setItem("marpo_tier", tier);
              localStorage.setItem("marpo_payment_id", paymentId);
              localStorage.setItem("marpo_payment_txid", txid);

              safeResolve();
            } catch (error) {
              safeReject(error);
            }
          },

          onCancel: (paymentId: string) => {
            console.log("Pi payment cancelled:", paymentId);
            safeReject(new Error("Payment was cancelled."));
          },

          onError: (error: unknown, payment?: unknown) => {
            console.error("Pi payment error:", error, payment);
            safeReject(
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
    }

    alert(
      lang === "ko"
        ? `[Demo Mode] Web3 SaaS 구독 시뮬레이션입니다.\n${tier.toUpperCase()} 등급 프로토콜이 가동됩니다.`
        : `[Demo Mode] Web3 SaaS Subscription Simulation.\n${tier.toUpperCase()} protocol activated.`
    );

    localStorage.setItem("marpo_session", "active");
    localStorage.setItem("marpo_tier", tier);
    setView("dashboard");
  };

  if (!isReady) return null;

  const t = {
    ko: {
      warnSub:
        "본 애플리케이션은 파이 코어팀(Pi Core Team) 및 생태계 검증을 위한 데모 버전입니다. 실제 Pi 코인은 차감되지 않습니다.",
      bold1: "마르포 그룹은 ",
      bold2: "이 Web3 SaaS 시스템을 활용하여, 파이 생태계의 순환경제를 완성합니다.",
      desc1:
        "단순한 일회성 결제를 넘어, SaaS(Software as a Service) 기반의 지속 가능한 구독 모델을 통해 Pi의 상시 유틸리티를 창출합니다. 이는 생태계 내에 고여있는 토큰을 끊임없이 순환시키고 가치를 재분배하는 강력한 혈관 역할을 수행합니다.",
      desc2:
        "우리는 파이오니어들의 장기적인 참여와 기여를 이끌어내는 고유의 전술적 운영 프로토콜을 통해, 공급과 수요의 균형을 맞추고 Pi의 거시적 희소성을 보호하는 '디플레이션 선순환' 체계를 구축하고자 합니다.",
      langBtn: "Read in English",
      agreeLabel: "마르포 그룹의 생태계 순환경제 비전에 동의합니다.",
      accessBtn: "Access Demo Subscription",
      signInBtn: "Sign in with Pi",
      subBasicDesc1: "기본 원소 탐색 권한",
      subBasicDesc2: "매회 광고 시청 필수",
      subBasicDesc3: "SaaS 기본 모듈 접속",
      subPremDesc1: "4시간 내 5회 연속 프리드로우",
      subPremDesc2: "광고 최소화 프로토콜 적용",
      subPremDesc3: "프리미엄 리워드 배율 적용",
      subVipDesc1: "10회 연속 압도적 프리드로우",
      subVipDesc2: "VIP 전용 에어드랍 알고리즘",
      subVipDesc3: "생태계 최우선권 보장",
      cancelBtn: "나중에 하기 (로비로 이동)",
    },
    en: {
      warnSub:
        "This application is a demo version for Pi Core Team and ecosystem validation. Real Pi coins will not be deducted.",
      bold1: "Marpo Group ",
      bold2: "completes the circular economy of the Pi ecosystem by utilizing this Web3 SaaS system.",
      desc1:
        "Beyond simple one-off payments, we create constant utility for Pi through a sustainable SaaS based subscription model. This acts as a powerful vascular system, continuously circulating stagnant tokens within the ecosystem and redistributing value.",
      desc2:
        "Through our unique tactical operational protocol that drives long-term participation and contribution from Pioneers, we aim to build a deflationary virtuous cycle system that balances supply and demand and protects the macroeconomic scarcity of Pi.",
      langBtn: "한국어로 보기",
      agreeLabel: "I agree with Marpo Group's vision of the ecosystem's circular economy.",
      accessBtn: "Access Demo Subscription",
      signInBtn: "Sign in with Pi",
      subBasicDesc1: "Basic element search access",
      subBasicDesc2: "Ad watching required per try",
      subBasicDesc3: "Basic SaaS module access",
      subPremDesc1: "5 consecutive free draws per 4 hrs",
      subPremDesc2: "Ad-minimization protocol applied",
      subPremDesc3: "Premium reward multiplier",
      subVipDesc1: "10 consecutive dominant free draws",
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
                ⚠️ Official Beta Testnet Demo ⚠️
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
              <h2 className="text-xl font-black text-amber-500 mb-4 uppercase tracking-widest">
                The Circular Economy Vision
              </h2>

              <p className="text-zinc-200 text-sm md:text-lg leading-relaxed mb-6 font-bold">
                {t[lang].bold1}
                <span className="text-amber-400">{t[lang].bold2}</span>
              </p>

              <div className="space-y-4 text-zinc-400 text-[12px] md:text-sm leading-relaxed">
                <p>{t[lang].desc1}</p>
                <p>{t[lang].desc2}</p>
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
          <h2 className="text-3xl md:text-4xl font-black text-white italic uppercase mb-10 tracking-widest">
            Select Tier Protocol
          </h2>

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

              <button
                onClick={() => handlePayment("premium")}
                className="w-full py-5 bg-amber-500 text-black rounded-xl font-black uppercase text-sm"
              >
                pay 1 pi
              </button>
            </div>

            <div className="bg-zinc-900 border border-lime-500/50 rounded-[3.5rem] p-8 flex flex-col items-center">
              <h3 className="text-xl font-black text-lime-400 uppercase mb-2">
                VIP
              </h3>
              <p className="text-3xl font-black text-white mb-6">3 Pi</p>

              <button
                onClick={() => handlePayment("vip")}
                className="w-full py-4 bg-lime-500 text-black rounded-xl font-black uppercase text-xs"
              >
                pay 3 pi
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
                  Web3 SaaS Demo
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-[10px] font-bold text-amber-400 uppercase">
                Commander: {piUser ? piUser.username : "Verified"}
              </div>

              <button
                onClick={() => {
                  localStorage.removeItem("marpo_session");
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