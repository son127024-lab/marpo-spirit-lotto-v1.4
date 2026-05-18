"use client";

import Script from "next/script";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type PiUser = {
  uid?: string | null;
  username: string;
};

type PiAuthContextValue = {
  user: PiUser | null;
  isReady: boolean;
  isAuthenticating: boolean;
  error: string | null;
  signIn: () => Promise<void>;
};

type PiAuthApiResponse = {
  success: boolean;
  error?: string;
  user?: {
    uid?: string | null;
    username?: string;
  };
};

const PiAuthContext = createContext<PiAuthContextValue | null>(null);

export function PiAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PiUser | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initPromiseRef = useRef<Promise<void> | null>(null);
  const autoAuthStartedRef = useRef(false);

  const initPi = useCallback(async () => {
    if (typeof window === "undefined" || !window.Pi) {
      throw new Error("Pi SDK is not loaded");
    }

    if (!initPromiseRef.current) {
      initPromiseRef.current = Promise.resolve(
        window.Pi.init({
          version: "2.0",
          sandbox: process.env.NEXT_PUBLIC_PI_SANDBOX === "true",
        })
      );
    }

    await initPromiseRef.current;
  }, []);

  const signIn = useCallback(async () => {
    if (typeof window === "undefined" || !window.Pi) {
      setError("Pi SDK is not loaded");
      return;
    }

    if (isAuthenticating) return;

    setIsAuthenticating(true);
    setError(null);

    try {
      await initPi();

      const authResult = await window.Pi.authenticate(
        ["username"],
        (payment) => {
          console.log("Incomplete Pi payment found:", payment);
        }
      );

      if (!authResult?.accessToken) {
        throw new Error("Pi access token was not returned");
      }

      const response = await fetch("/api/auth/pi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          accessToken: authResult.accessToken,
        }),
      });

      const responseText = await response.text();

      let data: PiAuthApiResponse;

      try {
        data = JSON.parse(responseText) as PiAuthApiResponse;
      } catch {
        throw new Error(
          `Backend did not return valid JSON. Status: ${
            response.status
          }. Response: ${responseText.slice(0, 200)}`
        );
      }

      if (!response.ok) {
        throw new Error(
          data.success === false ? data.error : "Pi authentication failed"
        );
      }

      if (data.success !== true) {
        throw new Error(data.error || "Pi authentication failed");
      }

      if (!data.user || !data.user.username) {
        throw new Error("Pi authentication succeeded but user data is missing.");
      }

      const authenticatedUser: PiUser = {
        uid: data.user.uid ?? null,
        username: data.user.username,
      };

      localStorage.setItem("marpo_pi_username", authenticatedUser.username);

      if (authenticatedUser.uid) {
        localStorage.setItem("marpo_pi_uid", authenticatedUser.uid);
      } else {
        localStorage.removeItem("marpo_pi_uid");
      }

      setUser(authenticatedUser);

      if (window.Pi.Ads?.preloadRewardedVideo) {
        await Promise.resolve(window.Pi.Ads.preloadRewardedVideo());
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Pi authentication failed";

      console.error("Pi Authentication Error:", err);
      setError(message);
      setUser(null);
      localStorage.removeItem("marpo_pi_username");
      localStorage.removeItem("marpo_pi_uid");
    } finally {
      setIsAuthenticating(false);
    }
  }, [initPi, isAuthenticating]);

  const triggerAutoAuth = useCallback(() => {
    if (autoAuthStartedRef.current || user) return;

    autoAuthStartedRef.current = true;
    void signIn();
  }, [signIn, user]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.Pi) {
      setIsReady(true);
      triggerAutoAuth();
    }
  }, [triggerAutoAuth]);

  return (
    <PiAuthContext.Provider
      value={{
        user,
        isReady,
        isAuthenticating,
        error,
        signIn,
      }}
    >
      <Script
        src="https://sdk.minepi.com/pi-sdk.js"
        strategy="afterInteractive"
        onLoad={() => {
          setIsReady(true);
          triggerAutoAuth();
        }}
        onError={() => {
          setError("Failed to load Pi SDK");
        }}
      />

      {children}

      {!user && (
        <button
          type="button"
          onClick={signIn}
          disabled={isAuthenticating}
          className="fixed right-4 bottom-4 z-[9999] rounded-full bg-purple-600 px-5 py-3 text-sm font-black text-white shadow-2xl disabled:opacity-60"
        >
          {isAuthenticating ? "CONNECTING PI..." : "PI SIGN IN"}
        </button>
      )}
    </PiAuthContext.Provider>
  );
}

export function usePiAuth() {
  const context = useContext(PiAuthContext);

  if (!context) {
    throw new Error("usePiAuth must be used inside PiAuthProvider");
  }

  return context;
}

export default PiAuthProvider;