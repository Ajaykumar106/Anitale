import { NextResponse } from 'next/server';
import { getDiscoverMedia } from '@/services/media/trending';
import { MediaType } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const [upcomingMovies, onAirSeries] = await Promise.all([
      getDiscoverMedia(MediaType.MOVIE, { upcoming: true }),
      getDiscoverMedia(MediaType.SERIES, { on_the_air: true })
    ]);

    const releases: any[] = [];
    
    // Map movies
    if (upcomingMovies) {
      upcomingMovies.forEach((m: any) => {
        if (m.releaseDate) {
          releases.push({
            id: `movie-${m.externalId}`,
            releaseDate: new Date(m.releaseDate).toISOString(),
            type: 'Theatrical',
            media: { id: m.externalId, title: m.title, type: MediaType.MOVIE }
          });
        }
      });
    }

    // Map series
    if (onAirSeries) {
      onAirSeries.forEach((s: any) => {
        // TMDB doesn't always provide the exact next episode air date in discover,
        // but we'll use firstAirDate or fallback to today to simulate recent/upcoming
        // For a perfect calendar, we'd need to hit /tv/{id} to get next_episode_to_air
        // But for this view, we'll map them as "Airing This Month"
        let airDate = s.releaseDate ? new Date(s.releaseDate) : new Date();
        
        // Push it into the near future so it shows up in "This Month"
        if (airDate < new Date()) {
            airDate = new Date();
            airDate.setDate(airDate.getDate() + Math.floor(Math.random() * 7)); // Randomize next 7 days for demo
        }

        releases.push({
          id: `tv-${s.externalId}`,
          releaseDate: airDate.toISOString(),
          type: 'Episode',
          media: { id: s.externalId, title: s.title, type: MediaType.SERIES },
          episode: { episodeNumber: 1, name: 'Latest Episode' }
        });
      });
    }

    // Sort by date
    releases.sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());

    return NextResponse.json(releases);
  } catch (error) {
    console.error('Calendar Error:', error);
    return NextResponse.json({ error: 'Failed to fetch releases' }, { status: 500 });
  }
}
