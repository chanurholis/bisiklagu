import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bisiklagu.com';

export const metadata: Metadata = {
  title: 'Masuk ke Inbox Rahasia Saya',
  description: 'Masuk ke akun BisikLagu Anda untuk membaca pesan rahasia, mendengarkan lagu, membalas publik, dan membagikan kartu cerita.',
  keywords: [
    'login bisiklagu',
    'masuk inbox rahasia',
    'baca pesan rahasia',
    'bisiklagu login',
  ],
  openGraph: {
    title: 'Masuk ke Inbox Rahasia - BisikLagu',
    description: 'Masuk ke akun BisikLagu Anda untuk membaca pesan & melodi rahasia.',
    url: `${siteUrl}/login`,
    siteName: 'BisikLagu',
    locale: 'id_ID',
    type: 'website',
  },
  alternates: {
    canonical: `${siteUrl}/login`,
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
