// app/layout.tsx
import './globals.css'
import Script from 'next/script' // Next.js 스크립트 최적화 도구

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        {/* 파이 브라우저 연동을 위한 공식 SDK */}
        <Script 
          src="https://sdk.minepi.com/pi-sdk.js" 
          strategy="beforeInteractive" 
        />
      </head>
      <body>{children}</body>
    </html>
  )
}