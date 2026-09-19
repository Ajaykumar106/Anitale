import { Metadata } from 'next';
import { Suspense } from 'react';
import { PersonalizedHomeFeeds } from '@/components/recommendations/PersonalizedHomeFeeds';
import { TrendingSections } from '@/components/home/TrendingSections';
import { MediaRowSkeleton } from '@/components/media/MediaRowSkeleton';
import { SectionHeader } from '@/components/media/SectionHeader';
import { getTrendingMedia, getDiscoverMedia } from '@/services/media/trending';
import { HeroBanner } from '@/components/media/HeroBanner';
import { MediaType } from '@prisma/client';
import { MediaRow } from '@/components/media/MediaRow';
import { MediaCard } from '@/components/media/MediaCard';

export const metadata: Metadata = {
  title: 'Anitale - Discover Entertainment',
};

export const revalidate = 43200; 

export default async function Home() {
  const trendingAll = await getTrendingMedia();
  const top10 = await getDiscoverMedia(MediaType.MOVIE, { top_rated: true });

  const renderRow = (title: string, data: any[]) => {
    if (!data || data.length === 0) return null;
    return (
      <section>
        <SectionHeader title={title} />
        <MediaRow>
          {data.map((media) => (
            <div key={`${title}-${media.externalId}`} className="w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] flex-none">
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
    );
  };

  return (
    <div className="w-full pb-8 space-y-6 md:space-y-10">
      <Suspense fallback={<div className="w-full h-[75vh] md:h-[85vh] bg-muted animate-pulse" />}>
        {trendingAll && trendingAll.length > 0 && (
          <HeroBanner items={trendingAll} />
        )}
      </Suspense>

      <div className="space-y-6 md:space-y-10">
        <PersonalizedHomeFeeds />

        <Suspense fallback={
          <div className="space-y-6 md:space-y-10">
            <section>
              <SectionHeader title="Trending Now" />
              <MediaRowSkeleton />
            </section>
            <section>
              <SectionHeader title="Popular Movies" />
              <MediaRowSkeleton />
            </section>
          </div>
        }>
          <TrendingSections />
        </Suspense>
        
        {renderRow("Top 10 Today", top10)}
      </div>
    </div>
  );
}
