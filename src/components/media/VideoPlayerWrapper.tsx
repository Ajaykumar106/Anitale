"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Server, Settings2, Loader2, Play, AudioLines, Subtitles, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface VideoPlayerProps {
  tmdbId: string;
  mediaId?: string;
  type: 'MOVIE' | 'SERIES' | 'ANIME';
  season?: number;
  episode?: number;
  onNextEpisode?: () => void;
}

const SERVERS = [
  { id: 'vidsrc-net', name: 'Server 1 (Vidsrc Net)', url: (type: string, id: string, s?: number, e?: number) => `https://vidsrc.net/embed/${type}/${id}${s && e ? `/${s}/${e}` : ''}` },
  { id: 'vidsrc-pm', name: 'Server 2 (Vidsrc PM)', url: (type: string, id: string, s?: number, e?: number) => `https://vidsrc.pm/embed/${type}/${id}${s && e ? `/${s}/${e}` : ''}` },
  { id: 'vidsrc-xyz', name: 'Server 3 (Vidsrc XYZ)', url: (type: string, id: string, s?: number, e?: number) => `https://vidsrc.xyz/embed/${type}/${id}${s && e ? `/${s}/${e}` : ''}` },
  { id: 'vidsrc-cc', name: 'Server 4 (Vidsrc CC)', url: (type: string, id: string, s?: number, e?: number) => `https://vidsrc.cc/embed/${type}/${id}${s && e ? `/${s}/${e}` : ''}` },
  { id: 'superembed', name: 'Server 5 (SuperEmbed)', url: (type: string, id: string, s?: number, e?: number) => `https://multiembed.mov/?video_id=${id}&tmdb=1` },
  { id: 'vidlink', name: 'Server 6 (VidLink)', url: (type: string, id: string, s?: number, e?: number) => `https://vidlink.pro/${type === 'tv' ? 'tv' : 'movie'}/${id}${s && e ? `/${s}/${e}` : ''}` },
  { id: 'embedsu', name: 'Server 7 (EmbedSU)', url: (type: string, id: string, s?: number, e?: number) => `https://embed.su/embed/${type === 'tv' ? 'tv' : 'movie'}/${id}${s && e ? `/${s}/${e}` : ''}` },
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

  if (mediaType === 'tv' && (!season || !episode)) {
    return (
      <div className="w-full aspect-video bg-zinc-900 rounded-xl flex items-center justify-center border border-white/10 shadow-2xl animate-in fade-in duration-700">
        <div className="flex flex-col items-center gap-4 text-center px-4">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
            <Play className="w-8 h-8 text-muted-foreground ml-1" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Select an Episode</h3>
            <p className="text-muted-foreground max-w-sm">Please select a season and episode below to start watching.</p>
          </div>
        </div>
      </div>
    );
  }

  const iframeSrc = activeServer.url(mediaType, tmdbId, season, episode);

  return (
    <div className="flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-700">
      <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
        
        {/* Minimalist Top Bar (Hidden by default, shows on hover) */}
        <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/80 to-transparent z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex justify-between items-start px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-semibold text-white/90 text-sm drop-shadow-md">Anitale Player</span>
          </div>
        </div>

        {/* Loading State Overlay */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4 drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
              <div className="text-white text-lg font-bold tracking-wide">Loading Secure Stream...</div>
              <div className="text-muted-foreground text-sm mt-2 flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin"></span>
                Optimizing playback quality
              </div>
            </div>
          )}
        </div>

        {/* The Actual Video Iframe */}
        <div className="relative w-full h-full z-20">
          <iframe 
            src={iframeSrc} 
            className={cn("w-full h-full border-0 transition-opacity duration-1000", isLoading ? "opacity-0 scale-105" : "opacity-100 scale-100")} 
            allowFullScreen 
            title="Video Player"
            onLoad={() => setIsLoading(false)}
          />
        </div>
      </div>

      {/* Control Bar Below Player */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2 py-1">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <AudioLines className="w-4 h-4 text-green-500" />
            <span className="font-medium text-white/90">Multi-Audio (EN, HI, JP)</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Subtitles className="w-4 h-4 text-yellow-500" />
            <span className="font-medium text-white/90">Subtitles Available</span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 hover:text-primary h-9 rounded-lg px-4 flex-1 sm:flex-none font-bold shadow-lg shadow-primary/5">
                <Settings className="w-4 h-4 mr-2" />
                Change Server
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-zinc-950 border-zinc-800 text-white p-2 shadow-2xl">
              <div className="px-2 py-2 text-xs font-semibold text-red-400 uppercase tracking-wider mb-1 bg-red-500/10 rounded-md border border-red-500/20">
                If video doesn't play, try another server!
              </div>
              <div className="px-2 py-1.5 text-[10px] text-muted-foreground uppercase tracking-wider mb-1 mt-2">
                Available Servers
              </div>
              {SERVERS.map(s => (
                <DropdownMenuItem 
                  key={s.id} 
                  onClick={() => setActiveServer(s)}
                  className={cn("rounded-md cursor-pointer my-0.5", activeServer.id === s.id && "bg-primary text-primary-foreground focus:bg-primary focus:text-primary-foreground")}
                >
                  <Server className="w-4 h-4 mr-2 opacity-70" />
                  {s.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {onNextEpisode && (
            <Button 
              onClick={() => {
                try { if (navigator.vibrate) navigator.vibrate([50]); } catch (e) {}
                onNextEpisode();
              }}
              variant="default" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 px-6 rounded-lg shadow-lg shadow-primary/20 flex-1 sm:flex-none active:scale-95 transition-transform"
            >
              Next Episode 
              <Play className="w-4 h-4 ml-2 fill-current" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
