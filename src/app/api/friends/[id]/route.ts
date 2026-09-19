import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const friendship = await db.friendship.findUnique({ where: { id: params.id } });
  if (!friendship || friendship.friendId !== session.user.id) {
    return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
  }

  await db.friendship.update({
    where: { id: params.id },
    data: { status: 'ACCEPTED' }
  });

  return NextResponse.json({ success: true });
}
