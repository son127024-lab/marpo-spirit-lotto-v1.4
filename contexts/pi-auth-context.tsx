"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

declare const Pi: any;

const isDevelopment = process.env.NODE_ENV === 'development';

const PiAuthContext = createContext<any>(null);

export default function PiAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    
    if (typeof window !== "undefined" && typeof Pi !== "undefined") {
      
      
      Pi.init({ version: "2.0", sandbox: isDevelopment });

    
      async function authUser() {
        try {
          const scopes = ["username", "payments"];
          
          
          const auth = await Pi.authenticate(scopes, (onIncompletePaymentFound: any) => {
            console.log("미결제 건 발견:", onIncompletePaymentFound);
          });
          
          console.log("인증 성공:", auth.user);
          setUser(auth.user); 
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