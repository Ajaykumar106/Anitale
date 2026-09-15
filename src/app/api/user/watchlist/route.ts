import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { toggleWatchlist } from '@/services/user/watchlist';
import { z } from 'zod';
import { MediaType } from '@prisma/client';

const schema = z.object({
  externalId: z.string(),
  type: z.nativeEnum(MediaType),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { externalId, type } = schema.parse(body);

    const inWatchlist = await toggleWatchlist(session.user.id, externalId, type);
    return NextResponse.json({ inWatchlist });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Invalid request or DB error' }, { status: 400 });
  }
}
