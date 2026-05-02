
"use client";

import type { ReactNode } from "react";
// PiAuthProvider는 그냥, usePiAuth는 중괄호 { } 안에!
import PiAuthProvider, { usePiAuth } from "@/contexts/pi-auth-context";
import { AuthLoadingScreen } from "./auth-loading-screen";

function AppContent({ children }: { children: ReactNode }) {
  // context에서 isAuthenticated(인증여부)를 가져옵니다.npm run 
  const { user } = usePiAuth(); 
  
  // 만약 user 정보가 아직 없으면 로딩 화면을 보여줍니다.
  if (!user) return <AuthLoadingScreen />;
  
  return <>{children}</>;
}

export function AppWrapper({ children }: { children: ReactNode }) {
  return (
    <PiAuthProvider>
      <AppContent>{children}</AppContent>
    </PiAuthProvider>
  );
}