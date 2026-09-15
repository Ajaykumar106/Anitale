'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, AlertCircle, RefreshCw } from 'lucide-react';

interface PlaybackSource {
  url: string;
  quality: string;
  format: string;
}

interface PlaybackData {
  sources: PlaybackSource[];
  isEmbed: boolean;
  embedUrl?: string;
}

interface ResolvedPlayback {
  providerId: string;
  providerName: string;
  playback: PlaybackData;
}

export function WatchPlayer({ mediaId, episodeId }: { mediaId: string; episodeId?: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ResolvedPlayback | null>(null);

  const fetchPlayback = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = episodeId ? `/api/watch/${mediaId}/${episodeId}` : `/api/watch/${mediaId}`;
      const res = await fetch(endpoint);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${res.status}: Failed to resolve playback`);
      }

      const result: ResolvedPlayback = await res.json();
      setData(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [mediaId, episodeId]);
  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPlayback();
  }, [fetchPlayback]);

  if (loading) {
    return (
      <div className="w-full aspect-video bg-black rounded-lg flex flex-col items-center justify-center text-white">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-sm font-medium">Resolving best provider...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full aspect-video bg-zinc-950 border border-zinc-800 rounded-lg flex flex-col items-center justify-center text-white p-6 text-center space-y-4">
        {error.includes('timeout') ? (
          <AlertTriangle className="w-12 h-12 text-yellow-500" />
        ) : (
          <AlertCircle className="w-12 h-12 text-red-500" />
        )}
        <div>
          <h3 className="text-lg font-semibold mb-1">Playback Unavailable</h3>
          <p className="text-sm text-zinc-400">{error}</p>
        </div>
        <Button onClick={fetchPlayback} variant="outline" className="mt-4">
          <RefreshCw className="w-4 h-4 mr-2" /> Try Again
        </Button>
      </div>
    );
  }

  if (!data?.playback) return null;

  return (
    <div className="space-y-4">
      <div className="w-full aspect-video bg-black rounded-lg overflow-hidden relative shadow-lg ring-1 ring-white/10">
        {data.playback.isEmbed && data.playback.embedUrl ? (
          <iframe
            src={data.playback.embedUrl}
            className="w-full h-full border-0"
            allowFullScreen
            allow="autoplay; encrypted-media"
          />
        ) : (
          <video
            controls
            autoPlay
            className="w-full h-full"
            src={data.playback.sources[0]?.url}
          />
        )}
      </div>
      
      <div className="flex items-center justify-between px-2 text-sm text-muted-foreground">
        <div className="flex items-center space-x-2">
          <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
          <span>Playing via <strong>{data.providerName}</strong></span>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchPlayback}>
          Change Provider
        </Button>
      </div>
    </div>
  );
}
