'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import { MediaType } from '@prisma/client';
export type CarouselItem = {
  externalId: string;
  type: MediaType;
  title: string;
  originalTitle?: string | null;
  overview?: string | null;
  backdropPath?: string | null;
  posterPath?: string | null;
};

export function HeroCarouselClient({ items }: { items: CarouselItem[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [items.length]);

  if (!items.length) return null;

  return (
    <div className="relative w-full h-[60vh] sm:h-[70vh] lg:h-[80vh] overflow-hidden rounded-xl">
      {items.map((details, index) => {
        const title = details.title || details.originalTitle || 'Unknown';
        const overview = details.overview || 'No overview available.';
        const backdropUrl = details.backdropPath 
          ? `https://image.tmdb.org/t/p/original${details.backdropPath}`
          : details.posterPath 
            ? `https://image.tmdb.org/t/p/w1280${details.posterPath}`
            : '/placeholder-backdrop.jpg';

        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const routePrefix = details.type === MediaType.MOVIE ? 'movie' : details.type === MediaType.SERIES ? 'show' : 'anime';
        const route = `/${routePrefix}/${slug}-${details.externalId}`;

        return (
          <div 
            key={details.externalId}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${backdropUrl})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
            
            <div className="absolute bottom-0 left-0 w-full p-6 sm:p-10 md:p-16 lg:w-2/3 xl:w-1/2 flex flex-col justify-end space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white drop-shadow-md">
                {title}
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-white/90 line-clamp-3 max-w-xl drop-shadow">
                {overview}
              </p>
              <div className="flex items-center gap-3 pt-2">
                <Link href={route}>
                  <Button size="lg" variant="secondary" className="font-semibold px-6 sm:px-8 bg-zinc-600/60 hover:bg-zinc-600/80 text-white backdrop-blur-sm border-0">
                    <Info className="w-5 h-5 mr-2" />
                    More Info
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        );
      })}
      
      <div className="absolute bottom-4 right-4 z-20 flex space-x-2">
        {items.map((_, idx) => (
          <button 
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-3 h-3 rounded-full transition-colors ${idx === currentIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/70'}`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
