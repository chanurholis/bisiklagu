import type { Metadata } from "next";
import Script from "next/script";
import { Suspense } from "react";
import NavigationLoader from "@/components/NavigationLoader";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bisiklagu.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "BisikLagu - Bisikan Pesan & Melodi Rahasia",
    template: "%s | BisikLagu",
  },
  description: "Kirim dan terima pesan rahasia lengkap dengan lagu favorit secara anonim. Buat link pribadi, dengarkan cuplikan lagu 30 detik, lirik favorit, dan bagikan kartu estetis ke Instagram Story.",
  keywords: [
    "bisiklagu",
    "pesan rahasia",
    "lagu rahasia",
    "kirim pesan anonim",
    "pesan rahasia spotify",
    "lirik lagu rahasia",
    "ngl indonesia",
    "secret message song",
    "anonymous song message",
  ],
  authors: [{ name: "BisikLagu Team" }],
  creator: "BisikLagu",
  publisher: "BisikLagu",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "BisikLagu - Bisikan Pesan & Melodi Rahasia",
    description: "Kirim dan terima pesan rahasia lengkap dengan lagu favorit secara anonim.",
    url: siteUrl,
    siteName: "BisikLagu",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: `${siteUrl}/api/og`,
        width: 1200,
        height: 630,
        alt: "BisikLagu - Bisikan Pesan & Melodi Rahasia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BisikLagu - Bisikan Pesan & Melodi Rahasia",
    description: "Kirim dan terima pesan rahasia lengkap dengan lagu favorit secara anonim.",
    images: [`${siteUrl}/api/og`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
};

const jsonLdWebsite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "BisikLagu",
  "url": siteUrl,
  "description": "Kirim dan terima pesan rahasia lengkap dengan lagu favorit secara anonim.",
  "potentialAction": {
    "@type": "SearchAction",
    "target": `${siteUrl}/u/{search_term_string}`,
    "query-input": "required name=search_term_string"
  }
};

const jsonLdOrganization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "BisikLagu",
  "url": siteUrl,
  "logo": `${siteUrl}/icon.svg`,
  "sameAs": [
    "https://bisiklagu.com"
  ]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        {/* Structured Data JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
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
        <Suspense fallback={null}>
          <NavigationLoader />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
