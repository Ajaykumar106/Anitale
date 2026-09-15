import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { markAsRead } from '@/services/notifications/center';

export async function PUT(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  try {
    await markAsRead(id, session.user.id);
    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to mark notification as read' }, { status: 500 });
  }
}
