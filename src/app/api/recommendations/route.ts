import { NextResponse } from 'next/server';
import { getFallbackRecommendations } from '@/services/recommendations/engine';

export const revalidate = 3600; // Cache for 1 hour globally

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    
    const recs = await getFallbackRecommendations(limit);
    return NextResponse.json({ recommendations: recs });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
