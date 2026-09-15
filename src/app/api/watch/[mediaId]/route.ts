import { NextResponse } from 'next/server';
import { resolvePlayback } from '@/services/video/resolver';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ mediaId: string }> }
) {
  try {
    const { mediaId } = await params;
    const playback = await resolvePlayback(mediaId);

    if (!playback) {
      return NextResponse.json({ error: 'No providers available for this media' }, { status: 404 });
    }

    return NextResponse.json(playback);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Provider timeout') {
      return NextResponse.json({ error: 'Providers timed out' }, { status: 504 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
