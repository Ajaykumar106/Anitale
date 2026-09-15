import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSimilarMedia, getHomeRecommendations } from '../../src/services/recommendations/engine';
import { prisma } from '../../src/lib/prisma';
import { MediaType } from '@prisma/client';

vi.mock('../../src/lib/prisma', () => ({
  prisma: {
    media: { findUnique: vi.fn(), findMany: vi.fn() },
    watchHistory: { findMany: vi.fn() },
    review: { findMany: vi.fn() }
  }
}));

describe('Recommendation Engine (Phase 6)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSimilarMedia', () => {
    it('returns deterministically scored items based on genre overlap', async () => {
      // Mock source media
      // @ts-expect-error: mocking
      prisma.media.findUnique.mockResolvedValue({
        id: 'm1',
        title: 'Source Movie',
        type: MediaType.MOVIE,
        releaseDate: new Date('2020-01-01'),
        genres: [{ genreId: 'g1' }, { genreId: 'g2' }]
      });

      // Mock candidates
      // @ts-expect-error: mocking
      prisma.media.findMany.mockResolvedValue([
        { id: 'c1', title: 'Candidate 1', type: MediaType.MOVIE, releaseDate: new Date('2021-01-01'), genres: [{ genreId: 'g1' }] },
        { id: 'c2', title: 'Candidate 2', type: MediaType.MOVIE, releaseDate: new Date('2019-01-01'), genres: [{ genreId: 'g1' }, { genreId: 'g2' }] },
        { id: 'c3', title: 'Candidate 3', type: MediaType.MOVIE, releaseDate: new Date('2010-01-01'), genres: [{ genreId: 'g2' }] }
      ]);

      const recs = await getSimilarMedia('m1', 10);
      
      // c2 has 2 overlapping genres and within 3 years (high score)
      // c1 has 1 overlapping genre and within 3 years (medium score)
      // c3 has 1 overlapping genre and > 3 years (low score)
      expect(recs[0].media.id).toBe('c2');
      expect(recs[1].media.id).toBe('c1');
      expect(recs[2].media.id).toBe('c3');
      expect(recs[0].reason).toBe('Similar to Source Movie');
    });

    it('throws if media not found', async () => {
      // @ts-expect-error: mocking
      prisma.media.findUnique.mockResolvedValue(null);
      await expect(getSimilarMedia('invalid')).rejects.toThrow('Media not found');
    });
  });

  describe('getHomeRecommendations', () => {
    it('excludes already watched and highly rated items', async () => {
      // @ts-expect-error: mocking
      prisma.watchHistory.findMany.mockResolvedValue([
        { mediaId: 'w1', media: { title: 'Watched 1', genres: [{ genreId: 'g1' }] } }
      ]);
      // @ts-expect-error: mocking
      prisma.review.findMany.mockResolvedValue([
        { mediaId: 'r1', media: { title: 'Rated 1', genres: [{ genreId: 'g1' }] } }
      ]);

      // @ts-expect-error: mocking
      prisma.media.findMany.mockResolvedValue([
        { id: 'c1', title: 'Candidate 1', genres: [{ genreId: 'g1', genre: { name: 'Action' } }] }
      ]);

      await getHomeRecommendations('u1');

      // Check that findMany explicitly excludes 'w1' and 'r1'
      expect(prisma.media.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          id: { notIn: ['w1', 'r1'] }
        })
      }));
    });

    it('returns popular fallback if user has no history', async () => {
      // @ts-expect-error: mocking
      prisma.watchHistory.findMany.mockResolvedValue([]);
      // @ts-expect-error: mocking
      prisma.review.findMany.mockResolvedValue([]);
      // @ts-expect-error: mocking
      prisma.media.findMany.mockResolvedValue([
        { id: 'f1', title: 'Fallback 1' }
      ]);

      const recs = await getHomeRecommendations('u1');
      expect(recs[0].reason).toBe('Popular and Recently Released');
    });

    it('generates appropriate explanation reasons', async () => {
      // @ts-expect-error: mocking
      prisma.watchHistory.findMany.mockResolvedValue([
        { mediaId: 'w1', media: { title: 'Watched 1', genres: [{ genreId: 'g1' }] } }
      ]);
      // @ts-expect-error: mocking
      prisma.review.findMany.mockResolvedValue([]);
      // @ts-expect-error: mocking
      prisma.media.findMany.mockResolvedValue([
        { id: 'c1', title: 'Candidate 1', genres: [{ genreId: 'g1', genre: { name: 'Sci-Fi' } }] }
      ]);

      const recs = await getHomeRecommendations('u1');
      expect(recs[0].reason).toBe('Because you like Sci-Fi');
    });
  });
});
