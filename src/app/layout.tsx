import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "BisikLagu - Bisikan Pesan & Melodi Rahasia",
    template: "%s | BisikLagu",
  },
  description: "Kirim dan terima pesan rahasia lengkap dengan lagu favorit secara anonim.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "BisikLagu - Bisikan Pesan & Melodi Rahasia",
    description: "Kirim dan terima pesan rahasia lengkap dengan lagu favorit secara anonim.",
    siteName: "BisikLagu",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        {/* Google Analytics (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-RWHXVJL1M9"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-RWHXVJL1M9');
          `}
        </Script>
      </head>
      <body className="min-h-screen bg-[#1c1917] text-[#faf7f2] font-body antialiased">
        {children}
      </body>
    </html>
  );
}
