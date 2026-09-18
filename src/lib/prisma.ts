import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'stdout', level: 'error' },
    { emit: 'stdout', level: 'warn' },
  ],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  // Log slow queries in development to identify bottlenecks
  (prisma as any).$on('query', (e: any) => {
    if (e.duration > 100) { // Log queries taking longer than 100ms
      console.warn(`[SLOW QUERY] ${e.duration}ms : ${e.query}`);
    }
  });
}
