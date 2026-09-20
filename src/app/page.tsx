import { Metadata } from 'next';
import { Suspense } from 'react';
import { PersonalizedHomeFeeds } from '@/components/recommendations/PersonalizedHomeFeeds';
import { TrendingSections } from '@/components/home/TrendingSections';
import { MediaRowSkeleton } from '@/components/media/MediaRowSkeleton';
import { SectionHeader } from '@/components/media/SectionHeader';
import { ContinueWatchingRow } from '@/components/media/ContinueWatchingRow';
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
  
  const latestMovies = await getDiscoverMedia(MediaType.MOVIE, { now_playing: true }) || [];
  const latestSeries = await getDiscoverMedia(MediaType.SERIES, { on_the_air: true }) || [];
  const latestUpdates = [];
  for (let i = 0; i < 10; i++) {
    if (latestMovies[i]) latestUpdates.push(latestMovies[i]);
    if (latestSeries[i]) latestUpdates.push(latestSeries[i]);
  }

  const renderRow = (title: string, data: any[], href?: string) => {
    if (!data || data.length === 0) return null;
    return (
      <section>
        <SectionHeader title={title} href={href} linkText="View All" />
        <MediaRow>
          {data.map((media, index) => (
            <div key={`${title}-${media.type}-${media.externalId}-${index}`} className="w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] flex-none">
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
        <Suspense fallback={<MediaRowSkeleton />}>
          <ContinueWatchingRow />
        </Suspense>
        
        {renderRow("Latest Releases & Updates", latestUpdates, "/releases")}
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
        
        {renderRow("Top 10 Today", top10, "/movie")}
      </div>
    </div>
  );
}
