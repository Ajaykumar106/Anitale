import { Metadata } from 'next';
import { getTrendingMedia } from '@/services/media/trending';
import { MediaRow } from '@/components/media/MediaRow';
import { MediaCard } from '@/components/media/MediaCard';
import { SectionHeader } from '@/components/media/SectionHeader';
import { MediaType } from '@prisma/client';
import { HeroBanner } from '@/components/media/HeroBanner';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'TV Shows - Anitale',
};

export const revalidate = 43200;

export default async function ShowsPage() {
  const trending = await getTrendingMedia(MediaType.SERIES);
  
  if (!trending || trending.length === 0) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold">TV Shows</h1>
        <p className="text-muted-foreground mt-4">No TV shows available at the moment.</p>
      </div>
    );
  }

  const heroItem = trending[0];
  const remainingTrending = trending.slice(1);

  return (
    <div className="container py-6 space-y-8">
      <Suspense fallback={<div className="w-full h-[60vh] sm:h-[70vh] lg:h-[80vh] bg-muted animate-pulse rounded-xl" />}>
        <HeroBanner externalId={heroItem.externalId} type={MediaType.SERIES} />
      </Suspense>

      <section>
        <SectionHeader title="Trending Series" />
        <MediaRow>
          {remainingTrending.map((media) => (
            <div key={`series-${media.externalId}`} className="w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] flex-none">
              <MediaCard
                id={media.externalId}
                title={media.title}
                type={media.type}
                posterPath={media.posterPath}
                year={media.releaseDate ? new Date(media.releaseDate).getFullYear() : undefined}
              />
            </div>
          ))}
        </MediaRow>
      </section>
    </div>
  );
}
