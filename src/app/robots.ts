import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bisiklagu.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/create', '/login', '/u/*'],
        disallow: ['/api/*', '/u/*/inbox'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
