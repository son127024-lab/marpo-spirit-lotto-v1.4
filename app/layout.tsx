import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import PiAuthProvider from "./pi-auth-provider";


export const metadata: Metadata = {
  title: "Marpo Oracle Command",
  description: "Pi Network Governance",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="ko" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Urbanist:ital,wght@0,900;1,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-marpo-bg antialiased">
        <PiAuthProvider>{children}</PiAuthProvider>
      </body>
    </html>
  );
}