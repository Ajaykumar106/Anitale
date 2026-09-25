import { getTrendingMedia } from '@/services/media/trending';
import { MediaRow } from '@/components/media/MediaRow';
import { MediaCard } from '@/components/media/MediaCard';
import { SectionHeader } from '@/components/media/SectionHeader';
import { MediaType } from '@prisma/client';

export async function TrendingSections() {
  const [trendingAll, trendingMovies, trendingSeries] = await Promise.all([
    getTrendingMedia(),
    getTrendingMedia(MediaType.MOVIE),
    getTrendingMedia(MediaType.SERIES),
  ]);

  if (trendingAll.length === 0 && trendingMovies.length === 0 && trendingSeries.length === 0) {
    return (
      <section className="rounded-lg border border-dashed p-8 text-center space-y-3">
        <h2 className="text-xl font-semibold">No Trending Data Available</h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          To see live trending movies, series, and anime, add a valid TMDB API key to your <code className="bg-muted px-1.5 py-0.5 rounded text-sm">.env</code> file.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-6 md:space-y-12">
      {trendingAll.length > 0 && (
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both" style={{ animationDelay: '100ms' }}>
          <SectionHeader title="Trending Now" />
          <MediaRow>
            {trendingAll.map((media) => (
              <div key={`all-${media.externalId}`} className="w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] flex-none">
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

      {trendingMovies.length > 0 && (
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both" style={{ animationDelay: '200ms' }}>
          <SectionHeader title="Popular Movies" href="/movie" linkText="View All" />
          <MediaRow>
            {trendingMovies.map((media) => (
              <div key={`movie-${media.externalId}`} className="w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] flex-none">
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

      {trendingSeries.length > 0 && (
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both" style={{ animationDelay: '300ms' }}>
          <SectionHeader title="Popular Series" href="/show" linkText="View All" />
          <MediaRow>
            {trendingSeries.map((media) => (
              <div key={`series-${media.externalId}`} className="w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] flex-none">
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
