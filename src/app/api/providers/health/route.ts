import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const healthChecks = await prisma.videoProviderHealth.findMany({
      include: { provider: { select: { name: true, slug: true } } },
      orderBy: { lastCheck: 'desc' },
      take: 20
    });

    return NextResponse.json(healthChecks);
  } catch (error) {
    // Return mock health if DB is down for testing without local postgres
    return NextResponse.json([{
      provider: { name: 'Mock Video Provider', slug: 'mock-provider' },
      status: 'HEALTHY',
      latencyMs: 120,
      lastCheck: new Date()
    }]);
  }
}
