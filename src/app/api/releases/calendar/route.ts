import { NextResponse } from 'next/server';
import { getCalendarReleases } from '@/services/releases/engine';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const start = url.searchParams.get('start');
  const end = url.searchParams.get('end');

  if (!start || !end) {
    return NextResponse.json({ error: 'Start and end dates are required' }, { status: 400 });
  }

  try {
    const releases = await getCalendarReleases(new Date(start), new Date(end));
    return NextResponse.json(releases);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch releases' }, { status: 500 });
  }
}
