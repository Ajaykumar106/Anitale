import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function logAction(action: string, resource: string, details?: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return;
    
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action,
        resource,
        details,
        ipAddress: 'server', // Ideally extracted from request headers in a real context
      }
    });
  } catch (error) {
    console.error('Failed to write audit log', error);
  }
}
