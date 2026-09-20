import { MediaType } from '@prisma/client';

export interface ProviderMediaResult {
  externalId: string;
  type: MediaType;
  title: string;
  originalTitle?: string;
  posterPath?: string;
  releaseDate?: Date;
}

export interface ProviderMediaDetails extends ProviderMediaResult {
  overview?: string;
  backdropPath?: string;
  status?: string;
  runtime?: number;
  genres: string[];
  alternativeTitles: { title: string; language: string }[];
  availability?: ProviderAvailabilityData[];
  trailerUrl?: string;
  credits?: {
    cast: { name: string; character: string; profilePath: string | null }[];
    crew: { name: string; job: string; profilePath: string | null }[];
  };
  voteAverage?: number;
  voteCount?: number;
  seasons?: {
    seasonNumber: number;
    name: string;
    episodeCount: number;
    posterPath: string | null;
  }[];
}

export interface ProviderEpisodeDetails {
  id: string;
  name: string;
  overview: string;
  episodeNumber: number;
  seasonNumber: number;
  runtime: number | null;
  stillPath: string | null;
  airDate: Date | null;
}

export interface ProviderAvailabilityData {
  providerExternalId: string;
  providerName: string;
  logoPath?: string;
  type: 'STREAM' | 'RENT' | 'BUY' | 'FREE';
  region: string;
}

export interface MetadataProvider {
  search(query: string, options?: { page?: number; type?: MediaType }): Promise<ProviderMediaResult[]>;
  getTrending(type?: MediaType): Promise<ProviderMediaResult[]>;
  getMediaDetails(externalId: string, type: MediaType): Promise<ProviderMediaDetails | null>;
  getSeasonDetails?(externalId: string, seasonNumber: number): Promise<ProviderEpisodeDetails[]>;
  getAvailability(externalId: string, type: MediaType, region: string): Promise<ProviderAvailabilityData[]>;
}
