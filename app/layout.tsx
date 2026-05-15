import "../styles/globals.css";
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
      </head>
      <body className="bg-marpo-bg antialiased">
        {children}
        <script src="https://sdk.minepi.com/pi-sdk.js" async />
      </body>
    </html>
  );
}