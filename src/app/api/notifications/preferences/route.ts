import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserPreferences, updatePreferences } from '@/services/notifications/preferences';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const prefs = await getUserPreferences(session.user.id);
    return NextResponse.json(prefs);
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await request.json();
    const prefs = await updatePreferences(session.user.id, data);
    return NextResponse.json(prefs);
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
  }
}
