import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const providers = await prisma.videoProvider.findMany({
      select: {
        slug: true,
        name: true,
        isEnabled: true,
        priority: true,
        updatedAt: true
      },
      orderBy: { priority: 'desc' }
    });

    if (providers.length === 0) {
       // Mock for local testing
       return NextResponse.json([{ slug: 'mock-provider', name: 'Mock Video Provider', isEnabled: true, priority: 10 }]);
    }

    return NextResponse.json(providers);
  } catch (error) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });
  }
}
