import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "BisikLagu - Bisikan Pesan & Melodi Rahasia",
    template: "%s | BisikLagu",
  },
  description: "Kirim dan terima pesan rahasia lengkap dengan lagu favorit secara anonim.",
  openGraph: {
    title: "BisikLagu - Bisikan Pesan & Melodi Rahasia",
    description: "Kirim dan terima pesan rahasia lengkap dengan lagu favorit secara anonim.",
    siteName: "BisikLagu",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-[#1c1917] text-[#faf7f2] font-body antialiased">
        {children}
      </body>
    </html>
  );
}
