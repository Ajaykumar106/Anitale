import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toggleWatchlist } from '../../src/services/user/watchlist';
import { updateProgress } from '../../src/services/user/progress';
import { deleteAccount } from '../../src/services/user/profile';
import { prisma } from '../../src/lib/prisma';
import { MediaType } from '@prisma/client';

// Mock DB
vi.mock('../../src/lib/prisma', () => ({
  prisma: {
    media: { findUnique: vi.fn() },
    watchlist: { findUnique: vi.fn(), create: vi.fn(), delete: vi.fn() },
    watchProgress: { upsert: vi.fn() },
    user: { delete: vi.fn() },
  }
}));

describe('User Services Phase 4', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Watchlist Service', () => {
    it('should throw error on invalid media (Invalid Input/Not Found)', async () => {
      // @ts-expect-error Mocking
      prisma.media.findUnique.mockResolvedValue(null);
      await expect(toggleWatchlist('u1', 'invalid', MediaType.MOVIE)).rejects.toThrow('Media not found');
    });

    it('should add to watchlist if not present', async () => {
      // @ts-expect-error Mocking
      prisma.media.findUnique.mockResolvedValue({ id: 'm1' });
      // @ts-expect-error Mocking
      prisma.watchlist.findUnique.mockResolvedValue(null);
      // @ts-expect-error Mocking
      prisma.watchlist.create.mockResolvedValue({ id: 'w1' });

      const added = await toggleWatchlist('u1', 'ext1', MediaType.MOVIE);
      expect(added).toBe(true);
      expect(prisma.watchlist.create).toHaveBeenCalled();
    });

    it('should remove from watchlist if already present (Toggle logic)', async () => {
      // @ts-expect-error Mocking
      prisma.media.findUnique.mockResolvedValue({ id: 'm1' });
      // @ts-expect-error Mocking
      prisma.watchlist.findUnique.mockResolvedValue({ id: 'w1' });

      const added = await toggleWatchlist('u1', 'ext1', MediaType.MOVIE);
      expect(added).toBe(false);
      expect(prisma.watchlist.delete).toHaveBeenCalledWith({ where: { id: 'w1' } });
    });
  });

  describe('Watch Progress Service', () => {
    it('should persist watch progress', async () => {
      // @ts-expect-error Mocking
      prisma.media.findUnique.mockResolvedValue({ id: 'm1' });
      // @ts-expect-error Mocking
      prisma.watchProgress.upsert.mockResolvedValue({ id: 'p1' });

      await updateProgress('u1', 'ext1', MediaType.SERIES, 1200, 1, 7);
      expect(prisma.watchProgress.upsert).toHaveBeenCalledWith(expect.objectContaining({
        create: expect.objectContaining({ progressSeconds: 1200 }),
      }));
    });
  });

  describe('Account Deletion', () => {
    it('should call prisma.user.delete ensuring cascade wipes data', async () => {
      // @ts-expect-error Mocking
      prisma.user.delete.mockResolvedValue({ id: 'u1' });
      await deleteAccount('u1');
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 'u1' } });
    });
  });
});
