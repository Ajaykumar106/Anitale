import { VideoProvider, PlaybackData } from './types';
import { prisma } from '@/lib/prisma';
import { MediaType } from '@prisma/client';

export class MockVideoProvider implements VideoProvider {
  id = 'mock-provider';
  name = 'Mock Video Provider';

  async getPlayback(
    providerMediaId: string,
    providerEpisodeId?: string
  ): Promise<PlaybackData | null> {

    // Special case for error testing
    if (providerMediaId === 'error-test') {
      throw new Error('Simulated provider failure');
    }

    if (providerMediaId === 'unavailable-test') {
      return null;
    }

    let embedUrl: string | undefined = undefined;
    let isEmbed = false;

    try {
      const media = await prisma.media.findUnique({ where: { id: providerMediaId } });
      if (media && process.env.TMDB_API_KEY) {
        const tmdbType = media.type === MediaType.MOVIE ? 'movie' : 'tv';
        const res = await fetch(`https://api.themoviedb.org/3/${tmdbType}/${media.externalId}/videos?api_key=${process.env.TMDB_API_KEY}`);
        if (res.ok) {
          const data = await res.json();
          const trailer = data.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube') || data.results?.find((v: any) => v.site === 'YouTube');
          if (trailer) {
            embedUrl = `https://www.youtube.com/embed/${trailer.key}?autoplay=1`;
            isEmbed = true;
          }
        }
      }
    } catch (error) {
      console.error('Error fetching trailer:', error);
    }

    return {
      isEmbed,
      embedUrl,
      sources: [
        {
          url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
          quality: 'auto',
          format: 'hls'
        }
      ]
    };
  }

  canEmbed(): boolean {
    return true;
  }
}
