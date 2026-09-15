'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface DismissButtonProps {
  mediaId: string;
}

export function DismissButton({ mediaId }: DismissButtonProps) {
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to the media page
    setDismissed(true);
    await fetch('/api/recommendations/dismiss', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mediaId, reason: 'NOT_INTERESTED' })
    });
  };

  if (dismissed) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      className="absolute top-2 left-2 h-6 w-6 rounded-full bg-black/50 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
      onClick={handleDismiss}
      title="Not Interested"
    >
      <X className="h-4 w-4" />
    </Button>
  );
}
