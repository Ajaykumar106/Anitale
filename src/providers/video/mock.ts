import { VideoProvider, PlaybackData } from './types';

export class MockVideoProvider implements VideoProvider {
  id = 'mock-provider';
  name = 'Mock Video Provider';

  async getPlayback(
    providerMediaId: string,
    providerEpisodeId?: string
  ): Promise<PlaybackData | null> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Special case for error testing
    if (providerMediaId === 'error-test') {
      throw new Error('Simulated provider failure');
    }

    if (providerMediaId === 'unavailable-test') {
      return null;
    }

    return {
      isEmbed: true,
      embedUrl: `https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1`, // Safe fallback embed for demo purposes
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
