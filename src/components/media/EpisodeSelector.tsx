"use client";

import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Settings, X, Loader2 } from 'lucide-react';
import { ProviderEpisodeDetails } from '@/providers/types';
import { cn } from '@/lib/utils';
import { VideoPlayerWrapper } from './VideoPlayerWrapper';

interface Season {
  seasonNumber: number;
  name: string;
  episodeCount: number;
  posterPath: string | null;
}

interface EpisodeSelectorProps {
  tmdbId: string;
  type: 'MOVIE' | 'SERIES' | 'ANIME';
  seasons: Season[];
}

export function EpisodeSelector({ tmdbId, type, seasons }: EpisodeSelectorProps) {
  const [selectedSeason, setSelectedSeason] = useState<number>(seasons.length > 0 ? seasons[0].seasonNumber : 1);
  const [episodes, setEpisodes] = useState<ProviderEpisodeDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<ProviderEpisodeDetails | null>(null);

  useEffect(() => {
    async function fetchEpisodes() {
      setLoading(true);
      try {
        const res = await fetch(`/api/media/season/${tmdbId}/${selectedSeason}`);
        const data = await res.json();
        if (data.episodes) {
          setEpisodes(data.episodes);
          // Auto-select first episode if not selected or changing seasons
          if (data.episodes.length > 0) {
            setSelectedEpisode(data.episodes[0]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch episodes:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchEpisodes();
  }, [tmdbId, selectedSeason]);

  return (
    <div className="flex flex-col gap-6">
      {/* Dynamic Video Player that updates based on selection */}
      <VideoPlayerWrapper 
        tmdbId={tmdbId} 
        type={type} 
        season={selectedSeason} 
        episode={selectedEpisode?.episodeNumber} 
      />

      {/* Season Selector Dropdown */}
      <div className="flex items-center justify-between mt-4">
        <Select 
          value={selectedSeason.toString()} 
          onValueChange={(val: string | null) => { if (val) setSelectedSeason(parseInt(val, 10)); }}
        >
          <SelectTrigger className="w-[200px] bg-zinc-900 border-zinc-800 text-white font-medium">
            <SelectValue placeholder="Select Season" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
            {seasons.map((season) => (
              <SelectItem key={season.seasonNumber} value={season.seasonNumber.toString()}>
                Season {season.seasonNumber} ({season.episodeCount} EP)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Episodes List */}
      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : episodes.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 animate-in slide-in-from-bottom-4 fade-in duration-700 ease-out">
            {episodes.map((episode) => {
              const isSelected = selectedEpisode?.episodeNumber === episode.episodeNumber;
              return (
                <div 
                  key={episode.id}
                  onClick={() => setSelectedEpisode(episode)}
                  className={cn(
                    "flex gap-4 p-3 rounded-xl border border-white/5 bg-zinc-900/40 hover:bg-zinc-800/80 transition-all duration-300 ease-out cursor-pointer group hover:scale-[1.01] hover:shadow-lg",
                    isSelected ? "ring-2 ring-primary bg-zinc-800/80 shadow-[0_0_15px_rgba(var(--primary),0.2)]" : ""
                  )}
                >
                  <div className="relative w-32 md:w-48 aspect-video rounded-md overflow-hidden bg-zinc-800 shrink-0 border border-white/10">
                    {episode.stillPath ? (
                      <img 
                        src={`https://image.tmdb.org/t/p/w300${episode.stillPath}`} 
                        alt={episode.name}
                        className={cn("w-full h-full object-cover transition-transform group-hover:scale-105", isSelected ? "opacity-75" : "")}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                        No Image
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-8 h-8 text-white fill-white" />
                    </div>
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <div className="flex flex-col items-center">
                          <Play className="w-8 h-8 text-primary fill-primary mb-1" />
                          <span className="text-xs font-bold text-white bg-black/80 px-2 py-0.5 rounded">PLAYING</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col justify-center py-1 flex-1 min-w-0">
                    <h4 className={cn("text-base md:text-lg font-bold leading-tight line-clamp-1 mb-1", isSelected ? "text-primary" : "text-white")}>
                      {episode.name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm font-medium mb-1">
                      <span className="text-muted-foreground bg-zinc-800 px-2 py-0.5 rounded">E{episode.episodeNumber}</span>
                      <span className="text-muted-foreground text-[10px] md:text-xs tracking-wider">●</span>
                      <span className="text-muted-foreground">S{episode.seasonNumber}</span>
                      {episode.runtime && (
                        <>
                          <span className="text-muted-foreground text-[10px] md:text-xs tracking-wider">●</span>
                          <span className="text-muted-foreground">{episode.runtime}m</span>
                        </>
                      )}
                    </div>
                    {episode.overview && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1 hidden sm:block">
                        {episode.overview}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            No episodes found for this season.
          </div>
        )}
      </div>
    </div>
  );
}
