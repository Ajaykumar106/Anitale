import { Metadata } from 'next';
import { getTrendingMedia, getDiscoverMedia } from '@/services/media/trending';
import { MediaRow } from '@/components/media/MediaRow';
import { MediaCard } from '@/components/media/MediaCard';
import { SectionHeader } from '@/components/media/SectionHeader';
import { MediaType } from '@prisma/client';
import { HeroBanner } from '@/components/media/HeroBanner';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Anime - Anitale',
};

export const revalidate = 43200;

import { FilterPills } from '@/components/media/FilterPills';

export default async function AnimePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const genre = typeof searchParams.genre === 'string' ? searchParams.genre : undefined;
  const topRatedParam = searchParams.top_rated === 'true';

  let filteredMedia: any[] | null = null;

  if (genre || topRatedParam) {
    filteredMedia = await getDiscoverMedia(MediaType.ANIME, { genre, top_rated: topRatedParam }) || [];
  }

  const [trending, topRated, airingToday, onTheAir] = await Promise.all([
    getTrendingMedia(MediaType.ANIME),
    getDiscoverMedia(MediaType.ANIME, { top_rated: true }),
    getDiscoverMedia(MediaType.ANIME, { airing_today: true }),
    getDiscoverMedia(MediaType.ANIME, { on_the_air: true }),
  ]);
  
  if (!trending || trending.length === 0) {
    return (
      <div className="w-full px-4 py-8">
        <h1 className="text-3xl font-bold">Anime</h1>
        <p className="text-muted-foreground mt-4">No anime available at the moment.</p>
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

  const bannerItems = filteredMedia ? filteredMedia : (airingToday && airingToday.length > 0 ? airingToday : trending);

  return (
    <div className="w-full pb-8 space-y-8 md:space-y-12">
      <Suspense fallback={<div className="w-full h-[75vh] md:h-[85vh] bg-muted animate-pulse" />}>
        <HeroBanner items={bannerItems} type={MediaType.ANIME} />
      </Suspense>

      <div className="space-y-6 md:space-y-10">
        <FilterPills />
        
        {filteredMedia ? (
          <div className="px-4 md:px-6">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
              {filteredMedia.map((media) => (
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
        ) : (
          <>
            {renderRow("Trending Anime", trending)}
            {renderRow("Airing Today (Simulcasts)", airingToday)}
            {renderRow("Currently Airing", onTheAir)}
            {renderRow("Top Rated Anime", topRated)}
          </>
        )}
      </div>
    </div>
  );
}
