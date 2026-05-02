"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

declare const Pi: any;

const isDevelopment = process.env.NODE_ENV === 'development';

const PiAuthContext = createContext<any>(null);

export default function PiAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 1. 브라우저 환경이고 Pi 엔진이 로드되었는지 확인
    if (typeof window !== "undefined" && typeof Pi !== "undefined") {
      
      // 2. 파이 엔진 초기화
      Pi.init({ version: "2.0", sandbox: isDevelopment });

      // 3. 접속하자마자 자동으로 "이 사람 누구야?"라고 파이 서버에 묻기 (인증 강제 실행)
      async function authUser() {
        try {
          const scopes = ["username", "payments"];
          
          // 이 함수가 실행되면서 권한 창이 뜨거나, 이미 승인했다면 정보를 가져옵니다.
          const auth = await Pi.authenticate(scopes, (onIncompletePaymentFound: any) => {
            console.log("미결제 건 발견:", onIncompletePaymentFound);
          });
          
          console.log("인증 성공:", auth.user);
          setUser(auth.user); // 찾은 아이디를 바구니에 담기
        } catch (err) {
          console.error("인증 실패:", err);
        }
      }

      authUser();
    }
  }, []);

  return (
    <PiAuthContext.Provider value={{ user, setUser }}>
      {children}
    </PiAuthContext.Provider>
  );
}

export function usePiAuth() {
  return useContext(PiAuthContext);
}