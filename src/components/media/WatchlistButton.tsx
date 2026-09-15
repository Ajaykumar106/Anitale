'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { MediaType } from '@prisma/client';

interface WatchlistButtonProps {
  externalId: string;
  type: MediaType;
  initialInWatchlist?: boolean;
}

export function WatchlistButton({ externalId, type, initialInWatchlist = false }: WatchlistButtonProps) {
  const [inWatchlist, setInWatchlist] = useState(initialInWatchlist);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    // Optimistic update
    setInWatchlist(!inWatchlist);
    
    startTransition(async () => {
      try {
        const res = await fetch('/api/user/watchlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ externalId, type }),
        });
        
        if (!res.ok) {
          throw new Error('Failed to toggle');
        }
        
        const data = await res.json();
        setInWatchlist(data.inWatchlist);
      } catch (err) {
        // Revert on failure
        setInWatchlist(inWatchlist);
      }
    });
  };

  return (
    <Button 
      size="lg" 
      variant={inWatchlist ? "secondary" : "default"}
      onClick={handleToggle}
      disabled={isPending}
    >
      {inWatchlist ? '✓ In Watchlist' : 'Add to Watchlist'}
    </Button>
  );
}
