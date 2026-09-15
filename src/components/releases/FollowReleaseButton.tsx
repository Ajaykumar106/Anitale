'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Loader2 } from 'lucide-react';

interface FollowReleaseButtonProps {
  mediaId: string;
  initialSubscribed?: boolean;
}

export function FollowReleaseButton({ mediaId, initialSubscribed = false }: FollowReleaseButtonProps) {
  const [subscribed, setSubscribed] = useState(initialSubscribed);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/releases/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaId })
      });

      if (res.ok) {
        const data = await res.json();
        setSubscribed(data.subscribed);
      }
    } catch (e) {
      console.error('Failed to toggle subscription', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size="lg"
      variant={subscribed ? "secondary" : "outline"}
      onClick={handleToggle}
      disabled={loading}
      className="flex items-center gap-2"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : subscribed ? (
        <BellOff className="w-4 h-4 text-primary" />
      ) : (
        <Bell className="w-4 h-4" />
      )}
      {subscribed ? 'Following Releases' : 'Follow Releases'}
    </Button>
  );
}
