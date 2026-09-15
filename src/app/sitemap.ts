import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  // Base static routes
  const routes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: 'always', priority: 0.8 },
    { url: `${baseUrl}/upcoming`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/calendar`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
  ];

  // Fetch some top media to include in the sitemap (in a real app, this might be chunked)
  try {
    const popularMedia = await prisma.media.findMany({
      take: 1000,
      select: { externalId: true, type: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' }
    });

    const mediaRoutes = popularMedia.map(media => {
      let segment = 'movie';
      if (media.type === 'SERIES') segment = 'show';
      if (media.type === 'ANIME') segment = 'anime';

      return {
        url: `${baseUrl}/${segment}/${media.externalId}`,
        lastModified: media.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      };
    });

    return [...routes, ...mediaRoutes];
  } catch (error) {
    // If DB fails, just return base routes
    return routes;
  }
}
