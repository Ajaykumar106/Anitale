import { Metadata } from 'next';
import { getTrendingMedia } from '@/services/media/trending';
import { MediaRow } from '@/components/media/MediaRow';
import { MediaCard } from '@/components/media/MediaCard';
import { SectionHeader } from '@/components/media/SectionHeader';
import { MediaType } from '@prisma/client';

export const metadata: Metadata = {
  title: 'Anitale - Discover Entertainment',
};

// Revalidate every 12 hours for ISR
export const revalidate = 43200; 

import { PersonalizedHomeFeeds } from '@/components/recommendations/PersonalizedHomeFeeds';

export default async function Home() {
  const [trendingAll, trendingMovies, trendingSeries] = await Promise.all([
    getTrendingMedia(),
    getTrendingMedia(MediaType.MOVIE),
    getTrendingMedia(MediaType.SERIES),
  ]);

  return (
    <div className="container py-8 space-y-8">
      <section className="space-y-4">
        <div className="rounded-xl bg-primary/10 p-8 md:p-12 text-center flex flex-col items-center">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-primary">Welcome to Anitale</h1>
          <p className="mt-4 text-muted-foreground max-w-xl text-lg">
            Discover, track, and review your favorite movies, series, and anime all in one place.
          </p>
        </div>
      </section>

      <PersonalizedHomeFeeds />

      {trendingAll.length === 0 && trendingMovies.length === 0 && trendingSeries.length === 0 && (
        <section className="rounded-lg border border-dashed p-8 text-center space-y-3">
          <h2 className="text-xl font-semibold">No Trending Data Available</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            To see live trending movies, series, and anime, add a valid TMDB API key to your <code className="bg-muted px-1.5 py-0.5 rounded text-sm">.env</code> file:
          </p>
          <pre className="bg-muted rounded p-3 text-sm text-left max-w-md mx-auto overflow-x-auto">
            {`TMDB_API_KEY="your_key_here"`}
          </pre>
          <p className="text-xs text-muted-foreground">
            Get a free key at{' '}
            <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener noreferrer" className="underline text-primary">
              themoviedb.org/settings/api
            </a>
          </p>
        </section>
      )}

      {trendingAll.length > 0 && (
        <section>
          <SectionHeader title="Trending Now" />
          <MediaRow>
            {trendingAll.map((media) => (
              <div key={`all-${media.externalId}`} className="w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] flex-none">
                <MediaCard
                  id={media.externalId}
                  title={media.title}
                  type={media.type}
                  posterPath={media.posterPath}
                  year={media.releaseDate?.getFullYear()}
                />
              </div>
            ))}
          </MediaRow>
        </section>
      )}

      {trendingMovies.length > 0 && (
        <section>
          <SectionHeader title="Popular Movies" href="/movie" linkText="All movies" />
          <MediaRow>
            {trendingMovies.map((media) => (
              <div key={`movie-${media.externalId}`} className="w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] flex-none">
                <MediaCard
                  id={media.externalId}
                  title={media.title}
                  type={media.type}
                  posterPath={media.posterPath}
                  year={media.releaseDate?.getFullYear()}
                />
              </div>
            ))}
          </MediaRow>
        </section>
      )}

      {trendingSeries.length > 0 && (
        <section>
          <SectionHeader title="Popular Series" href="/show" linkText="All series" />
          <MediaRow>
            {trendingSeries.map((media) => (
              <div key={`series-${media.externalId}`} className="w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] flex-none">
                <MediaCard
                  id={media.externalId}
                  title={media.title}
                  type={media.type}
                  posterPath={media.posterPath}
                  year={media.releaseDate?.getFullYear()}
                />
              </div>
            ))}
          </MediaRow>
        </section>
      )}
    </div>
  );
}
