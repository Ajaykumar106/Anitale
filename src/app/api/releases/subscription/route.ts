import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { toggleSubscription } from '@/services/releases/engine';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { mediaId } = await request.json();
    if (!mediaId) return NextResponse.json({ error: 'Media ID is required' }, { status: 400 });

    const isSubscribed = await toggleSubscription(session.user.id, mediaId);
    return NextResponse.json({ subscribed: isSubscribed });
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to toggle subscription' }, { status: 500 });
  }
}
