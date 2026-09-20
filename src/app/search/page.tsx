import { Metadata } from 'next';
import { ClientSearch } from '@/components/search/ClientSearch';
import { TMDBAdapter } from '@/providers/tmdb/adapter';

export const metadata: Metadata = {
  title: 'Search - Anitale',
};

export default async function SearchPage() {
  const tmdb = new TMDBAdapter(process.env.TMDB_API_KEY!);
  // Fetch some popular media to display in the empty state
  const trendingData = await tmdb.getDiscover('MOVIE', { top_rated: true });
  const topTrending = trendingData.slice(0, 8).map(m => ({
    id: m.externalId,
    title: m.title,
    posterPath: m.posterPath,
    type: m.type
  }));

  return <ClientSearch trendingData={topTrending} />;
}
