import { MediaType } from '@prisma/client';
import { getMediaDetails } from '@/services/media/details';
import { HeroCarouselClient } from './HeroCarouselClient';

export async function HeroBanner({ items, type }: { items: { externalId: string, type: string }[], type?: MediaType }) {
  const topItems = items.slice(0, 5);
  const detailsList = await Promise.all(
    topItems.map(item => getMediaDetails(item.externalId, item.type as MediaType))
  );

  const validDetails = detailsList.filter((d): d is NonNullable<typeof d> => d !== null);

  if (validDetails.length === 0) return null;

  return <HeroCarouselClient items={validDetails} />;
}
