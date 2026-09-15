'use client';

import { Share } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ShareButton({ title, text, url }: { title: string, text: string, url: string }) {
  const handleShare = async () => {
    const shareData = { title, text, url: `${window.location.origin}${url}` };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareData.url);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <Button variant="outline" size="icon" onClick={handleShare} title="Share">
      <Share className="w-4 h-4" />
    </Button>
  );
}
