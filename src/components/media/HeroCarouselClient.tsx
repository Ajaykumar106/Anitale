'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Info, Play } from 'lucide-react';
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current) return;
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const index = Math.round(scrollLeft / clientWidth);
      if (index !== currentIndex) {
        setCurrentIndex(index);
      }
    };
    
    const currentRef = scrollContainerRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', handleScroll, { passive: true });
    }
    return () => {
      if (currentRef) {
        currentRef.removeEventListener('scroll', handleScroll);
      }
    };
  }, [currentIndex]);

  if (!items.length) return null;

  const scrollTo = (index: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        left: index * scrollContainerRef.current.clientWidth,
        behavior: 'smooth'
      });
      setCurrentIndex(index);
    }
  };

  return (
    <div className="relative w-full h-[75vh] md:h-[85vh] overflow-hidden group">
      <div 
        ref={scrollContainerRef}
        className="flex h-full w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
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
              className="flex-none w-full h-full relative snap-center snap-always"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${backdropUrl})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent opacity-80" />
              
              <div className="absolute bottom-0 left-0 w-full px-4 md:px-12 lg:px-16 pb-12 sm:pb-16 lg:w-[65%] xl:w-[55%] flex flex-col justify-end space-y-5">
                <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-white drop-shadow-lg leading-tight">
                  {title}
                </h1>
                <p className="text-sm sm:text-base md:text-lg text-white/90 line-clamp-3 md:line-clamp-4 max-w-2xl drop-shadow font-medium leading-relaxed">
                  {overview}
                </p>
                <div className="flex items-center gap-4 pt-4">
                  <Link href={route}>
                    <Button size="lg" className="font-semibold px-8 sm:px-10 bg-white text-black hover:bg-white/80 rounded-md">
                      <Play className="w-5 h-5 mr-2 fill-current" />
                      Play
                    </Button>
                  </Link>
                  <Link href={route}>
                    <Button size="lg" variant="secondary" className="font-semibold px-8 sm:px-10 bg-zinc-500/40 hover:bg-zinc-500/60 text-white backdrop-blur-md border-0 rounded-md">
                      <Info className="w-5 h-5 mr-2" />
                      More Info
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="absolute bottom-6 right-8 md:right-12 z-20 flex space-x-2.5">
        {items.map((_, idx) => (
          <button 
            key={idx}
            onClick={() => scrollTo(idx)}
            className={`h-1 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'}`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
