import './globals.css';
import Script from 'next/script';

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
        <link href="https://fonts.googleapis.com/css2?family=Urbanist:ital,wght@0,900;1,900&display=swap" rel="stylesheet" />
        <Script 
          src="https://sdk.minepi.com/pi-sdk.js" 
          strategy="beforeInteractive" 
        />
      </head>
      <body className="bg-marpo-bg antialiased">
        {children}
      </body>
    </html>
  );
}