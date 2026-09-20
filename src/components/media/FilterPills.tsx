'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Flame, Star, Zap, Heart, Laugh, Compass, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FilterPills() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const currentGenre = searchParams.get('genre');
  const isTopRated = searchParams.get('top_rated') === 'true';
  const currentYear = searchParams.get('year');
  
  const isAll = !currentGenre && !isTopRated && !currentYear;

  const filters = [
    { label: 'All', icon: Compass, active: isAll, href: pathname },
    { label: 'Trending', icon: Flame, active: false, href: pathname }, // Default view often includes trending
    { label: 'Top Rated', icon: Star, active: isTopRated, href: `${pathname}?top_rated=true` },
    { label: 'Action', icon: Zap, active: currentGenre === '28', href: `${pathname}?genre=28` },
    { label: 'Comedy', icon: Laugh, active: currentGenre === '35', href: `${pathname}?genre=35` },
    { label: 'Romance', icon: Heart, active: currentGenre === '10749', href: `${pathname}?genre=10749` },
    { label: '2024', icon: Calendar, active: currentYear === '2024', href: `${pathname}?year=2024` },
  ];

  return (
    <div className="flex w-full items-center gap-2 overflow-x-auto pb-2 scrollbar-hide px-4 md:px-6">
      {filters.map((filter) => {
        const Icon = filter.icon;
        return (
          <Link
            key={filter.label}
            href={filter.href}
            className={cn(
              "flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors border",
              filter.active 
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary/50 text-foreground border-transparent hover:bg-secondary/80 hover:border-border"
            )}
          >
            <Icon className="h-4 w-4" />
            {filter.label}
          </Link>
        );
      })}
    </div>
  );
}
