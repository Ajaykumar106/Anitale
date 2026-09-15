import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserNotifications, markAllAsRead } from '@/services/notifications/center';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(request.url);
  const unreadOnly = url.searchParams.get('unread') === 'true';

  try {
    const notifications = await getUserNotifications(session.user.id, unreadOnly);
    return NextResponse.json(notifications);
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PUT() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await markAllAsRead(session.user.id);
    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to mark notifications as read' }, { status: 500 });
  }
}
