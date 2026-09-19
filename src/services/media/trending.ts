import { MediaType } from '@prisma/client';
import { TMDBAdapter } from '@/providers/tmdb/adapter';
import { ProviderMediaResult } from '@/providers/types';

const tmdb = new TMDBAdapter(process.env.TMDB_API_KEY || 'dummy_key');

import { CACHE_TTL, withCache } from '@/lib/cache';

export async function getTrendingMedia(type?: MediaType): Promise<ProviderMediaResult[]> {
  try {
    const fetcher = async () => await tmdb.getTrending(type);
    const cachedFetcher = withCache(fetcher, ['trending', type || 'all'], CACHE_TTL.METADATA);
    return await cachedFetcher();
  } catch (error) {
    console.error('Failed to fetch trending media', error);
    return [];
  }
}

export async function getDiscoverMedia(type: MediaType, options: { genre?: string, sort_by?: string, top_rated?: boolean, upcoming?: boolean, now_playing?: boolean, original_language?: string, airing_today?: boolean, on_the_air?: boolean }): Promise<ProviderMediaResult[]> {
  try {
    const fetcher = async () => await tmdb.getDiscover(type, options);
    const cacheKey = ['discover', type, options.genre || 'all', options.sort_by || 'none', options.top_rated ? 'top_rated' : 'none', options.upcoming ? 'upcoming' : 'none', options.now_playing ? 'now_playing' : 'none', options.original_language || 'none', options.airing_today ? 'airing_today' : 'none', options.on_the_air ? 'on_the_air' : 'none'].join('-');
    const cachedFetcher = withCache(fetcher, [cacheKey], CACHE_TTL.METADATA);
    return await cachedFetcher();
  } catch (error) {
    console.error('Failed to fetch discover media:', error);
    return [];
  }
}
