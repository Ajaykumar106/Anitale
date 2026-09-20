"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Server, Settings2 } from 'lucide-react';

interface VideoPlayerProps {
  tmdbId: string;
  type: 'MOVIE' | 'SERIES' | 'ANIME';
  season?: number;
  episode?: number;
}

const SERVERS = [
  { id: 'vidsrc-pro', name: 'Server 1 (Primary)', url: (type: string, id: string, s?: number, e?: number) => `https://vidsrc.pro/embed/${type}/${id}${s && e ? `/${s}/${e}` : ''}` },
  { id: 'superembed', name: 'Server 2 (Multi-Language)', url: (type: string, id: string, s?: number, e?: number) => `https://multiembed.mov/?video_id=${id}&tmdb=1` }, // SuperEmbed style
  { id: '2embed', name: 'Server 3 (Backup)', url: (type: string, id: string, s?: number, e?: number) => `https://www.2embed.cc/embed/${type === 'movie' ? id : `tv/${id}&s=${s}&e=${e}`}` },
  { id: 'vidsrc-to', name: 'Server 4 (VidSrc)', url: (type: string, id: string, s?: number, e?: number) => `https://vidsrc.to/embed/${type}/${id}${s && e ? `/${s}/${e}` : ''}` }
];

export function VideoPlayerWrapper({ tmdbId, type, season, episode }: VideoPlayerProps) {
  const [activeServer, setActiveServer] = useState(SERVERS[0]);
  const mediaType = type === 'SERIES' || type === 'ANIME' ? 'tv' : 'movie';
  
  // Show a message if it's a series but no episode is selected yet.
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
    <div className="w-full max-w-6xl mx-auto mb-8 mt-4 flex flex-col gap-2">
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
              onClick={() => setActiveServer(server)}
              className={activeServer.id === server.id ? 'bg-primary text-primary-foreground' : 'bg-zinc-800 hover:bg-zinc-700'}
            >
              {server.name}
            </Button>
          ))}
        </div>
      </div>
      <div className="w-full aspect-video bg-black rounded-xl shadow-2xl overflow-hidden ring-1 ring-white/10 flex items-center justify-center relative group">
        {/* Loading placeholder text behind the iframe */}
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm z-0">
          Loading video player...
        </div>
        <iframe 
          src={iframeSrc} 
          className="w-full h-full border-0 z-10 relative bg-black" 
          allowFullScreen 
          title="Video Player"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        />
      </div>
    </div>
  );
}
