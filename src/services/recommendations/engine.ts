import { prisma } from '@/lib/prisma';
import { Media } from '@prisma/client';
import { CACHE_TTL, withCache } from '@/lib/cache';

export interface ScoredRecommendation {
  media: Media;
  score: number;
  reason: string;
}

export async function getSimilarMedia(mediaId: string, limit: number = 10): Promise<ScoredRecommendation[]> {
  const sourceMedia = await prisma.media.findUnique({
    where: { id: mediaId },
    include: { genres: true }
  });

  if (!sourceMedia) throw new Error('Media not found');

  const sourceGenreIds = sourceMedia.genres.map(g => g.genreId);

  // Find media with overlapping genres
  const candidates = await prisma.media.findMany({
    where: {
      id: { not: sourceMedia.id },
      type: sourceMedia.type, // Same type (Movie vs Series)
      genres: {
        some: {
          genreId: { in: sourceGenreIds }
        }
      }
    },
    include: { genres: true },
    take: 50 // Pull a slightly larger pool to score in memory
  });

  const scored = candidates.map(candidate => {
    let score = 0;
    
    // 1. Genre Similarity (Weight: 50)
    const candidateGenreIds = candidate.genres.map(g => g.genreId);
    const overlap = candidateGenreIds.filter(id => sourceGenreIds.includes(id)).length;
    score += (overlap / Math.max(sourceGenreIds.length, 1)) * 50;

    // 2. Recency (Weight: 20) - bonus if released within last 3 years of each other
    if (sourceMedia.releaseDate && candidate.releaseDate) {
      const yearDiff = Math.abs(sourceMedia.releaseDate.getFullYear() - candidate.releaseDate.getFullYear());
      if (yearDiff <= 3) score += 20;
      else if (yearDiff <= 10) score += 10;
    }

    return {
      media: candidate,
      score,
      reason: `Similar to ${sourceMedia.title}`
    };
  });

  // Sort by score desc
  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

export async function getHomeRecommendations(userId: string, limit: number = 10): Promise<ScoredRecommendation[]> {
  // 1. Fetch user history and high ratings
  const history = await prisma.watchHistory.findMany({
    where: { userId },
    include: { media: { include: { genres: true } } },
    orderBy: { watchedAt: 'desc' },
    take: 20,
  });

  const highRatings = await prisma.review.findMany({
    where: { userId, rating: { gte: 7 } },
    include: { media: { include: { genres: true } } },
    take: 20,
  });

  const userInteractedMediaIds = new Set([
    ...history.map(h => h.mediaId),
    ...highRatings.map(r => r.mediaId)
  ]);

  // If no data, return basic popular/recent
  if (userInteractedMediaIds.size === 0) {
    return getFallbackRecommendations(limit);
  }

  // 2. Build User Profile (Top Genres)
  const genreCounts: Record<string, { count: number, name: string }> = {};
  
  [...history, ...highRatings].forEach(entry => {
    entry.media.genres.forEach(g => {
      // We need the genre name, but genreId is enough for grouping.
      const gid = g.genreId;
      if (!genreCounts[gid]) genreCounts[gid] = { count: 0, name: gid };
      genreCounts[gid].count += 1;
    });
  });

  // Sort genres by frequency
  const topGenreIds = Object.entries(genreCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 3)
    .map(entry => entry[0]);

  // 3. Find candidates
  const candidates = await prisma.media.findMany({
    where: {
      id: { notIn: Array.from(userInteractedMediaIds) },
      genres: {
        some: { genreId: { in: topGenreIds } }
      }
    },
    include: { genres: { include: { genre: true } } },
    take: 100
  });

  // 4. Score candidates
  const anchorMedia = history.length > 0 ? history[0].media.title : 'what you watched';

  const scored = candidates.map(candidate => {
    let score = 0;
    
    // Genre match
    const cGenres = candidate.genres.map(g => g.genreId);
    const overlap = topGenreIds.filter(id => cGenres.includes(id)).length;
    score += overlap * 20;

    // Recency (newer is slightly better)
    if (candidate.releaseDate) {
      const yearsOld = new Date().getFullYear() - candidate.releaseDate.getFullYear();
      if (yearsOld <= 2) score += 15;
      else if (yearsOld <= 5) score += 10;
    }

    // Reason generation
    let reason = `Recommended for you`;
    if (overlap > 0) {
      const topMatchedGenre = candidate.genres.find(g => topGenreIds.includes(g.genreId))?.genre?.name;
      if (topMatchedGenre) {
        reason = `Because you like ${topMatchedGenre}`;
      } else {
        reason = `Because you watched ${anchorMedia}`;
      }
    }

    return {
      media: candidate,
      score,
      reason
    };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

export async function getFallbackRecommendations(limit: number = 10): Promise<ScoredRecommendation[]> {
  const fetcher = async () => {
    const popular = await prisma.media.findMany({
      orderBy: { updatedAt: 'desc' }, // Assuming recently updated is popular for now
      take: limit,
      include: { genres: true }
    });

    return popular.map(media => ({
      media,
      score: 50,
      reason: 'Popular right now'
    }));
  };

  const cached = withCache(fetcher, ['fallback-recs', limit.toString()], CACHE_TTL.RECOMMENDATIONS);
  return await cached();
}
