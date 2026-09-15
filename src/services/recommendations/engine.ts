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
  const fetcher = async () => {
    // 1. Fetch diverse user signals
    const [history, highRatings, watchlist, dismissals] = await Promise.all([
      prisma.watchHistory.findMany({
        where: { userId },
        include: { media: { include: { genres: true } } },
        orderBy: { watchedAt: 'desc' },
        take: 30,
      }),
      prisma.review.findMany({
        where: { userId, rating: { gte: 7 } },
        include: { media: { include: { genres: true } } },
        take: 20,
      }),
      prisma.watchlist.findMany({
        where: { userId },
        include: { media: { include: { genres: true } } },
        take: 30,
      }),
      prisma.mediaDismissal.findMany({
        where: { userId },
        select: { mediaId: true }
      })
    ]);

    const userInteractedMediaIds = new Set([
      ...history.map(h => h.mediaId),
      ...highRatings.map(r => r.mediaId),
      ...watchlist.map(w => w.mediaId),
      ...dismissals.map(d => d.mediaId)
    ]);

    if (userInteractedMediaIds.size === 0) {
      return getFallbackRecommendations(limit);
    }

    // 2. Build Weighted User Profile (Genre Affinity)
    const genreCounts: Record<string, { weight: number, name: string }> = {};
    
    // Weight signals differently
    const addGenreWeight = (media: any, weight: number) => {
      media.genres.forEach((g: any) => {
        const gid = g.genreId;
        if (!genreCounts[gid]) genreCounts[gid] = { weight: 0, name: gid };
        genreCounts[gid].weight += weight;
      });
    };

    history.forEach(h => addGenreWeight(h.media, 1.0)); // Watched = normal weight
    watchlist.forEach(w => addGenreWeight(w.media, 1.5)); // Intend to watch = high weight
    highRatings.forEach(r => addGenreWeight(r.media, 2.0)); // Loved it = very high weight

    const topGenreIds = Object.entries(genreCounts)
      .sort((a, b) => b[1].weight - a[1].weight)
      .slice(0, 5)
      .map(entry => entry[0]);

    // 3. Find candidates excluding interacted and dismissed
    const candidates = await prisma.media.findMany({
      where: {
        id: { notIn: Array.from(userInteractedMediaIds) },
        genres: {
          some: { genreId: { in: topGenreIds } }
        }
      },
      include: { genres: { include: { genre: true } } },
      take: 100 // Pool size for in-memory scoring
    });

    // 4. Rank candidates
    const anchorMedia = highRatings.length > 0 ? highRatings[0].media.title : (history.length > 0 ? history[0].media.title : 'what you like');

    const scored = candidates.map(candidate => {
      let score = 0;
      
      // Genre affinity match
      const cGenres = candidate.genres.map(g => g.genreId);
      const overlapWeight = cGenres.reduce((acc, gid) => {
        return acc + (genreCounts[gid]?.weight || 0);
      }, 0);
      score += overlapWeight * 5;

      // Recency
      if (candidate.releaseDate) {
        const yearsOld = new Date().getFullYear() - candidate.releaseDate.getFullYear();
        if (yearsOld <= 1) score += 20;
        else if (yearsOld <= 3) score += 10;
      }

      // Reason generation based on top overlapping genre
      let reason = `Recommended for you`;
      if (overlapWeight > 0) {
        const topMatchedGenre = candidate.genres
          .filter(g => topGenreIds.includes(g.genreId))
          .sort((a, b) => (genreCounts[b.genreId]?.weight || 0) - (genreCounts[a.genreId]?.weight || 0))[0]?.genre?.name;
          
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

    // Sort by score and introduce slight randomization for diversity
    return scored
      .sort((a, b) => b.score - a.score + (Math.random() * 10 - 5)) // +/- 5 points randomness
      .slice(0, limit);
  };

  const cached = withCache(fetcher, [`home-recs-${userId}`, limit.toString()], 1800); // 30 mins TTL
  return await cached();
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
