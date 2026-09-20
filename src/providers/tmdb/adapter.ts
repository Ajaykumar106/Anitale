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
      .filter(item => item.media_type !== 'person' && item.poster_path) // Filter out actors
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
    else if (type === 'ANIME') endpoint = '/discover/tv?with_genres=16&with_original_language=ja&sort_by=popularity.desc';

    const response = await this.fetchWithRetry(endpoint);
    const data = await response.json();
    const parsed = TMDBSearchResponseSchema.parse(data);

    return parsed.results
      .filter(item => item.media_type !== 'person' && item.poster_path)
      .map(item => ({
        externalId: item.id.toString(),
        type: type || (item.media_type === 'tv' ? MediaType.SERIES : MediaType.MOVIE),
        title: (item.title || item.name) ?? 'Unknown Title',
        originalTitle: item.original_title,
        posterPath: item.poster_path ?? undefined,
        releaseDate: (item.release_date || item.first_air_date) ? new Date(item.release_date || item.first_air_date!) : undefined,
      }));
  }

  async getDiscover(type: MediaType, options?: { genre?: string, sort_by?: string, top_rated?: boolean, upcoming?: boolean, now_playing?: boolean, original_language?: string, airing_today?: boolean, on_the_air?: boolean, provider?: string }): Promise<ProviderMediaResult[]> {
    let endpoint = type === 'MOVIE' ? '/discover/movie' : '/discover/tv';
    let extraQuery = '';
    if (type === 'ANIME') {
      endpoint = '/discover/tv?with_genres=16&with_original_language=ja';
      if (options?.top_rated) {
        options = { ...options, sort_by: 'vote_average.desc' };
        extraQuery = '&vote_count.gte=200';
      } else if (options?.airing_today) {
        endpoint = '/tv/airing_today';
        extraQuery = '&with_genres=16&with_original_language=ja';
      } else if (options?.on_the_air) {
        endpoint = '/tv/on_the_air';
        extraQuery = '&with_genres=16&with_original_language=ja';
      }
    } else if (options?.top_rated) {
      endpoint = type === 'MOVIE' ? '/movie/top_rated' : '/tv/top_rated';
    } else if (options?.upcoming && type === 'MOVIE') {
      endpoint = '/movie/upcoming';
    } else if (options?.now_playing && type === 'MOVIE') {
      endpoint = '/movie/now_playing';
    } else if (options?.airing_today && type === 'SERIES') {
      endpoint = '/tv/airing_today';
    } else if (options?.on_the_air && type === 'SERIES') {
      endpoint = '/tv/on_the_air';
    } else {
      endpoint += '?';
    }

    const params = new URLSearchParams();
    if (options?.genre && type !== 'ANIME') {
      params.append('with_genres', options.genre);
    }
    if (options?.sort_by) {
      params.append('sort_by', options.sort_by);
    }
    if (options?.provider) {
      params.append('with_watch_providers', options.provider);
      params.append('watch_region', 'US');
    }
    if (options?.original_language && type !== 'ANIME') {
      params.append('with_original_language', options.original_language);
    }

    const query = params.toString();
    
    let finalEndpoint = endpoint;
    if (query) {
      finalEndpoint += endpoint.includes('?') ? `&${query}` : `?${query}`;
    }
    if (extraQuery) {
      finalEndpoint += finalEndpoint.includes('?') ? (extraQuery.startsWith('&') ? extraQuery : `&${extraQuery}`) : (extraQuery.startsWith('&') ? `?${extraQuery.slice(1)}` : `?${extraQuery}`);
    }

    const response = await this.fetchWithRetry(finalEndpoint);
    const data = await response.json();
    const parsed = TMDBSearchResponseSchema.parse(data);

    return parsed.results
      .filter(item => item.media_type !== 'person' && item.poster_path)
      .map(item => ({
        externalId: item.id.toString(),
        type: type,
        title: (item.title || item.name) ?? 'Unknown Title',
        originalTitle: item.original_title,
        posterPath: item.poster_path ?? undefined,
        releaseDate: (item.release_date || item.first_air_date) ? new Date(item.release_date || item.first_air_date!) : undefined,
      }));
  }

  async getMediaDetails(externalId: string, type: MediaType): Promise<ProviderMediaDetails | null> {
    try {
      const endpoint = type === 'MOVIE' ? `/movie/${externalId}` : `/tv/${externalId}`;
      const response = await this.fetchWithRetry(`${endpoint}?append_to_response=videos,credits`);
      const data = await response.json();

      let trailerUrl = undefined;
      if (data.videos && data.videos.results) {
        const trailer = data.videos.results.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube') || data.videos.results.find((v: any) => v.site === 'YouTube');
        if (trailer) {
          trailerUrl = `https://www.youtube.com/embed/${trailer.key}`;
        }
      }

      const cast = data.credits?.cast?.slice(0, 10).map((c: any) => ({
        name: c.name,
        character: c.character,
        profilePath: c.profile_path,
      })) || [];

      const crew = data.credits?.crew?.filter((c: any) => c.job === 'Director' || c.job === 'Executive Producer' || c.job === 'Writer').slice(0, 5).map((c: any) => ({
        name: c.name,
        job: c.job,
        profilePath: c.profile_path,
      })) || [];

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
        genres: (data.genres || []).map((g: { name: string }) => g.name),
        alternativeTitles: [], // Left empty for simplicity unless appending /alternative_titles
        trailerUrl,
        voteAverage: data.vote_average,
        budget: data.budget,
        revenue: data.revenue,
        credits: { cast, crew },
        seasons: type !== 'MOVIE' && data.seasons ? data.seasons.map((s: any) => ({
          seasonNumber: s.season_number,
          name: s.name,
          episodeCount: s.episode_count,
          posterPath: s.poster_path,
        })).filter((s: any) => s.seasonNumber > 0) : undefined,
      };
    } catch (error) {
      console.error(`Failed to fetch details for ${externalId}:`, error);
      return null;
    }
  }

  async getSeasonDetails(externalId: string, seasonNumber: number): Promise<any[]> {
    try {
      const response = await this.fetchWithRetry(`/tv/${externalId}/season/${seasonNumber}`);
      const data = await response.json();
      
      if (!data.episodes) return [];
      
      return data.episodes.map((ep: any) => ({
        id: ep.id.toString(),
        name: ep.name,
        overview: ep.overview,
        episodeNumber: ep.episode_number,
        seasonNumber: ep.season_number,
        runtime: ep.runtime,
        stillPath: ep.still_path,
        airDate: ep.air_date ? new Date(ep.air_date) : null,
      }));
    } catch (error) {
      console.error(`Failed to fetch season details for ${externalId} season ${seasonNumber}:`, error);
      return [];
    }
  }

  async getAvailability(externalId: string, type: MediaType, region: string = 'US'): Promise<any[]> {
    try {
      const endpoint = type === 'MOVIE' ? `/movie/${externalId}/watch/providers` : `/tv/${externalId}/watch/providers`;
      const response = await this.fetchWithRetry(endpoint);
      const data = await response.json();

      const regionData = data.results?.[region];
      if (!regionData) return [];

      const availability: ProviderAvailabilityData[] = [];

      const processProviders = (providers: any[] | undefined, providerType: 'STREAM' | 'RENT' | 'BUY' | 'FREE') => {
        if (!providers) return;
        providers.forEach(p => {
          availability.push({
            providerExternalId: p.provider_id.toString(),
            providerName: p.provider_name,
            logoPath: p.logo_path,
            type: providerType,
            region: region,
          });
        });
      };

      processProviders(regionData.flatrate, 'STREAM');
      processProviders(regionData.rent, 'RENT');
      processProviders(regionData.buy, 'BUY');
      processProviders(regionData.free, 'FREE');

      // Deduplicate providers of the same type? The current spec doesn't require it, 
      // but TMDB might return duplicates in some edge cases. We'll leave it simple.
      // Alternatively, just return availability as is.
      
      // We can unique by providerExternalId + type
      const uniqueAvailability = availability.filter((v, i, a) => 
        a.findIndex(t => t.providerExternalId === v.providerExternalId && t.type === v.type) === i
      );

      return uniqueAvailability;
    } catch (error) {
      console.error(`Failed to fetch availability for ${externalId}:`, error);
      return [];
    }
  }

  async getSimilar(externalId: string, type: MediaType): Promise<ProviderMediaResult[]> {
    try {
      const endpoint = type === 'MOVIE' ? `/movie/${externalId}/similar` : `/tv/${externalId}/similar`;
      const response = await this.fetchWithRetry(endpoint);
      const data = await response.json();
      const parsed = TMDBSearchResponseSchema.parse(data);

      return parsed.results
        .filter(item => item.media_type !== 'person' && item.poster_path)
        .map(item => ({
          externalId: item.id.toString(),
          type: type,
          title: (item.title || item.name) ?? 'Unknown Title',
          originalTitle: item.original_title,
          posterPath: item.poster_path ?? undefined,
          releaseDate: (item.release_date || item.first_air_date) ? new Date(item.release_date || item.first_air_date!) : undefined,
        }));
    } catch (error) {
      console.error(`Failed to fetch similar for ${externalId}:`, error);
      return [];
    }
  }
}
