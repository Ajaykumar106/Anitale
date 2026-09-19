import { Metadata } from 'next';
import { getTrendingMedia, getDiscoverMedia } from '@/services/media/trending';
import { MediaRow } from '@/components/media/MediaRow';
import { MediaCard } from '@/components/media/MediaCard';
import { SectionHeader } from '@/components/media/SectionHeader';
import { MediaType } from '@prisma/client';
import { HeroBanner } from '@/components/media/HeroBanner';
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
        <HeroBanner items={trending} type={MediaType.SERIES} />
      </Suspense>

      <div className="space-y-6 md:space-y-10">
        {renderRow("Trending Series", trending)}
        {renderRow("Top Rated", topRated)}
        {renderRow("Action & Adventure", action)}
        {renderRow("Sci-Fi & Fantasy", scifi)}
        {renderRow("K-Dramas", kdrama)}
        {renderRow("Comedies", comedy)}
      </div>
    </div>
  );
}
