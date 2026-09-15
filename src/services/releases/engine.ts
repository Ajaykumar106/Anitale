import { prisma } from '@/lib/prisma';
import { NotificationType } from '@prisma/client';
import { createNotification } from '../notifications/center';

export async function createReleaseEvent(data: {
  mediaId: string;
  seasonId?: string;
  episodeId?: string;
  region?: string;
  releaseDate: Date;
  type: string;
  note?: string;
}) {
  // Validate release date
  if (!data.releaseDate || isNaN(data.releaseDate.getTime())) {
    throw new Error('Invalid release date');
  }

  // Prevent duplicate release creation
  const existingRelease = await prisma.release.findFirst({
    where: {
      mediaId: data.mediaId,
      releaseDate: data.releaseDate,
      type: data.type,
      ...(data.episodeId ? { episodeId: data.episodeId } : {}),
      ...(data.seasonId ? { seasonId: data.seasonId } : {})
    },
    include: {
      media: true,
      episode: true,
      season: true
    }
  });

  if (existingRelease) {
    return existingRelease;
  }

  // 1. Create the release event in the database
  const release = await prisma.release.create({
    data: {
      mediaId: data.mediaId,
      seasonId: data.seasonId,
      episodeId: data.episodeId,
      region: data.region,
      releaseDate: data.releaseDate,
      type: data.type,
      note: data.note,
    },
    include: {
      media: true,
      episode: true,
      season: true
    }
  });

  // 2. Find users who subscribe to this media
  type SubWithUser = {
    userId: string;
    user: {
      notificationPref: {
        newEpisode: boolean;
        newSeason: boolean;
        releaseReminder: boolean;
      } | null;
    };
  };

  let subscriptions: SubWithUser[] = [];
  try {
    subscriptions = await prisma.releaseSubscription.findMany({
      where: { mediaId: data.mediaId },
      include: {
        user: {
          include: { notificationPref: true }
        }
      }
    });
  } catch (err) {
    console.warn('Could not fetch subscriptions', err);
  }

  // 3. Dispatch notifications
  const promises = subscriptions.map(async (sub) => {
    const prefs = sub.user.notificationPref;
    
    // Check preferences (User disabled notification)
    if (data.type === 'Episode' && prefs && !prefs.newEpisode) return;
    if (data.type === 'Season' && prefs && !prefs.newSeason) return;
    if ((data.type === 'Theatrical' || data.type === 'Digital') && prefs && !prefs.releaseReminder) return;

    let notifType: NotificationType = NotificationType.NEW_EPISODE;
    if (data.type === 'Season') notifType = NotificationType.NEW_SEASON;
    else if (data.type === 'Theatrical' || data.type === 'Digital') notifType = NotificationType.RELEASE_REMINDER;

    let title = `New Release: ${release.media.title}`;
    let message = `A new release for ${release.media.title} is now available.`;

    if (data.type === 'Episode' && release.episode) {
      title = `New Episode: ${release.media.title}`;
      message = `Episode ${release.episode.episodeNumber} is now available!`;
    } else if (data.type === 'Season' && release.season) {
      title = `New Season: ${release.media.title}`;
      message = `Season ${release.season.seasonNumber} is now available!`;
    }

    await createNotification({
      userId: sub.userId,
      type: notifType,
      title,
      message,
      mediaId: data.mediaId
    });
  });

  await Promise.all(promises);

  return release;
}

export async function getCalendarReleases(startDate: Date, endDate: Date) {
  try {
    return await prisma.release.findMany({
      where: {
        releaseDate: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        media: true,
        episode: true,
        season: true
      },
      orderBy: {
        releaseDate: 'asc'
      }
    });
  } catch (_err) {
    return [];
  }
}

export async function getUpcomingReleases(limit = 20) {
  try {
    const now = new Date();
    return await prisma.release.findMany({
      where: {
        releaseDate: {
          gte: now
        }
      },
      include: {
        media: true,
        episode: true,
        season: true
      },
      orderBy: {
        releaseDate: 'asc'
      },
      take: limit
    });
  } catch (_err) {
    return [];
  }
}

export async function getRecentReleases(limit = 20) {
  try {
    const now = new Date();
    return await prisma.release.findMany({
      where: {
        releaseDate: {
          lte: now
        }
      },
      include: {
        media: true,
        episode: true,
        season: true
      },
      orderBy: {
        releaseDate: 'desc'
      },
      take: limit
    });
  } catch (_err) {
    return [];
  }
}

export async function toggleSubscription(userId: string, mediaId: string) {
  const existing = await prisma.releaseSubscription.findUnique({
    where: {
      userId_mediaId: { userId, mediaId }
    }
  });

  if (existing) {
    await prisma.releaseSubscription.delete({ where: { id: existing.id } });
    return false;
  } else {
    await prisma.releaseSubscription.create({ data: { userId, mediaId } });
    return true;
  }
}
