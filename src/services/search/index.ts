import { MediaType } from '@prisma/client';
import { TMDBAdapter } from '@/providers/tmdb/adapter';
import { ProviderMediaResult } from '@/providers/types';

// In a real application, the provider would be injected or retrieved from a factory
const tmdb = new TMDBAdapter(process.env.TMDB_API_KEY || 'dummy_key');

export async function searchMedia(query: string, options?: { page?: number; type?: MediaType }): Promise<ProviderMediaResult[]> {
  if (!query || query.trim().length === 0) {
    return [];
  }
  
  // Directly query the provider for Phase 2 validation
  const results = await tmdb.search(query, options);
  return results;
}
