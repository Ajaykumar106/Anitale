"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Server, Settings2, Loader2, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface VideoPlayerProps {
  tmdbId: string;
  mediaId?: string;
  type: 'MOVIE' | 'SERIES' | 'ANIME';
  season?: number;
  episode?: number;
  onNextEpisode?: () => void;
}

const SERVERS = [
  { id: 'embedsu', name: 'Server 1 (Fastest & Reliable)', url: (type: string, id: string, s?: number, e?: number) => `https://embed.su/embed/${type}/${id}${s && e ? `/${s}/${e}` : ''}` },
  { id: 'vidsrc-me', name: 'Server 2 (Multi-Language)', url: (type: string, id: string, s?: number, e?: number) => `https://vidsrc.me/embed/${type}?tmdb=${id}${s && e ? `&season=${s}&episode=${e}` : ''}` },
  { id: 'vidsrc-cc', name: 'Server 3 (Backup HD)', url: (type: string, id: string, s?: number, e?: number) => `https://vidsrc.cc/v2/embed/${type}/${id}${s && e ? `/${s}/${e}` : ''}` },
  { id: 'superembed', name: 'Server 4 (Hindi Audio)', url: (type: string, id: string, s?: number, e?: number) => `https://multiembed.mov/?video_id=${id}&tmdb=1` },
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

  // Read preferred language from localStorage on mount safely
  React.useEffect(() => {
    try {
      const prefLang = localStorage.getItem('preferredLanguage');
      if (prefLang === 'Hindi') {
        setActiveServer(SERVERS[3]); // Server 4 is Hindi
      }
    } catch (e) {
      // Ignored for incognito strict modes
    }
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
      <div className="w-full aspect-video bg-black rounded-xl shadow-2xl overflow-hidden ring-1 ring-white/10 flex items-center justify-center relative group">
        
        {/* Top Bar for Server Selection */}
        <div className="absolute top-0 left-0 right-0 h-14 bg-gradient-to-b from-black/80 to-transparent z-40 flex justify-between items-center px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-2">
            <Play className="w-5 h-5 text-primary" />
            <span className="font-semibold text-white/90 text-sm hidden sm:inline-block">Now Playing</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Select 
              value={activeServer.id} 
              onValueChange={(val) => {
                const server = SERVERS.find(s => s.id === val);
                if (server) setActiveServer(server);
              }}
            >
              <SelectTrigger className="h-8 w-[200px] bg-black/50 border-white/10 text-xs text-white backdrop-blur-md hover:bg-black/80 transition-colors">
                <div className="flex items-center gap-2">
                  <Server className="w-3 h-3 text-primary" />
                  <SelectValue placeholder="Select Server" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                {SERVERS.map(s => (
                  <SelectItem key={s.id} value={s.id} className="text-xs">
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="absolute inset-0 z-10 pointer-events-none">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-sm">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <div className="text-white font-medium tracking-wide">Loading Media Engine...</div>
              <div className="text-muted-foreground text-sm mt-2">Connecting to {activeServer.name}</div>
            </div>
          )}
        </div>

        <div className="relative w-full h-full z-20">
          <iframe 
            src={iframeSrc} 
            className={cn("w-full h-full border-0 transition-opacity duration-1000", isLoading ? "opacity-0" : "opacity-100")} 
            allowFullScreen 
            title="Video Player"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            onLoad={() => setIsLoading(false)}
          />
          {onNextEpisode && (
            <Button 
              onClick={() => {
                try { if (navigator.vibrate) navigator.vibrate([50]); } catch (e) {}
                onNextEpisode();
              }}
              className="absolute bottom-4 right-4 z-30 bg-primary hover:bg-primary/90 text-white shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 active:scale-95"
            >
              Next Episode (Shift + N)
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
