import { WatchPlayer } from '@/components/media/WatchPlayer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function WatchEpisodePage({
  params
}: {
  params: Promise<{ mediaId: string; episodeId: string }>
}) {
  const { mediaId, episodeId } = await params;
  
  return (
    <div className="container max-w-5xl py-8 space-y-6">
      <div className="flex items-center space-x-4">
        <Link href={`/show/${mediaId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Watch Episode</h1>
          <p className="text-muted-foreground text-sm">Media: {mediaId} | Episode: {episodeId}</p>
        </div>
      </div>
      
      <WatchPlayer mediaId={mediaId} episodeId={episodeId} />
      
      <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-4 mt-8">
        <p className="text-sm text-yellow-600 dark:text-yellow-400">
          <strong>Legal Disclaimer:</strong> Anitale strictly utilizes authorized metadata and embed providers. We do not download, proxy, disguise, bypass, or extract unauthorized copyrighted streams.
        </p>
      </div>
    </div>
  );
}
