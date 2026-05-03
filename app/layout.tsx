import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Marpo Spirit - Lotto World',
  description: 'Global Pi Network Jackpot',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* 🚀 파이 네트워크 공식 결제 엔진(SDK) 케이블 🚀 */}
        <script src="https://sdk.minepi.com/pi-sdk.js" async></script>
      </head>
      <body className="bg-black text-white">
        {children}
      </body>
    </html>
  );
}