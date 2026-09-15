'use client';

import { useState, useEffect } from 'react';
import { MediaCard } from '@/components/media/MediaCard';
import { MediaRow } from '@/components/media/MediaRow';
import { SectionHeader } from '@/components/media/SectionHeader';
import { ScoredRecommendation } from '@/services/recommendations/engine';

interface Feeds {
  trending: ScoredRecommendation[];
  mightLike: ScoredRecommendation[];
  gems: ScoredRecommendation[];
  continueWatching: ScoredRecommendation[];
}

export function PersonalizedHomeFeeds() {
  const [feeds, setFeeds] = useState<Feeds | null>(null);

  useEffect(() => {
    fetch('/api/recommendations/home?limit=10')
      .then(res => res.json())
      .then(data => {
        if (!data.error) setFeeds(data);
      })
      .catch(console.error);
  }, []);

  if (!feeds) return null; // Or a skeleton

  const renderFeed = (title: string, data: ScoredRecommendation[]) => {
    if (!data || data.length === 0) return null;
    return (
      <section className="space-y-4">
        <SectionHeader title={title} />
        <MediaRow>
          {data.map((rec) => (
            <div key={`${title}-${rec.media.id}`} className="w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] flex-none">
              <MediaCard
                id={rec.media.externalId}
                title={rec.media.title}
                type={rec.media.type}
                posterPath={rec.media.posterPath}
                year={rec.media.releaseDate ? new Date(rec.media.releaseDate).getFullYear() : undefined}
              />
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{rec.reason}</p>
            </div>
          ))}
        </MediaRow>
      </section>
    );
  };

  return (
    <div className="space-y-8">
      {renderFeed("Continue Watching", feeds.continueWatching)}
      {renderFeed("Trending For You", feeds.trending)}
      {renderFeed("You Might Like", feeds.mightLike)}
      {renderFeed("Hidden Gems", feeds.gems)}
    </div>
  );
}
