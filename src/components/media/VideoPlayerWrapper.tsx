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
      <iframe 
        src={`https://vidsrc.xyz/embed/${type === 'SERIES' || type === 'ANIME' ? 'tv' : 'movie'}/${tmdbId}`} 
        className="w-full h-full border-0 z-10 absolute inset-0" 
        allowFullScreen 
        title="Video Player"
      />
    </div>
  );
}
