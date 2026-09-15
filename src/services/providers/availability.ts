import { prisma } from '@/lib/prisma';
import { MediaType, AvailabilityType } from '@prisma/client';
import { TMDBAdapter } from '@/providers/tmdb/adapter';

const tmdb = new TMDBAdapter(process.env.TMDB_API_KEY || 'dummy_key');

export async function syncProviderAvailability(externalId: string, type: MediaType, region: string) {
  // Fetch from provider
  const data = await tmdb.getAvailability(externalId, type, region);

  const media = await prisma.media.findUnique({
    where: { externalId_type: { externalId, type } }
  });

  if (!media) return null;

  // Clear existing for this region to do a full sync
  await prisma.providerAvailability.deleteMany({
    where: {
      mediaId: media.id,
      region,
    }
  });

  if (data.length === 0) return [];

  // Upsert Providers and Availability
  for (const item of data) {
    const provider = await prisma.provider.upsert({
      where: { externalId: item.providerExternalId },
      update: { name: item.providerName },
      create: { externalId: item.providerExternalId, name: item.providerName },
    });

    await prisma.providerAvailability.create({
      data: {
        mediaId: media.id,
        providerId: provider.id,
        region,
        type: item.type as AvailabilityType,
      }
    });
  }

  return prisma.providerAvailability.findMany({
    where: { mediaId: media.id, region },
    include: { provider: true }
  });
}
