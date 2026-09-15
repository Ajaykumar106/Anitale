import { prisma } from '@/lib/prisma';

export interface UserProfile {
  userId: string;
  topGenreIds: string[];
  favoriteMediaIds: Set<string>;
  droppedMediaIds: Set<string>;
  completedMediaIds: Set<string>;
  watchlistMediaIds: Set<string>;
  recentActivityMediaIds: Set<string>;
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
  const [history, watchlist, progress, reviews] = await Promise.all([
    prisma.watchHistory.findMany({
      where: { userId },
      orderBy: { watchedAt: 'desc' },
      take: 50,
      include: { media: { include: { genres: true } } }
    }),
    prisma.watchlist.findMany({
      where: { userId },
      select: { mediaId: true }
    }),
    prisma.watchProgress.findMany({
      where: { userId },
    }),
    prisma.review.findMany({
      where: { userId },
      include: { media: { include: { genres: true } } }
    })
  ]);

  const recentActivityMediaIds = new Set(history.map(h => h.mediaId));
  const watchlistMediaIds = new Set(watchlist.map(w => w.mediaId));
  const completedMediaIds = new Set(progress.filter(p => p.isCompleted).map(p => p.mediaId));
  
  // High ratings >= 7 are favorites
  const favoriteMediaIds = new Set(reviews.filter(r => r.rating >= 7).map(r => r.mediaId));

  // Dropped = low ratings (<= 3) or abandoned progress (todo: refine heuristics)
  const droppedMediaIds = new Set(reviews.filter(r => r.rating <= 3).map(r => r.mediaId));

  // Determine top genres
  const genreCounts: Record<string, number> = {};
  
  // Positively weighted genres
  history.forEach(h => {
    h.media.genres.forEach(g => {
      genreCounts[g.genreId] = (genreCounts[g.genreId] || 0) + 1;
    });
  });

  reviews.filter(r => r.rating >= 7).forEach(r => {
    r.media.genres.forEach(g => {
      genreCounts[g.genreId] = (genreCounts[g.genreId] || 0) + 2; // Extra weight for favorites
    });
  });

  // Sort and pick top 5
  const topGenreIds = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(e => e[0]);

  return {
    userId,
    topGenreIds,
    favoriteMediaIds,
    droppedMediaIds,
    completedMediaIds,
    watchlistMediaIds,
    recentActivityMediaIds
  };
}
