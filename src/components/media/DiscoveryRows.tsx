import { MediaType } from '@prisma/client';
import { getTrendingMedia, getDiscoverMedia } from '@/services/media/trending';
import { MediaRow } from './MediaRow';
import { MediaCard } from './MediaCard';
import { SectionHeader } from './SectionHeader';

export async function DiscoveryRows({ type }: { type: MediaType }) {
  const [trending, topRated] = await Promise.all([
    getTrendingMedia(type),
    getDiscoverMedia(type, { top_rated: true }),
  ]);

  if ((!trending || trending.length === 0) && (!topRated || topRated.length === 0)) {
    return null;
  }

  const renderRow = (title: string, data: any[]) => {
    if (!data || data.length === 0) return null;
    return (
      <section className="space-y-4">
        <SectionHeader title={title} className="px-0 md:px-0 lg:px-0" />
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
    <div className="space-y-8 mt-12">
      {renderRow("Trending Now", trending)}
      {renderRow("Top Rated", topRated)}
    </div>
  );
}
