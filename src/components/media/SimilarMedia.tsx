import { MediaType } from '@prisma/client';
import { getSimilarMedia } from '@/services/media/details';
import { MediaRow } from './MediaRow';
import { MediaCard } from './MediaCard';
import { SectionHeader } from './SectionHeader';

export async function SimilarMedia({ externalId, type }: { externalId: string, type: MediaType }) {
  const similar = await getSimilarMedia(externalId, type);

  if (!similar || similar.length === 0) {
    return (
      <section className="space-y-4">
        <SectionHeader title="Similar & Recommended" />
        <p className="text-muted-foreground italic px-4 md:px-12 lg:px-16">No similar recommendations found.</p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <SectionHeader title="Similar & Recommended" />
      <MediaRow>
        {similar.map((media) => (
          <div key={`similar-${media.externalId}`} className="w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] flex-none">
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
}
