import { Metadata } from 'next';
import { getTrendingMedia, getDiscoverMedia } from '@/services/media/trending';
import { MediaRow } from '@/components/media/MediaRow';
import { MediaCard } from '@/components/media/MediaCard';
import { SectionHeader } from '@/components/media/SectionHeader';
import { MediaType } from '@prisma/client';
import { HeroBanner } from '@/components/media/HeroBanner';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Movies - Anitale',
};

export const revalidate = 43200;

export default async function MoviesPage() {
  const [upcoming, trending, topRated, action, romance, sciFi, comedy] = await Promise.all([
    getDiscoverMedia(MediaType.MOVIE, { upcoming: true }),
    getTrendingMedia(MediaType.MOVIE),
    getDiscoverMedia(MediaType.MOVIE, { top_rated: true }),
    getDiscoverMedia(MediaType.MOVIE, { genre: '28' }), // Action
    getDiscoverMedia(MediaType.MOVIE, { genre: '10749' }), // Romance
    getDiscoverMedia(MediaType.MOVIE, { genre: '878' }), // Sci-Fi
    getDiscoverMedia(MediaType.MOVIE, { genre: '35' }), // Comedy
  ]);
  
  if (!trending || trending.length === 0) {
    return (
      <div className="w-full px-4 py-8">
        <h1 className="text-3xl font-bold">Movies</h1>
        <p className="text-muted-foreground mt-4">No movies available at the moment.</p>
      </div>
    );
  }

  const renderRow = (title: string, data: any[]) => {
    if (!data || data.length === 0) return null;
    return (
      <section>
        <SectionHeader title={title} />
        <MediaRow>
          {data.map((media) => (
            <div key={`${title}-${media.externalId}`} className="w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] flex-none">
              <MediaCard
                id={media.externalId}
                title={media.title}
                type={media.type}
                posterPath={media.posterPath}
                year={media.releaseDate ? new Date(media.releaseDate).getFullYear() : undefined}
              />
            </div>
          ))}
        </MediaRow>
      </section>
    );
  };

  return (
    <div className="w-full pb-8 space-y-8 md:space-y-12">
      <Suspense fallback={<div className="w-full h-[75vh] md:h-[85vh] bg-muted animate-pulse" />}>
        <HeroBanner items={upcoming && upcoming.length > 0 ? upcoming : trending} type={MediaType.MOVIE} />
      </Suspense>

      <div className="space-y-6 md:space-y-10">
        {renderRow("Coming Soon", upcoming)}
        {renderRow("Trending Now", trending)}
        {renderRow("Top Rated", topRated)}
        {renderRow("Action & Adventure", action)}
        {renderRow("Sci-Fi & Fantasy", sciFi)}
        {renderRow("Romance", romance)}
        {renderRow("Comedies", comedy)}
      </div>
    </div>
  );
}
