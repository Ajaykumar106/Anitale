import { prisma } from '@/lib/prisma';
import { VideoProvider, PlaybackData } from '@/providers/video/types';
import { MockVideoProvider } from '@/providers/video/mock';

// Registry of available provider implementations
const providerRegistry: Record<string, VideoProvider> = {
  'mock-provider': new MockVideoProvider()
};

export interface ResolvedPlayback {
  providerId: string;
  providerName: string;
  playback: PlaybackData;
}

export async function resolvePlayback(mediaId: string, episodeId?: string): Promise<ResolvedPlayback | null> {
  // 1. Find configured, enabled providers for this media
  // In a real scenario, we might join against ProviderMediaMapping, but for MVP we fetch all enabled providers
  const dbProviders = await prisma.videoProvider.findMany({
    where: { isEnabled: true },
    orderBy: { priority: 'desc' }
  });

  if (dbProviders.length === 0) {
    // Inject mock for testing if DB is empty
    dbProviders.push({
      id: 'mock-db-id',
      slug: 'mock-provider',
      name: 'Mock Video Provider',
      isEnabled: true,
      priority: 10,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  // Find mappings for this specific media if they exist
  const mappings = await prisma.videoProviderMediaMapping.findMany({
    where: { mediaId }
  });

  const mappingDict = mappings.reduce((acc, curr) => {
    acc[curr.videoProviderId] = curr.providerMediaId;
    return acc;
  }, {} as Record<string, string>);

  let lastError: Error | null = null;

  // 2-6. Check availability, verify embed, rank providers (implicitly by DB orderBy priority), and try fallback
  for (const dbProvider of dbProviders) {
    const impl = providerRegistry[dbProvider.slug];
    if (!impl) continue;

    // 4. Verify embed allowed
    if (!impl.canEmbed()) continue;

    // Use mapped provider ID or fallback to the platform's mediaId
    const providerMediaId = mappingDict[dbProvider.id] || mediaId;

    try {
      // Create a timeout promise to prevent provider hanging
      const playbackPromise = impl.getPlayback(providerMediaId, episodeId);
      const timeoutPromise = new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error('Provider timeout')), 5000)
      );

      const playback = await Promise.race([playbackPromise, timeoutPromise]) as PlaybackData | null;
      
      if (playback) {
        return {
          providerId: dbProvider.slug,
          providerName: dbProvider.name,
          playback
        };
      }
    } catch (error) {
      console.warn(`Provider ${dbProvider.slug} failed to resolve playback:`, error);
      lastError = error instanceof Error ? error : new Error('Unknown provider error');
      // 7. Fall back to the next provider in the list
      continue;
    }
  }

  if (lastError) throw lastError;
  return null;
}
