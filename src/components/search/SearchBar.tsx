'use client';

import { Input } from '@/components/ui/input';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition, useEffect, useState, useRef } from 'react';
import Link from 'next/link';

interface Suggestion {
  id: string;
  title: string;
  type: string;
  year: number | null;
  poster?: string;
}

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>(null);
  
  useEffect(() => {
    // Load recent searches
    const stored = localStorage.getItem('recentSearches');
    if (stored) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setRecentSearches(JSON.parse(stored).slice(0, 5));
      } catch (e) {}
    }
  }, []);

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleSearch = (term: string) => {
    setQuery(term);
    
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    debounceRef.current = setTimeout(async () => {
      if (term.trim().length > 1) {
        try {
          const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(term)}`);
          const data = await res.json();
          setSuggestions(data.results || []);
        } catch (e) {
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
      }
    }, 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveRecentSearch(query.trim());
      setIsFocused(false);
      startTransition(() => {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      });
    }
  };

  return (
    <div className="relative w-full max-w-xl group">
      <form onSubmit={handleSubmit} className="relative">
        <Input
          type="search"
          placeholder="Search for movies, series, or anime..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          className={`w-full bg-muted shadow-none md:text-base ${isPending ? 'opacity-70' : ''}`}
        />
        {isPending && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        )}
      </form>

      {isFocused && (
        <div className="absolute top-full mt-2 w-full bg-background border rounded-md shadow-lg z-50 overflow-hidden">
          {query.length > 1 && suggestions.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-1 text-xs font-semibold text-muted-foreground uppercase">Suggestions</div>
              {suggestions.map((s) => (
                <Link
                  key={s.id}
                  href={`/search?q=${encodeURIComponent(s.title)}`}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-muted text-sm border-b border-white/5 last:border-0"
                  onClick={() => saveRecentSearch(s.title)}
                >
                  {s.poster ? (
                    <img src={`https://image.tmdb.org/t/p/w92${s.poster}`} alt={s.title} className="w-10 h-14 object-cover rounded shadow-md" />
                  ) : (
                    <div className="w-10 h-14 bg-zinc-800 rounded flex items-center justify-center text-[10px] text-muted-foreground text-center">No Img</div>
                  )}
                  <div className="flex flex-col">
                    <span className="font-semibold text-white/90">{s.title}</span>
                    <span className="text-muted-foreground text-xs uppercase">{s.type === 'MOVIE' ? 'Movie' : s.type === 'SERIES' ? 'Series' : 'Anime'} {s.year && `• ${s.year}`}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          {query.length === 0 && recentSearches.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-1 text-xs font-semibold text-muted-foreground uppercase">Recent Searches</div>
              {recentSearches.map((s) => (
                <Link
                  key={s}
                  href={`/search?q=${encodeURIComponent(s)}`}
                  className="block px-4 py-2 hover:bg-muted text-sm flex justify-between items-center"
                  onClick={() => saveRecentSearch(s)}
                >
                  <span>{s}</span>
                </Link>
              ))}
            </div>
          )}

          {query.length > 1 && suggestions.length === 0 && !isPending && (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              Press Enter to search for &quot;{query}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
