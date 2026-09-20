import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SectionHeader } from './SectionHeader';
import { MediaRow } from './MediaRow';
import { MediaCard } from './MediaCard';
import { Play } from 'lucide-react';
import Link from 'next/link';

export async function ContinueWatchingRow() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const progress = await prisma.watchProgress.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    take: 10,
    include: { media: true }
  });

  if (!progress || progress.length === 0) return null;

  return (
    <section>
      <SectionHeader title="Continue Watching" />
      <MediaRow>
        {progress.map((item) => {
          const href = `/${item.media.type.toLowerCase()}/${item.media.externalId}${item.seasonNumber && item.episodeNumber ? `?season=${item.seasonNumber}&episode=${item.episodeNumber}` : ''}`;
          
          return (
            <div key={item.id} className="w-[160px] sm:w-[200px] md:w-[240px] flex-none relative group">
              <MediaCard
                id={item.media.externalId}
                title={item.media.title}
                type={item.media.type}
                posterPath={item.media.posterPath}
                year={item.media.releaseDate ? new Date(item.media.releaseDate).getFullYear() : undefined}
                className="aspect-[16/9]" // wider aspect ratio for continue watching
              />
              {/* Progress overlay */}
              <Link href={href} className="absolute inset-0 z-20 flex flex-col justify-end p-3 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-primary p-2 rounded-full shadow-lg">
                    <Play className="w-4 h-4 text-white fill-white" />
                  </div>
                  {item.seasonNumber && item.episodeNumber && (
                    <span className="text-white font-bold text-sm bg-black/60 px-2 py-1 rounded">
                      S{item.seasonNumber} E{item.episodeNumber}
                    </span>
                  )}
                </div>
                <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-1/2" /> {/* Mock progress bar */}
                </div>
              </Link>
            </div>
          );
        })}
      </MediaRow>
    </section>
  );
}
