import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { createReview } from '@/services/community/reviews';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { MediaType } from '@prisma/client';

const schema = z.object({
  mediaId: z.string(),
  type: z.nativeEnum(MediaType),
  rating: z.number().min(1).max(10),
  content: z.string().max(2000).optional(),
  hasSpoilers: z.boolean().default(false),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = schema.parse(body);

    // Resolve internal media ID first
    let media = await prisma.media.findUnique({
      where: { externalId_type: { externalId: parsed.mediaId, type: parsed.type } }
    });

    if (!media) {
      // Create placeholder media if doesn't exist yet in local DB (usually import service does this)
      media = await prisma.media.create({
        data: { externalId: parsed.mediaId, type: parsed.type, title: 'Imported for Review' }
      });
    }

    const review = await createReview(session.user.id, media.id, parsed.rating, parsed.content, parsed.hasSpoilers);
    return NextResponse.json(review);
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message?.includes('Rate limit')) {
      return NextResponse.json({ error: err.message }, { status: 429 });
    }
    return NextResponse.json({ error: err.message || 'Invalid input' }, { status: 400 });
  }
}
