import { Metadata } from 'next';
import { getUserByUsername } from '@/lib/dbHelper';

interface Props {
  params: Promise<{ username: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const user = await getUserByUsername(username);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bisiklagu.com';

  if (!user) {
    return {
      title: 'Profil Tidak Ditemukan - BisikLagu',
      description: 'Pengguna yang Anda cari tidak ditemukan di BisikLagu.',
    };
  }

  const title = `${user.name} (@${user.username}) • Pesan Rahasia & Melodi Favorit`;
  const description = `${user.bio_prompt || 'Kirimkan pesan rahasia & lagu favoritmu!'} Kirim pesan anonim lengkap dengan 30s cuplikan lagu untuk ${user.name} secara gratis.`;
  const profileUrl = `${siteUrl}/u/${user.username}`;

  const ogImageUrl = `${siteUrl}/api/og?username=${encodeURIComponent(user.username)}&name=${encodeURIComponent(user.name)}&bio=${encodeURIComponent(user.bio_prompt || '')}`;

  return {
    title,
    description,
    keywords: [
      `pesan rahasia ${user.name}`,
      `bisiklagu ${user.username}`,
      `kirim lagu rahasia ${user.username}`,
      `ngl ${user.username}`,
      "pesan anonim spotify",
    ],
    openGraph: {
      title,
      description,
      url: profileUrl,
      siteName: 'BisikLagu',
      locale: 'id_ID',
      type: 'profile',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `Profil Pesan Rahasia ${user.name} (@${user.username})`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: profileUrl,
    },
  };
}

export default async function UserLayout({ params, children }: Props) {
  const { username } = await params;
  const user = await getUserByUsername(username);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bisiklagu.com';

  const jsonLdPerson = user
    ? {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        name: `Profil ${user.name} (@${user.username})`,
        url: `${siteUrl}/u/${user.username}`,
        mainEntity: {
          '@type': 'Person',
          name: user.name,
          alternateName: user.username,
          description: user.bio_prompt,
          image: `${siteUrl}/icon.svg`,
        },
      }
    : null;

  return (
    <>
      {jsonLdPerson && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdPerson) }}
        />
      )}
      {children}
    </>
  );
}
