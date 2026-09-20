import { Metadata } from 'next';
import { SearchService, SearchQuery } from '@/services/search/engine';
import { MediaCard } from '@/components/media/MediaCard';
import { MediaGrid } from '@/components/media/MediaGrid';
import { MediaType } from '@prisma/client';
import { Search } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Search - Anitale',
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; genre?: string; year?: string; type?: string }>;
}) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || '';
  
  const searchOptions: SearchQuery = {
    q: query,
    genre: resolvedParams.genre,
    year: resolvedParams.year,
    type: resolvedParams.type ? (resolvedParams.type.toUpperCase() as MediaType) : undefined,
  };

  let results: any[] = [];
  if (query) {
    results = await SearchService.search(searchOptions);
  }

  return (
    <div className="container py-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Search</h1>
        <form action="/search" method="GET" className="relative flex items-center max-w-lg w-full">
          <Search className="absolute left-3 h-5 w-5 text-muted-foreground" />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search for movies, TV series, or anime..."
            className="w-full rounded-full border border-border bg-background pl-10 pr-4 py-2.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {resolvedParams.genre && <input type="hidden" name="genre" value={resolvedParams.genre} />}
          {resolvedParams.year && <input type="hidden" name="year" value={resolvedParams.year} />}
          {resolvedParams.type && <input type="hidden" name="type" value={resolvedParams.type} />}
        </form>
      </div>

      {!query ? (
        <div className="py-12 text-center rounded-lg border border-dashed">
          <p className="text-muted-foreground">Start typing to search for movies, series, or anime.</p>
        </div>
      ) : (
        <>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Search results for &quot;{query}&quot;
            </h2>
            <p className="text-sm text-muted-foreground">{results.length} results</p>
          </div>

          {results.length > 0 ? (
            <MediaGrid>
              {results.map((result) => (
                <MediaCard
                  key={`${result.media.type}-${result.media.externalId}`}
                  id={result.media.externalId}
                  title={result.media.title}
                  type={result.media.type}
                  posterPath={result.media.posterPath}
                  year={result.media.releaseDate?.getFullYear()}
                />
              ))}
            </MediaGrid>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed space-y-4">
              <p className="text-muted-foreground text-lg">No results found for &quot;{query}&quot;.</p>
              <p className="text-sm text-muted-foreground">Check for typos or try broader keywords.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
