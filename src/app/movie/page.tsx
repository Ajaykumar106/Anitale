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
  const [trending, topRated, action, comedy] = await Promise.all([
    getTrendingMedia(MediaType.MOVIE),
    getDiscoverMedia(MediaType.MOVIE, { top_rated: true }),
    getDiscoverMedia(MediaType.MOVIE, { genre: '28' }), // Action
    getDiscoverMedia(MediaType.MOVIE, { genre: '35' }), // Comedy
  ]);
  
  if (!trending || trending.length === 0) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold">Movies</h1>
        <p className="text-muted-foreground mt-4">No movies available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-8">
      <Suspense fallback={<div className="w-full h-[60vh] sm:h-[70vh] lg:h-[80vh] bg-muted animate-pulse rounded-xl" />}>
        <HeroBanner items={trending} type={MediaType.MOVIE} />
      </Suspense>

      <section>
        <SectionHeader title="Trending Movies" />
        <MediaRow>
          {trending.map((media) => (
            <div key={`movie-trending-${media.externalId}`} className="w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] flex-none">
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
          <SectionHeader title="Top Rated Movies" />
          <MediaRow>
            {topRated.map((media) => (
              <div key={`movie-top-${media.externalId}`} className="w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] flex-none">
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

      {action && action.length > 0 && (
        <section>
          <SectionHeader title="Action Movies" />
          <MediaRow>
            {action.map((media) => (
              <div key={`movie-action-${media.externalId}`} className="w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] flex-none">
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

      {comedy && comedy.length > 0 && (
        <section>
          <SectionHeader title="Comedy Movies" />
          <MediaRow>
            {comedy.map((media) => (
              <div key={`movie-comedy-${media.externalId}`} className="w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] flex-none">
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
