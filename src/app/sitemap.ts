import { MetadataRoute } from 'next';
import { getAllUsernames } from '@/lib/dbHelper';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bisiklagu.com';

  // Static core routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/create`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // Dynamic user profile routes
  try {
    const users = await getAllUsernames(200);
    const userRoutes: MetadataRoute.Sitemap = users.map((u) => ({
      url: `${baseUrl}/u/${u.username}`,
      lastModified: u.created_at ? new Date(u.created_at) : new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    }));

    return [...staticRoutes, ...userRoutes];
  } catch (error) {
    return staticRoutes;
  }
}
