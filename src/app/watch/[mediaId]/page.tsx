import { WatchPlayer } from '@/components/media/WatchPlayer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getMediaDetails } from '@/services/media/details';
import { MediaType } from '@prisma/client';

export default async function WatchMoviePage({
  params
}: {
  params: Promise<{ mediaId: string }>
}) {
  const { mediaId } = await params;
  
  // Try to fetch basic details for the header (fallback gracefully if DB/TMDB fails)
  let title = 'Watch Movie';
  const backLink = `/movie/${mediaId}`;
  
  try {
    const media = await getMediaDetails(mediaId, MediaType.MOVIE);
    if (media) title = media.title;
  } catch (_err) {
    // ignore
  }

  return (
    <div className="container max-w-5xl py-8 space-y-6">
      <div className="flex items-center space-x-4">
        <Link href={backLink}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      </div>
      
      <WatchPlayer mediaId={mediaId} />
      
      <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-4 mt-8">
        <p className="text-sm text-yellow-600 dark:text-yellow-400">
          <strong>Legal Disclaimer:</strong> Anitale strictly utilizes authorized metadata and embed providers. We do not download, proxy, disguise, bypass, or extract unauthorized copyrighted streams.
        </p>
      </div>
    </div>
  );
}
