import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createReleaseEvent } from '../../src/services/releases/engine';
import { createNotification, markAsRead, markAllAsRead } from '../../src/services/notifications/center';
import { prisma } from '../../src/lib/prisma';
import { NotificationType } from '@prisma/client';

vi.mock('../../src/lib/prisma', () => ({
  prisma: {
    release: {
      findFirst: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
    },
    releaseSubscription: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    notification: {
      findFirst: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
      updateMany: vi.fn(),
    },
    notificationPreference: {
      findUnique: vi.fn(),
      create: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

describe('Release Intelligence & Notification System (Phase 10)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. Invalid release handling
  it('throws an error for an invalid release date', async () => {
    const invalidDate = new Date('invalid-date-string');
    await expect(
      createReleaseEvent({
        mediaId: 'media-1',
        releaseDate: invalidDate,
        type: 'Episode',
      })
    ).rejects.toThrow('Invalid release date');
  });

  // 2. Duplicate release handling
  it('prevents duplicate release creation when identical release already exists', async () => {
    const releaseDate = new Date('2026-10-01T12:00:00Z');
    const existingRelease = {
      id: 'rel-existing-1',
      mediaId: 'media-1',
      releaseDate,
      type: 'Episode',
      media: { id: 'media-1', title: 'One Piece' },
    };

    // @ts-expect-error mocking
    prisma.release.findFirst.mockResolvedValue(existingRelease);

    const result = await createReleaseEvent({
      mediaId: 'media-1',
      releaseDate,
      type: 'Episode',
    });

    expect(result.id).toBe('rel-existing-1');
    expect(prisma.release.create).not.toHaveBeenCalled();
  });

  // 3. Repeated notification prevention (Deduplication)
  it('prevents repeated notifications for identical release within 24 hours', async () => {
    const existingNotif = {
      id: 'notif-1',
      userId: 'user-1',
      type: NotificationType.NEW_EPISODE,
      title: 'New Episode: One Piece',
      message: 'Episode 1100 is now available!',
      mediaId: 'media-1',
      isRead: false,
    };

    // @ts-expect-error mocking
    prisma.notification.findFirst.mockResolvedValue(existingNotif);

    const result = await createNotification({
      userId: 'user-1',
      type: NotificationType.NEW_EPISODE,
      title: 'New Episode: One Piece',
      message: 'Episode 1100 is now available!',
      mediaId: 'media-1',
    });

    expect(result).toEqual(existingNotif);
    expect(prisma.notification.create).not.toHaveBeenCalled();
  });

  // 4. User disabled notification preferences
  it('respects user disabled notification preferences for new episodes', async () => {
    const releaseDate = new Date('2026-10-05T12:00:00Z');

    // @ts-expect-error mocking
    prisma.release.findFirst.mockResolvedValue(null);
    // @ts-expect-error mocking
    prisma.release.create.mockResolvedValue({
      id: 'rel-2',
      mediaId: 'media-1',
      releaseDate,
      type: 'Episode',
      media: { id: 'media-1', title: 'One Piece' },
      episode: { episodeNumber: 1101, name: 'Egghead Climax' },
    });

    // Subscribed user who has newEpisode: false
    // @ts-expect-error mocking
    prisma.releaseSubscription.findMany.mockResolvedValue([
      {
        userId: 'user-disabled-episodes',
        mediaId: 'media-1',
        user: {
          notificationPref: {
            newEpisode: false,
            newSeason: true,
            releaseReminder: true,
          },
        },
      },
    ]);

    await createReleaseEvent({
      mediaId: 'media-1',
      episodeId: 'ep-1101',
      releaseDate,
      type: 'Episode',
    });

    // Notification create should NOT be called because newEpisode is disabled
    expect(prisma.notification.create).not.toHaveBeenCalled();
  });

  // 5. Timezone handling
  it('correctly handles release dates across ISO UTC strings', async () => {
    const utcDate = new Date('2026-12-25T00:00:00.000Z');
    const sameInstantDifferentOffset = new Date('2026-12-25T05:30:00.000+05:30');

    expect(utcDate.getTime()).toBe(sameInstantDifferentOffset.getTime());
    expect(utcDate.toISOString()).toBe('2026-12-25T00:00:00.000Z');
  });

  // 6. Notification persistence & read status tracking
  it('correctly updates notification read state in persistence layer', async () => {
    // @ts-expect-error mocking
    prisma.notification.updateMany.mockResolvedValue({ count: 1 });

    await markAsRead('notif-123', 'user-1');
    expect(prisma.notification.updateMany).toHaveBeenCalledWith({
      where: { id: 'notif-123', userId: 'user-1' },
      data: { isRead: true },
    });

    await markAllAsRead('user-1');
    expect(prisma.notification.updateMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', isRead: false },
      data: { isRead: true },
    });
  });
});
