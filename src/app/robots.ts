import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/', 
        '/admin/', 
        '/settings/', 
        '/profile/', 
        '/history/', 
        '/watchlist/',
        '/collections/',
        '/notifications/',
        '/*?*' // Disallow all query combinations to prevent infinite crawling of search/filter states
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
