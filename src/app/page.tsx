import { Metadata } from 'next';
import { Suspense } from 'react';
import { PersonalizedHomeFeeds } from '@/components/recommendations/PersonalizedHomeFeeds';
import { TrendingSections } from '@/components/home/TrendingSections';
import { MediaRowSkeleton } from '@/components/media/MediaRowSkeleton';
import { SectionHeader } from '@/components/media/SectionHeader';

export const metadata: Metadata = {
  title: 'Anitale - Discover Entertainment',
};

export const revalidate = 43200; 

export default function Home() {
  return (
    <div className="container py-8 space-y-8">
      <section className="space-y-4">
        <div className="rounded-xl bg-primary/10 p-8 md:p-12 text-center flex flex-col items-center">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-primary">Welcome to Anitale</h1>
          <p className="mt-4 text-muted-foreground max-w-xl text-lg">
            Discover, track, and review your favorite movies, series, and anime all in one place.
          </p>
        </div>
      </section>

      <PersonalizedHomeFeeds />

      <Suspense fallback={
        <div className="space-y-8">
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
    </div>
  );
}
