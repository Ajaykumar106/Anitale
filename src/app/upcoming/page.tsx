import { getUpcomingReleases } from '@/services/releases/engine';
import { PosterImage } from '@/components/media/PosterImage';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { FollowReleaseButton } from '@/components/releases/FollowReleaseButton';

export const metadata = {
  title: 'Upcoming Releases | Anitale',
};

export default async function UpcomingPage() {
  const releases = await getUpcomingReleases(30);

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upcoming Releases</h1>
        <p className="text-muted-foreground mt-1">
          Anticipated movies, series, and episodes arriving soon.
        </p>
      </div>

      {releases.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed text-center p-4">
          <p className="text-lg font-medium text-muted-foreground">No upcoming releases recorded yet.</p>
          <p className="text-sm text-muted-foreground/80 mt-1">
            Check back later as new seasonal schedules and premiere dates are announced.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {releases.map((rel) => {
            const relDate = new Date(rel.releaseDate);
            const formattedDate = relDate.toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            return (
              <div
                key={rel.id}
                className="group relative flex flex-col rounded-lg border bg-card overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                <div className="aspect-[2/3] w-full relative overflow-hidden bg-muted">
                  <PosterImage
                    src={rel.media.posterPath}
                    alt={rel.media.title}
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="bg-black/75 text-white backdrop-blur">
                      {rel.type}
                    </Badge>
                  </div>
                </div>

                <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
                  <div>
                    <div className="text-xs font-medium text-primary mb-1">
                      {formattedDate}
                    </div>
                    <Link
                      href={`/${rel.media.type.toLowerCase()}/${rel.media.id}`}
                      className="font-semibold line-clamp-1 hover:underline text-foreground"
                    >
                      {rel.media.title}
                    </Link>
                    {rel.episode && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Episode {rel.episode.episodeNumber}: {rel.episode.name || 'TBA'}
                      </p>
                    )}
                    {rel.season && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Season {rel.season.seasonNumber}: {rel.season.name || 'TBA'}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t flex items-center justify-between">
                    <FollowReleaseButton mediaId={rel.media.id} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
