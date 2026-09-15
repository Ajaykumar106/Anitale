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
