import { auth } from '@/lib/auth';
import { getContinueWatching } from '@/services/user/progress';
import { MediaGrid } from '@/components/media/MediaGrid';
import { MediaCard } from '@/components/media/MediaCard';
import { redirect } from 'next/navigation';

export default async function ContinueWatchingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const progressList = await getContinueWatching(session.user.id);

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Continue Watching</h1>
      {progressList.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
          <p className="text-muted-foreground">You are all caught up.</p>
        </div>
      ) : (
        <MediaGrid>
          {progressList.map((entry) => (
            <div key={entry.id} className="relative">
              <MediaCard
                id={entry.media.externalId}
                title={entry.media.title}
                type={entry.media.type}
                posterPath={entry.media.posterPath}
                year={entry.media.releaseDate?.getFullYear()}
              />
              <div className="mt-2 w-full bg-muted rounded-full h-1.5">
                {/* Progress bar placeholder - assumes 30 min / 1800s total for demo */}
                <div 
                  className="bg-primary h-1.5 rounded-full" 
                  style={{ width: `${Math.min((entry.progressSeconds / 1800) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </MediaGrid>
      )}
    </div>
  );
}
