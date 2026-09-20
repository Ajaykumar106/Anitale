import { Metadata } from 'next';
import { getTrendingMedia, getDiscoverMedia } from '@/services/media/trending';
import { MediaCard } from '@/components/media/MediaCard';
import { MediaType } from '@prisma/client';
import { HeroBanner } from '@/components/media/HeroBanner';
import { FilterPills } from '@/components/media/FilterPills';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'TV Shows - Anitale',
};

export const revalidate = 43200;

export default async function ShowsPage() {
  const [trending, topRated, action, scifi, kdrama, comedy] = await Promise.all([
    getTrendingMedia(MediaType.SERIES),
    getDiscoverMedia(MediaType.SERIES, { top_rated: true }),
    getDiscoverMedia(MediaType.SERIES, { genre: '10759' }), // Action & Adventure
    getDiscoverMedia(MediaType.SERIES, { genre: '10765' }), // Sci-Fi & Fantasy
    getDiscoverMedia(MediaType.SERIES, { original_language: 'ko' }), // K-Dramas
    getDiscoverMedia(MediaType.SERIES, { genre: '35' }), // Comedy
  ]);
  
  if (!trending || trending.length === 0) {
    return (
      <div className="w-full px-4 py-8">
        <h1 className="text-3xl font-bold">TV Shows</h1>
        <p className="text-muted-foreground mt-4">No TV shows available at the moment.</p>
      </div>
    );
  }

  // Combine them all and deduplicate based on externalId
  const allMedia = [
    ...(trending || []),
    ...(topRated || []),
    ...(action || []),
    ...(scifi || []),
    ...(kdrama || []),
    ...(comedy || []),
  ];

  const uniqueMedia = Array.from(
    new Map(allMedia.map((item) => [item.externalId, item])).values()
  );

  return (
    <div className="w-full pb-8 space-y-8 md:space-y-12">
      <Suspense fallback={<div className="w-full h-[75vh] md:h-[85vh] bg-muted animate-pulse" />}>
        <HeroBanner items={trending} type={MediaType.SERIES} />
      </Suspense>

      <div className="space-y-6">
        <FilterPills />
        
        <div className="px-4 md:px-6">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
            {uniqueMedia.map((media) => (
              <div key={`grid-${media.externalId}`} className="w-full">
                <MediaCard
                  id={media.externalId}
                  title={media.title}
                  type={media.type}
                  posterPath={media.posterPath}
                  year={media.releaseDate ? new Date(media.releaseDate).getFullYear() : undefined}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
