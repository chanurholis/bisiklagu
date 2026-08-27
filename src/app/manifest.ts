import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BisikLagu - Bisikan Pesan & Melodi Rahasia',
    short_name: 'BisikLagu',
    description: 'Kirim dan terima pesan rahasia lengkap dengan lagu favorit secara anonim.',
    start_url: '/',
    display: 'standalone',
    background_color: '#1c1917',
    theme_color: '#1c1917',
    icons: [
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
