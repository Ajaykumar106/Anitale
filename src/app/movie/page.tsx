import { Metadata } from 'next';
import { getTrendingMedia, getDiscoverMedia } from '@/services/media/trending';
import { MediaCard } from '@/components/media/MediaCard';
import { MediaType } from '@prisma/client';
import { HeroBanner } from '@/components/media/HeroBanner';
import { FilterPills } from '@/components/media/FilterPills';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Movies - Anitale',
};

export const revalidate = 43200;

export default async function MoviesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const genre = typeof searchParams.genre === 'string' ? searchParams.genre : undefined;
  const topRated = searchParams.top_rated === 'true';
  // Year filter can be added to getDiscoverMedia if supported, omitting for simplicity if TMDB adapter doesn't explicitly handle it yet.

  let displayMedia: any[] = [];
  let bannerMedia: any[] = [];

  if (genre || topRated) {
    displayMedia = await getDiscoverMedia(MediaType.MOVIE, { genre, top_rated: topRated }) || [];
    bannerMedia = displayMedia;
  } else {
    const [upcoming, trending, topRatedRes, action, romance, sciFi, comedy] = await Promise.all([
      getDiscoverMedia(MediaType.MOVIE, { upcoming: true }),
      getTrendingMedia(MediaType.MOVIE),
      getDiscoverMedia(MediaType.MOVIE, { top_rated: true }),
      getDiscoverMedia(MediaType.MOVIE, { genre: '28' }), // Action
      getDiscoverMedia(MediaType.MOVIE, { genre: '10749' }), // Romance
      getDiscoverMedia(MediaType.MOVIE, { genre: '878' }), // Sci-Fi
      getDiscoverMedia(MediaType.MOVIE, { genre: '35' }), // Comedy
    ]);

    const allMedia = [
      ...(trending || []),
      ...(upcoming || []),
      ...(topRatedRes || []),
      ...(action || []),
      ...(sciFi || []),
      ...(romance || []),
      ...(comedy || []),
    ];

    displayMedia = Array.from(
      new Map(allMedia.map((item) => [item.externalId, item])).values()
    );
    bannerMedia = upcoming && upcoming.length > 0 ? upcoming : (trending || []);
  }

  if (!displayMedia || displayMedia.length === 0) {
    return (
      <div className="w-full px-4 py-8">
        <h1 className="text-3xl font-bold">Movies</h1>
        <p className="text-muted-foreground mt-4">No movies available at the moment.</p>
      </div>
    );
  }

  const uniqueMedia = displayMedia;

  return (
    <div className="w-full pb-8 space-y-8 md:space-y-12">
      <Suspense fallback={<div className="w-full h-[75vh] md:h-[85vh] bg-muted animate-pulse" />}>
        <HeroBanner items={bannerMedia} type={MediaType.MOVIE} />
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
