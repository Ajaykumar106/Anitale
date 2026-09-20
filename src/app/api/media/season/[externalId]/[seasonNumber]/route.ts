import { NextResponse } from 'next/server';
import { TMDBAdapter } from '@/providers/tmdb/adapter';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ externalId: string; seasonNumber: string }> }
) {
  const { externalId, seasonNumber } = await params;
  
  if (!externalId || !seasonNumber) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  try {
    const tmdb = new TMDBAdapter(process.env.TMDB_API_KEY || 'dummy_key');
    
    // Check if the method exists (we just added it, so it should)
    if (typeof tmdb.getSeasonDetails !== 'function') {
      return NextResponse.json({ error: 'Provider does not support fetching season details' }, { status: 501 });
    }
    
    const episodes = await tmdb.getSeasonDetails(externalId, parseInt(seasonNumber, 10));
    
    return NextResponse.json({ episodes });
  } catch (error) {
    console.error('Failed to fetch season details API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
