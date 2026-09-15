import { z } from 'zod';
import { MediaType } from '@prisma/client';
import { MetadataProvider, ProviderMediaResult, ProviderMediaDetails, ProviderAvailabilityData } from '../types';

// Zod schemas for TMDB API response validation
const TMDBSearchResultSchema = z.object({
  id: z.number(),
  title: z.string().optional(),
  name: z.string().optional(), // TV shows use 'name'
  original_title: z.string().optional(),
  poster_path: z.string().nullable().optional(),
  release_date: z.string().optional(),
  first_air_date: z.string().optional(),
  media_type: z.enum(['movie', 'tv', 'person']).optional(),
});

const TMDBSearchResponseSchema = z.object({
  results: z.array(TMDBSearchResultSchema),
});

export class TMDBAdapter implements MetadataProvider {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.themoviedb.org/3';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async fetchWithRetry(endpoint: string, options: RequestInit = {}, retries = 3): Promise<Response> {
    if (!this.apiKey || this.apiKey === 'dummy_key') {
      throw new Error('TMDB API key is not configured');
    }

    let lastError: Error | null = null;
    
    for (let i = 0; i < retries; i++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
        
        const separator = endpoint.includes('?') ? '&' : '?';
        const response = await fetch(`${this.baseUrl}${endpoint}${separator}api_key=${this.apiKey}`, {
          ...options,
          signal: controller.signal,
          next: {
            revalidate: (options as { next?: { revalidate?: number } }).next?.revalidate ?? 3600, // Default 1 hour TTL
            tags: (options as { next?: { tags?: string[] } }).next?.tags,
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          if (response.status === 429) {
            // Rate limited, wait and retry
            await new Promise(res => setTimeout(res, 1000 * (i + 1)));
            continue;
          }
          throw new Error(`API Error: ${response.status}`);
        }
        
        return response;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error('Unknown error');
        if (lastError.name === 'AbortError') {
          // Timeout, retry
          continue;
        }
        throw lastError; // Other errors fail immediately
      }
    }
    
    throw lastError || new Error('Max retries reached');
  }

  async search(query: string, options?: { page?: number; type?: MediaType }): Promise<ProviderMediaResult[]> {
    const page = options?.page || 1;
    let endpoint = `/search/multi?query=${encodeURIComponent(query)}&page=${page}`;
    
    if (options?.type === 'MOVIE') {
      endpoint = `/search/movie?query=${encodeURIComponent(query)}&page=${page}`;
    } else if (options?.type === 'SERIES') {
      endpoint = `/search/tv?query=${encodeURIComponent(query)}&page=${page}`;
    }

    const response = await this.fetchWithRetry(endpoint);
    const data = await response.json();
    
    // Validate response using Zod
    const parsed = TMDBSearchResponseSchema.parse(data);

    return parsed.results
      .filter(item => item.media_type !== 'person') // Filter out actors
      .map(item => ({
        externalId: item.id.toString(),
        type: (item.media_type === 'tv' || options?.type === 'SERIES') ? MediaType.SERIES : MediaType.MOVIE,
        title: (item.title || item.name) ?? 'Unknown Title',
        originalTitle: item.original_title,
        posterPath: item.poster_path ?? undefined,
        releaseDate: (item.release_date || item.first_air_date) ? new Date(item.release_date || item.first_air_date!) : undefined,
      }));
  }

  async getTrending(type?: MediaType): Promise<ProviderMediaResult[]> {
    let endpoint = '/trending/all/day';
    if (type === 'MOVIE') endpoint = '/trending/movie/day';
    else if (type === 'SERIES') endpoint = '/trending/tv/day';

    const response = await this.fetchWithRetry(endpoint);
    const data = await response.json();
    const parsed = TMDBSearchResponseSchema.parse(data);

    return parsed.results
      .filter(item => item.media_type !== 'person')
      .map(item => ({
        externalId: item.id.toString(),
        type: (item.media_type === 'tv' || type === 'SERIES') ? MediaType.SERIES : MediaType.MOVIE,
        title: (item.title || item.name) ?? 'Unknown Title',
        originalTitle: item.original_title,
        posterPath: item.poster_path ?? undefined,
        releaseDate: (item.release_date || item.first_air_date) ? new Date(item.release_date || item.first_air_date!) : undefined,
      }));
  }

  async getMediaDetails(externalId: string, type: MediaType): Promise<ProviderMediaDetails | null> {
    try {
      const endpoint = type === 'MOVIE' ? `/movie/${externalId}` : `/tv/${externalId}`;
      const response = await this.fetchWithRetry(endpoint);
      const data = await response.json();

      return {
        externalId: data.id.toString(),
        type: type,
        title: data.title || data.name || 'Unknown',
        originalTitle: data.original_title,
        overview: data.overview,
        posterPath: data.poster_path,
        backdropPath: data.backdrop_path,
        releaseDate: (data.release_date || data.first_air_date) ? new Date(data.release_date || data.first_air_date) : undefined,
        status: data.status,
        runtime: data.runtime || (data.episode_run_time?.[0]),
        genres: (data.genres || []).map((g: { name: string }) => ({ genre: { name: g.name } })),
        alternativeTitles: [], // Left empty for simplicity unless appending /alternative_titles
      };
    } catch (error) {
      console.error(`Failed to fetch details for ${externalId}:`, error);
      return null;
    }
  }

  async getAvailability(externalId: string, type: MediaType, region: string): Promise<ProviderAvailabilityData[]> {
    return [];
  }
}
