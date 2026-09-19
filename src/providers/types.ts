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
  getAvailability(externalId: string, type: MediaType, region: string): Promise<ProviderAvailabilityData[]>;
}
