import { Metadata } from 'next';
import { SearchService, SearchQuery } from '@/services/search/engine';
import { MediaCard } from '@/components/media/MediaCard';
import { MediaGrid } from '@/components/media/MediaGrid';
import { MediaType } from '@prisma/client';

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

  if (!query) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold">Search</h1>
        <p className="text-muted-foreground mt-4">Start typing to search for movies, series, or anime.</p>
      </div>
    );
  }

  const results = await SearchService.search(searchOptions);

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Search results for &quot;{query}&quot;
        </h1>
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
    </div>
  );
}
