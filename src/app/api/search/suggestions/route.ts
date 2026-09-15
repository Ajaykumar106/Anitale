import { NextResponse } from 'next/server';
import { SearchService } from '@/services/search/engine';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get('q') || '';
    
    if (!q || q.trim().length === 0) {
      return NextResponse.json({ results: [] });
    }

    const results = await SearchService.search({ q });
    
    // For suggestions, we only need a few items and minimal data
    const suggestions = results.slice(0, 5).map(r => ({
      id: r.media.externalId,
      title: r.media.title,
      type: r.media.type,
      year: r.media.releaseDate ? new Date(r.media.releaseDate).getFullYear() : null,
      poster: r.media.posterPath
    }));

    return NextResponse.json({ results: suggestions });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
