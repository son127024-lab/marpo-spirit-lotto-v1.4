import './globals.css';

// 1. 메타데이터: 마르포 그룹의 거버넌스 비전을 그대로 유지합니다.
export const metadata = {
  title: 'Marpo Oracle Command',
  description: 'Pi Network Governance',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="dark">
      <head>
        {/* 2. 폰트: Urbanist 900의 웅장한 스타일을 유지합니다. */}
        <link href="https://fonts.googleapis.com/css2?family=Urbanist:ital,wght@0,900;1,900&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-marpo-bg antialiased">
        {/* 3. 콘텐츠: 대표님이 깎아둔 UI가 렌더링되는 구역입니다. */}
        {children}

        {/* 4. 파이 네트워크 통신선: 중복을 제거하고 가장 안정적인 async 방식으로 배치했습니다. */}
        <script src="https://sdk.minepi.com/pi-sdk.js" async />
      </body>
    </html>
  );
}