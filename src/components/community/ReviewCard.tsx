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

      <div className="text-sm leading-relaxed">
        {review.hasSpoilers && !showSpoiler ? (
          <div className="relative rounded-md border border-destructive/20 bg-destructive/10 p-6 flex flex-col items-center justify-center space-y-3">
            <div className="text-destructive font-semibold flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Spoiler Warning
            </div>
            <p className="text-muted-foreground text-center text-xs">
              This review contains story spoilers.
            </p>
            <Button variant="outline" size="sm" onClick={() => setShowSpoiler(true)}>
              Reveal Spoilers
            </Button>
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
