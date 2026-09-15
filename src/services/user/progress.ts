import { prisma } from '@/lib/prisma';
import { MediaType } from '@prisma/client';

export async function updateProgress(userId: string, externalId: string, type: MediaType, progressSeconds: number, seasonNumber?: number, episodeNumber?: number, isCompleted: boolean = false) {
  const media = await prisma.media.findUnique({
    where: { externalId_type: { externalId, type } },
  });

  if (!media) throw new Error('Media not found in local database');

  return prisma.watchProgress.upsert({
    where: {
      userId_mediaId_seasonNumber_episodeNumber: {
        userId,
        mediaId: media.id,
        seasonNumber: seasonNumber || 0,
        episodeNumber: episodeNumber || 0,
      },
    },
    update: {
      progressSeconds,
      isCompleted,
    },
    create: {
      userId,
      mediaId: media.id,
      seasonNumber: seasonNumber || 0,
      episodeNumber: episodeNumber || 0,
      progressSeconds,
      isCompleted,
    },
  });
}

export async function getContinueWatching(userId: string) {
  const progress = await prisma.watchProgress.findMany({
    where: { 
      userId,
      isCompleted: false,
    },
    include: { media: true },
    orderBy: { updatedAt: 'desc' },
    take: 10,
  });

  return progress;
}
