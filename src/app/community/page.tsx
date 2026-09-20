import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Star, Eye } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Community | Anitale',
};

export const revalidate = 60; // Revalidate every 60 seconds

export default async function CommunityPage() {
  // Fetch recent reviews
  const recentReviews = await prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      user: {
        include: { profile: true }
      },
      media: true
    }
  });

  // Fetch recent watch history (from progress)
  const recentWatches = await prisma.watchProgress.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 15,
    include: {
      user: {
        include: { profile: true }
      },
      media: true
    }
  });

  return (
    <div className="container py-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">Community Feed</h1>
        <p className="text-muted-foreground">Discover what others are watching and reviewing.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Recent Reviews */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-white/10">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Latest Reviews</h2>
          </div>
          <div className="space-y-4">
            {recentReviews.map((review) => (
              <Card key={review.id} className="bg-zinc-900/50 border-white/5 shadow-lg">
                <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border border-white/10">
                      <AvatarImage src={review.user.image || review.user.profile?.avatarUrl || ''} />
                      <AvatarFallback className="bg-primary/20 text-primary text-xs">
                        {review.user.name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white">{review.user.name || 'Anonymous'}</span>
                      <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-0.5 rounded text-yellow-500 text-sm font-bold">
                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                    {review.rating.toFixed(1)}
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Link href={`/${review.media.type.toLowerCase()}/${review.media.externalId}`} className="text-xs font-bold text-primary hover:underline block mb-2">
                    {review.media.title}
                  </Link>
                  <p className="text-sm text-zinc-300 line-clamp-3 leading-relaxed">
                    {review.hasSpoilers ? <span className="italic text-muted-foreground">[Spoiler Warning] Tap on movie page to read.</span> : review.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Column: Recent Watches */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-white/10">
            <Eye className="w-5 h-5 text-green-500" />
            <h2 className="text-xl font-semibold">Just Watched</h2>
          </div>
          <div className="space-y-3">
            {recentWatches.map((watch) => {
               const url = `/${watch.media.type.toLowerCase()}/${watch.media.externalId}${watch.seasonNumber && watch.episodeNumber ? `?season=${watch.seasonNumber}&episode=${watch.episodeNumber}` : ''}`;
               
               return (
                <Link key={watch.id} href={url} className="flex items-center gap-4 p-3 rounded-xl bg-zinc-900/30 border border-white/5 hover:bg-zinc-800/80 transition-all group">
                  <img 
                    src={watch.media.posterPath ? `https://image.tmdb.org/t/p/w92${watch.media.posterPath}` : ''} 
                    alt={watch.media.title}
                    className="w-12 h-16 object-cover rounded shadow-md group-hover:scale-105 transition-transform"
                  />
                  <div className="flex flex-col min-w-0">
                    <p className="text-sm text-muted-foreground mb-1">
                      <span className="font-medium text-white">{watch.user.name || 'Anonymous'}</span> started watching:
                    </p>
                    <p className="text-sm font-bold text-white line-clamp-1 group-hover:text-primary transition-colors">
                      {watch.media.title}
                    </p>
                    {watch.seasonNumber && watch.episodeNumber && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Season {watch.seasonNumber} • Ep {watch.episodeNumber}
                      </p>
                    )}
                    <span className="text-[10px] text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(watch.updatedAt), { addSuffix: true })}
                    </span>
                  </div>
                </Link>
               );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
