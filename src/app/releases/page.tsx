import { getRecentReleases, getUpcomingReleases } from '@/services/releases/engine';
import { PosterImage } from '@/components/media/PosterImage';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Sparkles } from 'lucide-react';
import { FollowReleaseButton } from '@/components/releases/FollowReleaseButton';

export const metadata = {
  title: 'Release Intelligence Hub | Anitale',
};

export default async function ReleasesPage() {
  const [recent, upcoming] = await Promise.all([
    getRecentReleases(12),
    getUpcomingReleases(8)
  ]);

  return (
    <div className="container py-8 space-y-10">
      {/* Header & Quick Navigation */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Release Intelligence Hub</h1>
          <p className="text-muted-foreground mt-1">
            Track fresh drops, scheduled premieres, and new episode alerts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/calendar">
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Calendar View
            </Button>
          </Link>
          <Link href="/upcoming">
            <Button className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Upcoming Schedule
            </Button>
          </Link>
        </div>
      </div>

      {/* Fresh Releases Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h2 className="text-2xl font-semibold tracking-tight">Latest Releases</h2>
        </div>

        {recent.length === 0 ? (
          <div className="p-8 border rounded-lg border-dashed text-center text-muted-foreground">
            No recent releases tracked yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recent.map((rel) => {
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
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        Released {formattedDate}
                      </div>
                      <Link
                        href={`/${rel.media.type.toLowerCase()}/${rel.media.id}`}
                        className="font-semibold line-clamp-1 hover:underline text-foreground"
                      >
                        {rel.media.title}
                      </Link>
                      {rel.episode && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Episode {rel.episode.episodeNumber}: {rel.episode.name || 'Available'}
                        </p>
                      )}
                      {rel.season && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Season {rel.season.seasonNumber}: {rel.season.name || 'Available'}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t flex items-center justify-between">
                      <FollowReleaseButton mediaId={rel.media.id} />
                      <Link href={`/${rel.media.type.toLowerCase()}/${rel.media.id}`}>
                        <Button size="sm" variant="default">Details</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sneak Peek at Upcoming */}
      <div className="space-y-4 pt-6 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <h2 className="text-2xl font-semibold tracking-tight">Coming Soon Preview</h2>
          </div>
          <Link href="/upcoming" className="text-sm text-primary hover:underline">
            View all upcoming →
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div className="p-8 border rounded-lg border-dashed text-center text-muted-foreground">
            No upcoming schedule available.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {upcoming.slice(0, 4).map((rel) => (
              <div key={rel.id} className="p-3 border rounded-md bg-card flex gap-3 items-center">
                <div className="w-12 h-16 relative shrink-0 rounded overflow-hidden">
                  <PosterImage src={rel.media.posterPath} alt={rel.media.title} sizes="48px" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-primary">
                    {new Date(rel.releaseDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </p>
                  <Link href={`/${rel.media.type.toLowerCase()}/${rel.media.id}`} className="text-sm font-medium line-clamp-1 hover:underline">
                    {rel.media.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">{rel.type}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
