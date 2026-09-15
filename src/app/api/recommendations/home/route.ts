import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import {
  getTrendingForYou,
  getYouMightLike,
  getHiddenGems,
  getContinueWatching
} from '@/services/recommendations/categories';
import { getFallbackRecommendations } from '@/services/recommendations/engine';

export async function GET(req: Request) {
  try {
    const session = await auth();
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);

    if (session?.user?.id) {
      const [trending, mightLike, gems, continueWatching] = await Promise.all([
        getTrendingForYou(session.user.id, limit),
        getYouMightLike(session.user.id, limit),
        getHiddenGems(session.user.id, limit),
        getContinueWatching(session.user.id)
      ]);

      return NextResponse.json({
        trending,
        mightLike,
        gems,
        continueWatching
      });
    } else {
      const fallback = await getFallbackRecommendations(limit);
      return NextResponse.json({
        trending: fallback,
        mightLike: [],
        gems: [],
        continueWatching: []
      });
    }
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
