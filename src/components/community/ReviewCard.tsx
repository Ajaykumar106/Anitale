'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Flag, Heart, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export function ReviewCard({ review }: { review: any }) {
  const [showSpoiler, setShowSpoiler] = useState(false);

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex justify-between items-start">
        <Link href={`/user/${review.user.id}`} className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <div className="h-10 w-10 rounded-full bg-muted overflow-hidden">
            {review.user.image ? (
              <img src={review.user.image} alt={review.user.name || 'User'} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                {(review.user.name || 'A')[0]}
              </div>
            )}
          </div>
          <div>
            <div className="font-medium">{review.user.name || 'Anonymous'}</div>
            <div className="text-xs text-muted-foreground hover:underline">
              {new Date(review.createdAt).toLocaleDateString()}
            </div>
          </div>
        </Link>
        <div className="font-bold text-lg px-3 py-1 bg-primary/10 text-primary rounded-md">
          {review.rating} / 10
        </div>
      </div>

      <div className="text-sm leading-relaxed relative">
        {review.hasSpoilers && !showSpoiler ? (
          <div className="relative cursor-pointer group" onClick={() => setShowSpoiler(true)}>
            <p className="whitespace-pre-wrap blur-md select-none opacity-50 transition-all duration-300 group-hover:blur-sm">{review.content}</p>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="bg-zinc-900/80 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-lg flex items-center gap-2 text-white font-medium shadow-xl group-hover:bg-zinc-800 transition-colors">
                <Eye className="w-4 h-4 text-primary" />
                Tap to Reveal Spoiler
              </div>
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap">{review.content}</p>
        )}
      </div>

      <div className="flex items-center gap-4 text-muted-foreground pt-2 border-t">
        <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2">
          <Heart className="w-4 h-4" />
          <span>{review._count.likes}</span>
        </Button>
        <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2">
          <MessageSquare className="w-4 h-4" />
          <span>{review._count.comments}</span>
        </Button>
        <div className="flex-1" />
        <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2 text-destructive/70 hover:text-destructive">
          <Flag className="w-4 h-4" />
          <span className="sr-only">Report</span>
        </Button>
      </div>
    </div>
  );
}
