import { auth } from '@/lib/auth';
import { getWatchlist } from '@/services/user/watchlist';
import { MediaGrid } from '@/components/media/MediaGrid';
import { MediaCard } from '@/components/media/MediaCard';
import { redirect } from 'next/navigation';

export default async function WatchlistPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const watchlist = await getWatchlist(session.user.id);

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Your Watchlist</h1>
      {watchlist.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
          <p className="text-muted-foreground">Your watchlist is empty.</p>
        </div>
      ) : (
        <MediaGrid>
          {watchlist.map((media) => (
            <MediaCard
              key={media.id}
              id={media.externalId}
              title={media.title}
              type={media.type}
              posterPath={media.posterPath}
              year={media.releaseDate?.getFullYear()}
            />
          ))}
        </MediaGrid>
      )}
    </div>
  );
}
