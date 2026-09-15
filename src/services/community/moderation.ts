import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rate-limit';
import { ReportTargetType, ReportStatus } from '@prisma/client';

export async function createReport(reporterId: string, targetType: ReportTargetType, targetId: string, reason: string) {
  if (!checkRateLimit(`report:${reporterId}`, 5, 86400 * 1000)) {
    throw new Error('You have submitted too many reports recently. Try again later.');
  }

  return prisma.report.create({
    data: {
      reporterId,
      targetType,
      targetId,
      reason,
    },
  });
}

export async function toggleBlock(blockerId: string, blockedId: string) {
  if (blockerId === blockedId) throw new Error('Cannot block yourself');

  const existing = await prisma.block.findUnique({
    where: { blockerId_blockedId: { blockerId, blockedId } }
  });

  if (existing) {
    await prisma.block.delete({ where: { id: existing.id } });
    return false; // unblocked
  } else {
    await prisma.block.create({ data: { blockerId, blockedId } });
    
    // Automatically unfollow each other
    await prisma.follow.deleteMany({
      where: {
        OR: [
          { followerId: blockerId, followingId: blockedId },
          { followerId: blockedId, followingId: blockerId }
        ]
      }
    });
    
    return true; // blocked
  }
}

// Admin only functions
export async function getReportQueue(adminId: string) {
  const admin = await prisma.user.findUnique({ where: { id: adminId } });
  if (admin?.role !== 'ADMIN') throw new Error('Unauthorized');

  return prisma.report.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
    include: {
      reporter: { select: { name: true, email: true } },
      review: { select: { content: true } },
      comment: { select: { content: true } }
    }
  });
}

export async function resolveReport(adminId: string, reportId: string, status: ReportStatus, actionDetails?: string) {
  const admin = await prisma.user.findUnique({ where: { id: adminId } });
  if (admin?.role !== 'ADMIN') throw new Error('Unauthorized');

  // In a full implementation, actionDetails might store what was done (e.g. "Deleted review")
  
  return prisma.report.update({
    where: { id: reportId },
    data: { status },
  });
}
