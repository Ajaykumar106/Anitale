import { prisma } from '@/lib/prisma';
import { MediaType } from '@prisma/client';
import { TMDBAdapter } from '@/providers/tmdb/adapter';
import { importMedia } from './import';
import { CACHE_TTL, withCache } from '@/lib/cache';
import { cache } from 'react';

const tmdb = new TMDBAdapter(process.env.TMDB_API_KEY || 'dummy_key');

// Cache duration 24 hours
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export const getMediaDetails = cache(async (externalId: string, type: MediaType) => {
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
      const isSeriesMissingSeasons = (type === 'SERIES' || type === 'ANIME') && localMedia.seasons.length === 0;
      const ageMs = Date.now() - localMedia.updatedAt.getTime();
      if (ageMs < CACHE_TTL_MS && !isSeriesMissingSeasons) {
        // Map local DB format to expected frontend format
        return {
          ...localMedia,
          voteAverage: localMedia.voteAverage || 0,
          credits: {
            cast: localMedia.cast.map((c: any) => ({
              id: c.person.externalId,
              name: c.person.name,
              character: c.character,
              order: c.order,
              profilePath: c.person.profilePath,
            })),
            crew: localMedia.crew.map((c: any) => ({
              id: c.person.externalId,
              name: c.person.name,
              job: c.job,
              department: c.department,
              profilePath: c.person.profilePath,
            }))
          }
        };
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
      const dbMedia = await prisma.media.findUnique({
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
      if (dbMedia && providerData.voteAverage) {
        await prisma.media.update({
          where: { id: dbMedia.id },
          data: { 
            voteAverage: providerData.voteAverage,
            voteCount: providerData.voteCount || 0
          }
        });
      }
      return dbMedia ? {
        ...dbMedia,
        credits: providerData.credits,
        voteAverage: providerData.voteAverage,
        seasons: providerData.seasons || dbMedia.seasons
      } : providerData as any;
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
        updatedAt: new Date(),
        credits: providerData.credits,
        voteAverage: providerData.voteAverage
      };
    }
  } catch (error) {
    console.error('Failed to fetch media details from TMDB:', error);
    if (localMedia) return localMedia;
    throw new Error('Media not found');
  }
});
  
export const getMediaAvailability = cache(async (externalId: string, type: MediaType, region: string = 'US') => {
  return tmdb.getAvailability(externalId, type, region);
});

export const getMediaTrailer = cache(async (externalId: string, type: MediaType) => {
  try {
    const endpoint = type === 'MOVIE' ? `/movie/${externalId}` : `/tv/${externalId}`;
    const response = await fetch(`https://api.themoviedb.org/3${endpoint}?api_key=${process.env.TMDB_API_KEY || 'dummy_key'}&append_to_response=videos`, {
      next: { revalidate: 86400 }
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (data.videos && data.videos.results) {
      const trailer = data.videos.results.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube') || data.videos.results.find((v: any) => v.site === 'YouTube');
      if (trailer) {
        return `https://www.youtube.com/embed/${trailer.key}`;
      }
    }
    return null;
  } catch (err) {
    return null;
  }
});

export const getSimilarMedia = cache(async (externalId: string, type: MediaType) => {
  return tmdb.getSimilar(externalId, type);
});
