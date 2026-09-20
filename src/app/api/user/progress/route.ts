import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { mediaId, seasonNumber, episodeNumber } = body;

    if (!mediaId) {
      return NextResponse.json({ error: 'Missing mediaId' }, { status: 400 });
    }

    // Handle unique constraint with nullable fields manually
    const existing = await prisma.watchProgress.findFirst({
      where: {
        userId: session.user.id,
        mediaId,
        seasonNumber: seasonNumber || null,
        episodeNumber: episodeNumber || null,
      }
    });

    let progress;
    if (existing) {
      progress = await prisma.watchProgress.update({
        where: { id: existing.id },
        data: { updatedAt: new Date() }
      });
    } else {
      progress = await prisma.watchProgress.create({
        data: {
          userId: session.user.id,
          mediaId,
          seasonNumber: seasonNumber || null,
          episodeNumber: episodeNumber || null,
          progressSeconds: 0,
        }
      });
    }

    return NextResponse.json({ success: true, progress });
  } catch (error) {
    console.error('WatchProgress Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
