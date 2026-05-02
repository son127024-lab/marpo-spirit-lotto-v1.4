import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "Made with App Studio",
  description: "A weekly lotto game where each player selects 10 numbers from 1 to 100",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>Made with App Studio</title>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.style.fontFamily};
  --font-mono: ${GeistMono.style.fontFamily};
}
        `}</style>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
