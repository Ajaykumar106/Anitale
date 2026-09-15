import { UserProfile } from './signals';
import { MediaWithGenres } from './candidates';
import { ScoredRecommendation } from './engine';

export function scoreCandidates(
  candidates: MediaWithGenres[],
  profile: UserProfile,
  anchorMediaId?: string
): ScoredRecommendation[] {
  return candidates.map(candidate => {
    let score = 0;
    let primaryReason = 'Recommended for you';

    // 1. Genre Affinity (Max +40)
    const candidateGenreIds = candidate.genres.map(g => g.genreId);
    let overlapCount = 0;
    for (const gid of candidateGenreIds) {
      if (profile.topGenreIds.includes(gid)) {
        overlapCount++;
      }
    }
    
    if (overlapCount > 0) {
      score += overlapCount * 10;
      primaryReason = 'Matches your favorite genres';
    }

    // 2. Watchlist Bonus (Max +20)
    if (profile.watchlistMediaIds.has(candidate.id)) {
      score += 20;
      primaryReason = 'From your watchlist';
    }

    // 3. Recency Bonus (Max +15)
    if (candidate.releaseDate) {
      const yearsOld = new Date().getFullYear() - candidate.releaseDate.getFullYear();
      if (yearsOld <= 1) score += 15;
      else if (yearsOld <= 3) score += 10;
      else if (yearsOld <= 10) score += 5;
    }

    // 4. Completed Penalty or Bonus?
    // Usually we don't recommend completed titles unless it's a rewatch strategy.
    // For standard recommendations, slightly penalize already watched things to encourage discovery
    if (profile.completedMediaIds.has(candidate.id)) {
      score -= 30; // Strongly discourage recommending already finished stuff
    }

    if (profile.recentActivityMediaIds.has(candidate.id)) {
      score -= 10; // Already in recent history
    }

    return {
      media: candidate,
      score,
      reason: primaryReason
    };
  });
}
