import { prisma } from '@/lib/prisma';
import { MediaType } from '@prisma/client';
import { TMDBAdapter } from '@/providers/tmdb/adapter';
import { importMedia } from './import';
import { CACHE_TTL, withCache } from '@/lib/cache';

const tmdb = new TMDBAdapter(process.env.TMDB_API_KEY || 'dummy_key');

// Cache duration 24 hours
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export async function getMediaDetails(externalId: string, type: MediaType) {
  let localMedia = null;

  // Try checking local database cache first
  try {
    localMedia = await prisma.media.findUnique({
      where: { externalId_type: { externalId, type } },
      include: {
        genres: { include: { genre: true } },
        alternativeTitles: true,
        cast: { include: { person: true } },
        crew: { include: { person: true } },
        seasons: { include: { episodes: true } },
        availability: { include: { provider: true } },
      }
    });

    // If we have a recent local copy, return it
    if (localMedia) {
      const ageMs = Date.now() - localMedia.updatedAt.getTime();
      if (ageMs < CACHE_TTL_MS) {
        return localMedia;
      }
    }
  } catch (dbError) {
    console.warn("Database unavailable. Falling back to live provider data only.", dbError);
  }

  // Fetch from provider with caching
  try {
    const fetchProvider = async () => tmdb.getMediaDetails(externalId, type);
    const cachedProvider = withCache(fetchProvider, ['media-details', type, externalId], CACHE_TTL.METADATA);
    const providerData = await cachedProvider();
    
    if (!providerData) {
      return localMedia; // Return stale cache if provider fails gracefully
    }

    // Try to cache it, but don't fail if DB is offline
    try {
      await importMedia(providerData);
      return await prisma.media.findUnique({
        where: { externalId_type: { externalId, type } },
        include: {
          genres: { include: { genre: true } },
          alternativeTitles: true,
          cast: { include: { person: true } },
          crew: { include: { person: true } },
          seasons: { include: { episodes: true } },
          availability: { include: { provider: true } },
        }
      });
    } catch (importError) {
      // DB is down, just return the mapped provider data directly so the UI doesn't crash
      return {
        id: 'temp-id',
        externalId: providerData.externalId,
        type: providerData.type,
        title: providerData.title,
        originalTitle: providerData.originalTitle || null,
        overview: providerData.overview || null,
        posterPath: providerData.posterPath || null,
        backdropPath: providerData.backdropPath || null,
        releaseDate: providerData.releaseDate || null,
        status: providerData.status || null,
        runtime: providerData.runtime || null,
        genres: providerData.genres?.map(g => ({ genre: { name: g } })) || [],
        alternativeTitles: [],
        cast: [],
        crew: [],
        seasons: [],
        availability: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
  } catch (error) {
    console.error('Failed to fetch media details from TMDB:', error);
    if (localMedia) return localMedia;
    throw new Error('Media not found');
  }
}
