import './globals.css';
import Script from 'next/script';

export const metadata = {
  title: 'Marpo Mining Oracle',
  description: 'Pi Network Ecosystem',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        {/* 파이 브라우저 SDK - 최우선 로드 */}
        <Script 
          src="https://sdk.minepi.com/pi-sdk.js" 
          strategy="beforeInteractive" 
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}