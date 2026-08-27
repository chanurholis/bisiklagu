import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bisiklagu.com';

export const metadata: Metadata = {
  title: 'Buat Link Pesan & Melodi Rahasia Gratis',
  description: 'Buat link pribadi BisikLagu dalam hitungan detik. Dapatkan pesan rahasia anonim beserta cuplikan lagu 30s dari pengagum rahasia.',
  keywords: [
    'buat link bisiklagu',
    'buat pesan rahasia',
    'link ngl lagu',
    'terima lagu rahasia',
    'anonymous message link creator',
  ],
  openGraph: {
    title: 'Buat Link Pesan & Melodi Rahasia - BisikLagu',
    description: 'Buat link pribadi BisikLagu gratis dan mulai terima pesan & lagu rahasia.',
    url: `${siteUrl}/create`,
    siteName: 'BisikLagu',
    locale: 'id_ID',
    type: 'website',
  },
  alternates: {
    canonical: `${siteUrl}/create`,
  },
};

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
