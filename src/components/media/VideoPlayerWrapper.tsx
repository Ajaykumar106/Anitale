import React from 'react';

interface VideoPlayerProps {
  tmdbId: string;
  type: 'MOVIE' | 'SERIES' | 'ANIME';
}

export function VideoPlayerWrapper({ tmdbId, type }: VideoPlayerProps) {
  // Example of how you will use this:
  // const iframeSrc = `https://your-server.com/embed/${type.toLowerCase()}/${tmdbId}`;

  return (
    <div className="w-full max-w-6xl mx-auto mb-8 mt-4 aspect-video bg-slate-900 rounded-xl shadow-2xl overflow-hidden ring-1 ring-white/10 flex items-center justify-center relative">
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
      <div className="text-muted-foreground font-mono text-sm sm:text-base p-4 text-center z-10 bg-black/40 rounded-lg backdrop-blur-sm border border-white/10">
        &lt;!-- USER: PASTE YOUR VIDEO SERVER IFRAME HERE --&gt;
        <br />
        <span className="text-xs text-zinc-400 mt-2 block">TMDB ID: {tmdbId} | TYPE: {type}</span>
      </div>
    </div>
  );
}
