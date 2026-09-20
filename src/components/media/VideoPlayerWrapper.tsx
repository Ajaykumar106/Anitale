"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Server, Settings2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  tmdbId: string;
  mediaId?: string;
  type: 'MOVIE' | 'SERIES' | 'ANIME';
  season?: number;
  episode?: number;
  onNextEpisode?: () => void;
}

const SERVERS = [
  { id: 'vidsrc-pro', name: 'Server 1 (Primary HD)', url: (type: string, id: string, s?: number, e?: number) => `https://vidsrc.pro/embed/${type}/${id}${s && e ? `/${s}/${e}` : ''}` },
  { id: 'superembed', name: 'Server 2 (Hindi & Multi-Audio)', url: (type: string, id: string, s?: number, e?: number) => `https://multiembed.mov/?video_id=${id}&tmdb=1` },
  { id: 'vidsrc-me', name: 'Server 3 (Multi-Language)', url: (type: string, id: string, s?: number, e?: number) => `https://vidsrc.me/embed/${type}?tmdb=${id}${s && e ? `&season=${s}&episode=${e}` : ''}` },
  { id: '2embed', name: 'Server 4 (Backup)', url: (type: string, id: string, s?: number, e?: number) => `https://www.2embed.cc/embed/${type === 'movie' ? id : `tv/${id}&s=${s}&e=${e}`}` }
];

export function VideoPlayerWrapper({ tmdbId, mediaId, type, season, episode, onNextEpisode }: VideoPlayerProps) {
  const [activeServer, setActiveServer] = useState(SERVERS[0]);
  const [isLoading, setIsLoading] = useState(true);
  const mediaType = type === 'SERIES' || type === 'ANIME' ? 'tv' : 'movie';
  
  // Reset loading state when server or episode changes
  React.useEffect(() => {
    setIsLoading(true);
  }, [activeServer, tmdbId, season, episode]);

  // Log progress on mount/change
  React.useEffect(() => {
    if (mediaId) {
      fetch('/api/user/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaId, seasonNumber: season, episodeNumber: episode })
      }).catch(console.error);
    }
  }, [mediaId, season, episode]);

  // Read preferred language from localStorage on mount
  React.useEffect(() => {
    try {
      const prefLang = localStorage.getItem('preferredLanguage');
      if (prefLang === 'Hindi') {
        setActiveServer(SERVERS[1]);
      }
    } catch (e) {}
  }, []);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key.toLowerCase() === 'n' && onNextEpisode) {
        onNextEpisode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNextEpisode]);

  if (mediaType === 'tv' && (!season || !episode)) {
    return (
      <div className="w-full max-w-6xl mx-auto mb-8 mt-4 aspect-video bg-slate-900 rounded-xl shadow-2xl overflow-hidden ring-1 ring-white/10 flex flex-col items-center justify-center relative">
        <Server className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-bold text-white">Select an Episode</h3>
        <p className="text-muted-foreground">Please select a season and episode below to start watching.</p>
      </div>
    );
  }

  const iframeSrc = activeServer.url(mediaType, tmdbId, season, episode);

  return (
    <div className="w-full max-w-6xl mx-auto mb-8 mt-4 flex flex-col gap-2 animate-in fade-in duration-700">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-900/50 p-2 sm:p-3 rounded-lg border border-white/5 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground ml-2">
          <Settings2 className="w-4 h-4" /> 
          <span className="hidden sm:inline">Select Server (Change if video doesn't load):</span>
          <span className="sm:hidden">Server:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SERVERS.map((server) => (
            <Button
              key={server.id}
              variant={activeServer.id === server.id ? 'default' : 'secondary'}
              size="sm"
              onClick={() => {
                if (activeServer.id !== server.id) {
                  setActiveServer(server);
                }
              }}
              className={cn(
                "transition-all duration-300 ease-out",
                activeServer.id === server.id 
                  ? 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.5)]' 
                  : 'bg-zinc-800 hover:bg-zinc-700 hover:scale-105'
              )}
            >
              {server.name}
            </Button>
          ))}
        </div>
      </div>
      <div className="w-full aspect-video bg-black rounded-xl shadow-2xl overflow-hidden ring-1 ring-white/10 flex items-center justify-center relative group">
        {/* Apple-style smooth loading state */}
        {isLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md transition-opacity duration-500">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="text-sm font-medium text-white/70 animate-pulse tracking-wide">
              Connecting to {activeServer.name}...
            </p>
          </div>
        )}
        <iframe 
          src={iframeSrc} 
          className={cn(
            "w-full h-full border-0 z-10 relative bg-black transition-opacity duration-700 ease-in-out",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          allowFullScreen 
          title="Video Player"
          onLoad={() => setIsLoading(false)}
        />
        {onNextEpisode && (
          <Button 
            onClick={onNextEpisode}
            className="absolute bottom-4 right-4 z-30 bg-primary hover:bg-primary/90 text-white shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            Next Episode (Shift + N)
          </Button>
        )}
      </div>
    </div>
  );
}
