'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { MediaCard } from '@/components/media/MediaCard';

export function ClientSearch({ trendingData }: { trendingData: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>(null);

  const performSearch = async (term: string) => {
    if (!term.trim() || term.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(term)}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (e) {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, []);

  const handleSearchChange = (val: string) => {
    setQuery(val);
    
    // Update URL without refresh
    startTransition(() => {
      if (val) {
        window.history.replaceState(null, '', `/search?q=${encodeURIComponent(val)}`);
      } else {
        window.history.replaceState(null, '', `/search`);
      }
    });

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      performSearch(val);
    }, 300);
  };

  const topResults = results.slice(0, 3);
  const moreResults = results.slice(3);

  return (
    <div className="w-full min-h-screen bg-background text-foreground pb-20">
      <div className="sticky top-0 z-10 bg-background pt-4 pb-2 px-4 border-b border-white/5">
        <div className="relative flex items-center w-full bg-zinc-900 rounded-xl overflow-hidden px-3 py-2 border border-white/10 focus-within:border-white/30 transition-colors">
          <Search className="h-5 w-5 text-muted-foreground mr-2 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search for movies, series, or anime..."
            className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-muted-foreground"
          />
          {query && (
            <button onClick={() => handleSearchChange('')} className="p-1 rounded-full hover:bg-white/10 ml-2">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      <div className="px-4 py-6">
        {!query ? (
          <div className="space-y-6">
            <h2 className="text-lg font-bold">Popular Searches in</h2>
            
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {['India', 'Movies', 'Shows', 'Action'].map(pill => (
                <button key={pill} className="px-4 py-1.5 rounded-full bg-zinc-800 text-sm font-medium whitespace-nowrap text-white/90 hover:bg-zinc-700 transition-colors border border-white/5 flex items-center gap-1.5">
                  {pill === 'India' && <TrendingUp className="h-3.5 w-3.5" />}
                  {pill}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {trendingData.map((item) => (
                <div key={item.id} className="w-full aspect-[2/3] rounded-lg overflow-hidden relative shadow-lg">
                  <Link href={`/media/${item.type.toLowerCase()}/${item.id}`}>
                    <img 
                      src={`https://image.tmdb.org/t/p/w500${item.posterPath}`} 
                      alt={item.title} 
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </Link>
                </div>
              ))}
            </div>
            
            <div className="mt-12 text-center flex flex-col items-center justify-center p-6 bg-zinc-900/50 rounded-xl border border-white/5">
              <h3 className="text-xl font-bold mb-2">Anitale</h3>
              <p className="text-sm text-muted-foreground text-center">
                Your ultimate legal mediator for finding where to watch movies, series, and anime.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  <button className="px-3 py-1.5 bg-zinc-800 rounded-md text-sm text-white/80 whitespace-nowrap flex items-center gap-1.5">
                    <Search className="h-3 w-3" /> {query} full
                  </button>
                  <button className="px-3 py-1.5 bg-zinc-800 rounded-md text-sm text-white/80 whitespace-nowrap flex items-center gap-1.5">
                    <Search className="h-3 w-3" /> {query} hindi dubbed
                  </button>
                </div>

                <div>
                  <h2 className="text-xl font-bold mb-4 text-white">Top Results</h2>
                  <div className="grid grid-cols-3 gap-3">
                    {topResults.map((result) => (
                      <MediaCard
                        key={result.id}
                        id={result.id}
                        title={result.title}
                        type={result.type}
                        posterPath={result.poster}
                        year={result.year}
                      />
                    ))}
                  </div>
                </div>

                {moreResults.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold mb-4 text-white">More Results</h2>
                    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                      {moreResults.map((result) => (
                        <div key={result.id} className="w-[120px] shrink-0">
                          <MediaCard
                            id={result.id}
                            title={result.title}
                            type={result.type}
                            posterPath={result.poster}
                            year={result.year}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <p className="text-muted-foreground">No results found for "{query}"</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
