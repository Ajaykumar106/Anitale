'use client';

import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { Flame, Star, Zap, Heart, Laugh, Compass, Calendar, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTransition, useState } from 'react';

export function FilterPills() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [isPending, startTransition] = useTransition();
  const [loadingPill, setLoadingPill] = useState<string | null>(null);

  const currentGenre = searchParams.get('genre');
  const isTopRated = searchParams.get('top_rated') === 'true';
  const currentYear = searchParams.get('year');
  const currentProvider = searchParams.get('provider');
  
  const isAll = !currentGenre && !isTopRated && !currentYear && !currentProvider;

  const filters = [
    { label: 'All', icon: Compass, active: isAll, href: pathname },
    { label: 'Trending', icon: Flame, active: false, href: pathname },
    { label: 'Top Rated', icon: Star, active: isTopRated, href: `${pathname}?top_rated=true` },
    { label: 'Action', icon: Zap, active: currentGenre === '28', href: `${pathname}?genre=28` },
    { label: 'Comedy', icon: Laugh, active: currentGenre === '35', href: `${pathname}?genre=35` },
    { label: 'Romance', icon: Heart, active: currentGenre === '10749', href: `${pathname}?genre=10749` },
    { label: '2024', icon: Calendar, active: currentYear === '2024', href: `${pathname}?year=2024` },
    { label: 'Netflix', icon: Star, active: currentProvider === '8', href: `${pathname}?provider=8` },
    { label: 'Prime', icon: Star, active: currentProvider === '9', href: `${pathname}?provider=9` },
    { label: 'Crunchyroll', icon: Star, active: currentProvider === '283', href: `${pathname}?provider=283` },
  ];

  const handleNavigation = (label: string, href: string) => {
    setLoadingPill(label);
    startTransition(() => {
      router.push(href, { scroll: false });
    });
  };

  // Reset loading pill if transition finished
  if (!isPending && loadingPill) {
    setLoadingPill(null);
  }

  return (
    <div className="flex w-full items-center gap-3 overflow-x-auto pb-4 pt-2 scrollbar-hide px-4 md:px-6">
      {filters.map((filter) => {
        const Icon = filter.icon;
        const isLoading = isPending && loadingPill === filter.label;
        
        return (
          <button
            key={filter.label}
            onClick={() => handleNavigation(filter.label, filter.href)}
            disabled={isPending}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap rounded-2xl px-5 py-2.5 text-sm font-semibold transition-all duration-300 border backdrop-blur-md shadow-lg",
              filter.active 
                ? "bg-white/90 text-black border-white/40 shadow-white/20 scale-105"
                : "bg-white/5 text-white/80 border-white/10 hover:bg-white/15 hover:text-white hover:border-white/20"
            )}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <Icon className="h-4 w-4 opacity-70" />
            )}
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
