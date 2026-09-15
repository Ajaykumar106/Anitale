import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { revalidateTag } from 'next/cache';

const schema = z.object({
  mediaId: z.string(),
  reason: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { mediaId, reason } = schema.parse(body);

    await prisma.mediaDismissal.upsert({
      where: {
        userId_mediaId: {
          userId: session.user.id,
          mediaId
        }
      },
      update: { reason },
      create: {
        userId: session.user.id,
        mediaId,
        reason
      }
    });

    // Invalidate the recommendation cache for this user
    revalidateTag(`home-recs-${session.user.id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to dismiss media' }, { status: 500 });
  }
}
