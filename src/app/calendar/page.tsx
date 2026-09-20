import { TMDBAdapter } from '@/providers/tmdb/adapter';
import { MediaCard } from '@/components/media/MediaCard';
import { MediaGrid } from '@/components/media/MediaGrid';

export const metadata = {
  title: 'Release Calendar | Anitale',
};

export default async function CalendarPage() {
  const tmdb = new TMDBAdapter(process.env.TMDB_API_KEY!);
  
  // Fetch real upcoming movies and airing series
  const [upcomingMovies, airingSeries, airingAnime] = await Promise.all([
    tmdb.getDiscover('MOVIE', { upcoming: true }),
    tmdb.getDiscover('SERIES', { on_the_air: true }),
    tmdb.getDiscover('ANIME', { on_the_air: true })
  ]);

  return (
    <div className="container py-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-extrabold mb-2 tracking-tighter">Release Calendar</h1>
      <p className="text-muted-foreground mb-12 text-lg">Real-time upcoming and currently airing releases.</p>
      
      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="bg-primary w-1 h-6 rounded-full inline-block"></span>
            Upcoming Movies
          </h2>
          <MediaGrid>
            {upcomingMovies.slice(0, 12).map((media) => (
              <MediaCard
                key={`movie-${media.externalId}`}
                id={media.externalId}
                title={media.title}
                type={media.type}
                posterPath={media.posterPath}
                year={media.releaseDate?.getFullYear()}
              />
            ))}
          </MediaGrid>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="bg-green-500 w-1 h-6 rounded-full inline-block"></span>
            Currently Airing Series
          </h2>
          <MediaGrid>
            {airingSeries.slice(0, 12).map((media) => (
              <MediaCard
                key={`series-${media.externalId}`}
                id={media.externalId}
                title={media.title}
                type={media.type}
                posterPath={media.posterPath}
                year={media.releaseDate?.getFullYear()}
              />
            ))}
          </MediaGrid>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="bg-orange-500 w-1 h-6 rounded-full inline-block"></span>
            Airing Anime
          </h2>
          <MediaGrid>
            {airingAnime.slice(0, 12).map((media) => (
              <MediaCard
                key={`anime-${media.externalId}`}
                id={media.externalId}
                title={media.title}
                type={media.type}
                posterPath={media.posterPath}
                year={media.releaseDate?.getFullYear()}
              />
            ))}
          </MediaGrid>
        </section>
      </div>
    </div>
  );
}
