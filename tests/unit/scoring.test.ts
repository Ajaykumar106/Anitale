import { describe, it, expect } from 'vitest';
import { scoreCandidates } from '../../src/services/recommendations/scoring';
import { UserProfile } from '../../src/services/recommendations/signals';
import { MediaWithGenres } from '../../src/services/recommendations/candidates';

describe('Recommendation Scoring Engine (Phase 11)', () => {
  const mockProfile: UserProfile = {
    userId: 'user-1',
    topGenreIds: ['action', 'adventure'],
    favoriteMediaIds: new Set(),
    droppedMediaIds: new Set(),
    completedMediaIds: new Set(['completed-1']),
    watchlistMediaIds: new Set(['watchlist-1']),
    recentActivityMediaIds: new Set(['recent-1'])
  };

  const createMockCandidate = (id: string, genreIds: string[], releaseYear?: number): MediaWithGenres => ({
    id,
    externalId: `ext-${id}`,
    title: `Title ${id}`,
    type: 'ANIME',
    genres: genreIds.map(g => ({ mediaId: id, genreId: g })),
    releaseDate: releaseYear ? new Date(`${releaseYear}-01-01`) : null,
    createdAt: new Date(),
    updatedAt: new Date(),
    originalTitle: null,
    overview: null,
    posterPath: null,
    backdropPath: null,
    status: null,
    runtime: null
  });

  it('awards +10 points per matched genre', () => {
    const candidate1 = createMockCandidate('c1', ['action']); // 1 match
    const candidate2 = createMockCandidate('c2', ['action', 'adventure']); // 2 matches
    const candidate3 = createMockCandidate('c3', ['comedy']); // 0 matches

    const scored = scoreCandidates([candidate1, candidate2, candidate3], mockProfile);

    expect(scored.find(s => s.media.id === 'c1')?.score).toBe(10);
    expect(scored.find(s => s.media.id === 'c2')?.score).toBe(20);
    expect(scored.find(s => s.media.id === 'c3')?.score).toBe(0);
  });

  it('penalizes already completed media by -30', () => {
    const candidate = createMockCandidate('completed-1', ['comedy']);
    const scored = scoreCandidates([candidate], mockProfile);
    expect(scored[0].score).toBe(-30);
  });

  it('penalizes recent history by -10', () => {
    const candidate = createMockCandidate('recent-1', ['comedy']);
    const scored = scoreCandidates([candidate], mockProfile);
    expect(scored[0].score).toBe(-10);
  });

  it('awards +20 for watchlist media', () => {
    const candidate = createMockCandidate('watchlist-1', ['comedy']);
    const scored = scoreCandidates([candidate], mockProfile);
    expect(scored[0].score).toBe(20);
  });

  it('ranks higher scored items first when sorted', () => {
    const candidate1 = createMockCandidate('c1', ['action']); // +10
    const candidate2 = createMockCandidate('watchlist-1', ['action', 'adventure']); // +20 (genres) + 20 (watchlist) = 40

    const scored = scoreCandidates([candidate1, candidate2], mockProfile);
    const sorted = scored.sort((a, b) => b.score - a.score);

    expect(sorted[0].media.id).toBe('watchlist-1');
    expect(sorted[1].media.id).toBe('c1');
  });
});
