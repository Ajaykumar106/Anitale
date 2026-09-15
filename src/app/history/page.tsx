import { auth } from '@/lib/auth';
import { getHistory } from '@/services/user/history';
import { MediaGrid } from '@/components/media/MediaGrid';
import { MediaCard } from '@/components/media/MediaCard';
import { redirect } from 'next/navigation';

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const history = await getHistory(session.user.id);

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Watch History</h1>
      {history.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
          <p className="text-muted-foreground">You have no watch history yet.</p>
        </div>
      ) : (
        <MediaGrid>
          {history.map((entry) => (
            <div key={entry.id} className="relative">
              <MediaCard
                id={entry.media.externalId}
                title={entry.media.title}
                type={entry.media.type}
                posterPath={entry.media.posterPath}
                year={entry.media.releaseDate?.getFullYear()}
              />
              <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 text-[10px] text-white rounded">
                {new Date(entry.watchedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </MediaGrid>
      )}
    </div>
  );
}
