import { prisma } from '@/lib/prisma';
import { MediaType } from '@prisma/client';

export async function addToHistory(userId: string, externalId: string, type: MediaType, episodeId?: string) {
  const media = await prisma.media.findUnique({
    where: { externalId_type: { externalId, type } },
  });

  if (!media) throw new Error('Media not found in local database');

  return prisma.watchHistory.create({
    data: {
      userId,
      mediaId: media.id,
      episodeId,
    },
  });
}

export async function getHistory(userId: string) {
  return prisma.watchHistory.findMany({
    where: { userId },
    include: { media: true },
    orderBy: { watchedAt: 'desc' },
    take: 50,
  });
}
