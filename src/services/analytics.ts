import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function trackEvent(eventName: string, payload?: any) {
  try {
    const session = await auth();
    
    await prisma.analyticsEvent.create({
      data: {
        eventName,
        userId: session?.user?.id || null,
        payload: payload || {},
      }
    });
  } catch (error) {
    // Fail silently - analytics shouldn't crash the app
    console.error('Analytics tracking failed', error);
  }
}

export async function getEventCounts(startDate: Date, endDate: Date) {
  const events = await prisma.analyticsEvent.groupBy({
    by: ['eventName'],
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      }
    },
    _count: {
      id: true
    }
  });
  
  return events;
}

export async function getDailyActiveUsers(startDate: Date, endDate: Date) {
  // Rough estimate by counting distinct userIds with events
  // Note: Prisma groupBy doesn't natively support counting distinct userIds in groupBy easily
  // A raw SQL query is better for real DAU but for abstraction this works:
  const result = await prisma.$queryRaw`
    SELECT DATE("createdAt") as date, COUNT(DISTINCT "userId") as dau
    FROM "AnalyticsEvent"
    WHERE "createdAt" >= ${startDate} AND "createdAt" <= ${endDate} AND "userId" IS NOT NULL
    GROUP BY DATE("createdAt")
    ORDER BY date ASC
  `;
  
  return result;
}
