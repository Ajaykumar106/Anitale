import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createReview, updateReview, deleteReview } from '../../src/services/community/reviews';
import { addComment, toggleLike, toggleFollow } from '../../src/services/community/interactions';
import { prisma } from '../../src/lib/prisma';

vi.mock('../../src/lib/prisma', () => ({
  prisma: {
    review: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn(), delete: vi.fn() },
    comment: { create: vi.fn() },
    block: { findFirst: vi.fn(), findUnique: vi.fn(), delete: vi.fn(), create: vi.fn() },
    like: { findUnique: vi.fn(), create: vi.fn(), delete: vi.fn() },
    follow: { findUnique: vi.fn(), create: vi.fn(), delete: vi.fn() },
  }
}));

// We must mock the rate limiter so tests don't randomly fail
vi.mock('../../src/lib/rate-limit', () => ({
  checkRateLimit: vi.fn().mockReturnValue(true) // default to passing
}));

import { checkRateLimit } from '../../src/lib/rate-limit';

describe('Community & Moderation (Phase 5)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-expect-error Mocking
    checkRateLimit.mockReturnValue(true);
  });

  describe('Review Abuse & Moderation', () => {
    it('strips unsafe HTML from reviews via sanitize-html', async () => {
      // @ts-expect-error Mocking
      prisma.review.create.mockResolvedValue({ id: 'r1' });
      
      const maliciousContent = '<script>alert("XSS")</script><p>Nice movie</p>';
      
      await createReview('u1', 'm1', 8, maliciousContent);
      
      expect(prisma.review.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          content: '<p>Nice movie</p>'
        })
      }));
    });

    it('rejects review creation if rate limit exceeded', async () => {
      // @ts-expect-error Mocking
      checkRateLimit.mockReturnValue(false);
      
      await expect(createReview('u1', 'm1', 8, 'Spam')).rejects.toThrow('Rate limit exceeded');
    });
  });

  describe('Review Permissions', () => {
    it('prevents users from updating someone else\'s review', async () => {
      // @ts-expect-error Mocking
      prisma.review.findUnique.mockResolvedValue({ id: 'r1', userId: 'u2' });
      
      await expect(updateReview('u1', 'r1', 5)).rejects.toThrow('Unauthorized');
    });

    it('allows admins to delete any review, but regular users only their own', async () => {
      // @ts-expect-error Mocking
      prisma.review.findUnique.mockResolvedValue({ id: 'r1', userId: 'u2', user: { role: 'USER' } });
      await expect(deleteReview('u1', 'r1')).rejects.toThrow('Unauthorized');

      // @ts-expect-error Mocking
      prisma.review.findUnique.mockResolvedValue({ id: 'r1', userId: 'u2', user: { role: 'ADMIN' } });
      // Admin should succeed
      // @ts-expect-error Mocking
      prisma.review.delete.mockResolvedValue(true);
      await expect(deleteReview('u1', 'r1')).resolves.not.toThrow();
    });
  });

  describe('Interaction Blocks', () => {
    it('prevents adding a comment if blocked by review author', async () => {
      // @ts-expect-error Mocking
      prisma.review.findUnique.mockResolvedValue({ id: 'r1', userId: 'author' });
      // @ts-expect-error Mocking
      prisma.block.findFirst.mockResolvedValue({ id: 'b1' }); // represents a block existing
      
      await expect(addComment('u1', 'r1', 'Hey')).rejects.toThrow('Cannot interact with this user');
    });
  });
});
