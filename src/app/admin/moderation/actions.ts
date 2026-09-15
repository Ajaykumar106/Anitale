'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { requireRole } from '@/lib/rbac';
import { revalidatePath } from 'next/cache';

export async function dismissReport(reportId: string) {
  const session = await auth();
  requireRole(session, 'MODERATOR');

  await prisma.report.update({
    where: { id: reportId },
    data: { status: 'DISMISSED' }
  });

  revalidatePath('/admin/moderation');
}

export async function resolveAndHideContent(reportId: string, targetType: string, targetId: string) {
  const session = await auth();
  requireRole(session, 'MODERATOR');

  if (targetType === 'REVIEW') {
    await prisma.review.delete({ where: { id: targetId } });
  } else if (targetType === 'COMMENT') {
    await prisma.comment.delete({ where: { id: targetId } });
  }

  await prisma.report.update({
    where: { id: reportId },
    data: { status: 'RESOLVED' }
  });

  revalidatePath('/admin/moderation');
}

export async function banUser(reportId: string, targetUserId: string) {
  const session = await auth();
  requireRole(session, 'ADMIN');

  // Basic ban implementation: we would need a banned flag on the user
  // Or delete the user.
  // For now, we will just delete the user's sessions to log them out and maybe change their email/flag them.
  // We don't have an explicit isBanned flag on User model yet. We can delete their account for now or just log an audit.
  
  await prisma.session.deleteMany({ where: { userId: targetUserId } });
  
  // Mark report as resolved
  await prisma.report.update({
    where: { id: reportId },
    data: { status: 'RESOLVED' }
  });

  revalidatePath('/admin/moderation');
}
