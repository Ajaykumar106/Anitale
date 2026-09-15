import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function enqueueJob(type: string, payload?: any, options?: { runAt?: Date, maxAttempts?: number }) {
  return await prisma.backgroundJob.create({
    data: {
      type,
      payload: payload || {},
      runAt: options?.runAt || new Date(),
      maxAttempts: options?.maxAttempts || 3,
    }
  });
}

export async function dequeueJob() {
  const workerId = crypto.randomUUID();
  
  // Find a pending job and lock it (simple approach, not full row-level lock)
  // In a real production PG system, you'd use raw SQL with FOR UPDATE SKIP LOCKED
  const jobs = await prisma.$queryRaw<any[]>`
    UPDATE "BackgroundJob"
    SET status = 'RUNNING', "lockedAt" = NOW(), "lockedBy" = ${workerId}, attempts = attempts + 1
    WHERE id = (
      SELECT id FROM "BackgroundJob"
      WHERE status = 'PENDING' AND "runAt" <= NOW()
      ORDER BY "runAt" ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    )
    RETURNING *;
  `;

  if (!jobs || jobs.length === 0) return null;
  return jobs[0];
}

export async function completeJob(id: string) {
  return await prisma.backgroundJob.update({
    where: { id },
    data: {
      status: 'COMPLETED',
      lockedAt: null,
      lockedBy: null
    }
  });
}

export async function failJob(id: string, error: string) {
  const job = await prisma.backgroundJob.findUnique({ where: { id } });
  if (!job) return;

  const isFinalFailure = job.attempts >= job.maxAttempts;
  
  return await prisma.backgroundJob.update({
    where: { id },
    data: {
      status: isFinalFailure ? 'FAILED' : 'PENDING',
      lastError: error,
      lockedAt: null,
      lockedBy: null,
      // Exponential backoff for retries: wait attempts * 5 minutes
      runAt: isFinalFailure ? job.runAt : new Date(Date.now() + job.attempts * 5 * 60 * 1000)
    }
  });
}
