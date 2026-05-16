"use client";

import type { ReactNode } from "react";
import { usePiAuth } from "@/app/pi-auth-provider";
import { AuthLoadingScreen } from "./auth-loading-screen";

function AppContent({ children }: { children: ReactNode }) {
  const { user, isAuthenticating } = usePiAuth();

  if (!user && isAuthenticating) {
    return <AuthLoadingScreen />;
  }

  return <>{children}</>;
}

export function AppWrapper({ children }: { children: ReactNode }) {
  return <AppContent>{children}</AppContent>;
}