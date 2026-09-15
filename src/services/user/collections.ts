import { prisma } from '@/lib/prisma';
import { MediaType } from '@prisma/client';

export async function createCollection(userId: string, name: string, description?: string, isPublic: boolean = true) {
  return prisma.collection.create({
    data: {
      userId,
      name,
      description,
      isPublic,
    },
  });
}

export async function getCollections(userId: string) {
  return prisma.collection.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { items: true } },
    },
    take: 50,
  });
}

export async function getCollection(id: string) {
  return prisma.collection.findUnique({
    where: { id },
    include: {
      items: {
        include: { media: true },
        orderBy: { order: 'asc' },
      },
      user: { select: { name: true, image: true } },
    },
  });
}

export async function addToCollection(userId: string, collectionId: string, externalId: string, type: MediaType) {
  const collection = await prisma.collection.findUnique({ where: { id: collectionId } });
  if (!collection || collection.userId !== userId) throw new Error('Not found or unauthorized');

  const media = await prisma.media.findUnique({
    where: { externalId_type: { externalId, type } },
  });

  if (!media) throw new Error('Media not found in local database');

  const count = await prisma.collectionItem.count({ where: { collectionId } });

  return prisma.collectionItem.create({
    data: {
      collectionId,
      mediaId: media.id,
      order: count,
    },
  });
}
