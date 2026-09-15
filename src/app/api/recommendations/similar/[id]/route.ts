import { NextResponse } from 'next/server';
import { getSimilarMedia } from '@/services/recommendations/engine';

export const revalidate = 3600; // Cache similar routes for an hour

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);

    const recs = await getSimilarMedia(id, limit);
    
    return NextResponse.json({ recommendations: recs });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
