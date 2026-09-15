import { NextResponse } from 'next/server';
import { trackEvent } from '@/services/analytics';

export async function POST(req: Request) {
  try {
    const { eventName, payload } = await req.json();
    
    if (!eventName || typeof eventName !== 'string') {
      return NextResponse.json({ error: 'Invalid event name' }, { status: 400 });
    }

    // Call the server-side tracking function
    // We intentionally don't await this to keep the API response fast (fire-and-forget)
    // Wait, Vercel/NextJS might kill the execution context if we don't await.
    // It's safer to await it in serverless environments.
    await trackEvent(eventName, payload);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
