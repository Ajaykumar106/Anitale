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

export default async function AnimePage() {
  const [trending, topRated] = await Promise.all([
    getTrendingMedia(MediaType.ANIME),
    getDiscoverMedia(MediaType.ANIME, { top_rated: true }),
  ]);
  
  if (!trending || trending.length === 0) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold">Anime</h1>
        <p className="text-muted-foreground mt-4">No anime available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-8">
      <Suspense fallback={<div className="w-full h-[60vh] sm:h-[70vh] lg:h-[80vh] bg-muted animate-pulse rounded-xl" />}>
        <HeroBanner items={trending} type={MediaType.ANIME} />
      </Suspense>

      <section>
        <SectionHeader title="Trending Anime" />
        <MediaRow>
          {trending.map((media) => (
            <div key={`anime-trending-${media.externalId}`} className="w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] flex-none">
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

      {topRated && topRated.length > 0 && (
        <section>
          <SectionHeader title="Top Rated Anime" />
          <MediaRow>
            {topRated.map((media) => (
              <div key={`anime-top-${media.externalId}`} className="w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] flex-none">
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
      )}
    </div>
  );
}
