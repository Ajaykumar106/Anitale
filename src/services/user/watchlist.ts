import { prisma } from '@/lib/prisma';
import { MediaType } from '@prisma/client';

export async function toggleWatchlist(userId: string, externalId: string, type: MediaType) {
  // Find internal media id
  const media = await prisma.media.findUnique({
    where: { externalId_type: { externalId, type } },
  });

  if (!media) throw new Error('Media not found in local database');

  const existing = await prisma.watchlist.findUnique({
    where: {
      userId_mediaId: {
        userId,
        mediaId: media.id,
      },
    },
  });

  if (existing) {
    await prisma.watchlist.delete({ where: { id: existing.id } });
    return false; // Removed
  } else {
    await prisma.watchlist.create({
      data: {
        userId,
        mediaId: media.id,
      },
    });
    return true; // Added
  }
}

export async function getWatchlist(userId: string) {
  const watchlist = await prisma.watchlist.findMany({
    where: { userId },
    include: { media: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return watchlist.map((item) => item.media);
}
