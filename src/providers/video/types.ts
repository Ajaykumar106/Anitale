import { MediaType } from '@prisma/client';

export interface PlaybackSource {
  url: string;
  quality: string; // 'auto', '1080p', '720p', etc.
  format: string; // 'hls', 'dash', 'mp4'
}

export interface PlaybackSubtitles {
  language: string;
  url: string;
}

export interface PlaybackData {
  sources: PlaybackSource[];
  subtitles?: PlaybackSubtitles[];
  headers?: Record<string, string>;
  isEmbed: boolean;
  embedUrl?: string; // If isEmbed is true, use this in an iframe
}

export interface VideoProvider {
  id: string; // The slug in the database
  name: string;
  
  // Interface methods
  searchMedia?(query: string): Promise<unknown>;
  getMedia?(externalId: string, type: MediaType): Promise<unknown>;
  getEpisode?(mediaId: string, seasonNum: number, episodeNum: number): Promise<unknown>;
  
  // The core playback retrieval method
  getPlayback(
    providerMediaId: string, 
    providerEpisodeId?: string
  ): Promise<PlaybackData | null>;
  
  canEmbed(): boolean;
}
