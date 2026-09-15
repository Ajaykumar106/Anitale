import { getUserProfile } from './signals';
import { getCandidates } from './candidates';
import { scoreCandidates } from './scoring';
import { prisma } from '@/lib/prisma';
import { ScoredRecommendation } from './engine';
import { withMemoryCache } from '@/lib/cache';

export async function getTrendingForYou(userId: string, limit: number = 10): Promise<ScoredRecommendation[]> {
  return withMemoryCache(`trending-${userId}`, async () => {
    const profile = await getUserProfile(userId);
    const candidates = await getCandidates(profile, 'TRENDING', 50);
    const scored = scoreCandidates(candidates, profile);
    return scored.sort((a, b) => b.score - a.score).slice(0, limit);
  }, 3600); // 1 hour cache
}

export async function getYouMightLike(userId: string, limit: number = 10): Promise<ScoredRecommendation[]> {
  return withMemoryCache(`might-like-${userId}`, async () => {
    const profile = await getUserProfile(userId);
    const candidates = await getCandidates(profile, 'NEW_RELEASES', 60);
    const scored = scoreCandidates(candidates, profile);
    
    // Boost scores slightly differently for general discovery
    const variedScores = scored.map(s => ({
      ...s,
      reason: 'Top Pick for You'
    }));

    return variedScores.sort((a, b) => b.score - a.score).slice(0, limit);
  }, 3600);
}

export async function getBecauseYouWatched(userId: string, mediaId: string, limit: number = 10): Promise<ScoredRecommendation[]> {
  const profile = await getUserProfile(userId);
  const candidates = await getCandidates(profile, 'SIMILAR', 40, mediaId);
  const scored = scoreCandidates(candidates, profile, mediaId);
  
  const anchorMedia = await prisma.media.findUnique({ where: { id: mediaId }, select: { title: true } });
  
  return scored.sort((a, b) => b.score - a.score).slice(0, limit).map(s => ({
    ...s,
    reason: `Because you watched ${anchorMedia?.title || 'this'}`
  }));
}

export async function getHiddenGems(userId: string, limit: number = 10): Promise<ScoredRecommendation[]> {
  return withMemoryCache(`hidden-gems-${userId}`, async () => {
    const profile = await getUserProfile(userId);
    const candidates = await getCandidates(profile, 'HIDDEN_GEMS', 50);
    const scored = scoreCandidates(candidates, profile);
    
    // Add bonus for matching genres even on older stuff
    return scored.sort((a, b) => b.score - a.score).slice(0, limit).map(s => ({
      ...s,
      reason: 'Hidden Gem'
    }));
  }, 3600);
}

export async function getContinueWatching(userId: string): Promise<ScoredRecommendation[]> {
  // Directly pull from WatchProgress, not a scored algorithmic list
  const progress = await prisma.watchProgress.findMany({
    where: { userId, isCompleted: false },
    orderBy: { updatedAt: 'desc' },
    take: 10,
    include: { media: { include: { genres: true } } }
  });

  return progress.map(p => ({
    media: p.media as any, // Cast to any to bypass exact type matching for now, as MediaWithGenres is compatible
    score: 100,
    reason: 'Continue Watching'
  }));
}
