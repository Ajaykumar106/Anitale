import { Role } from '@prisma/client';
import { Session } from 'next-auth';
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

const ROLE_HIERARCHY: Record<Role, number> = {
  USER: 1,
  MODERATOR: 2,
  EDITOR: 3,
  ADMIN: 4,
  SUPER_ADMIN: 5,
};

export function hasRole(session: Session | null, requiredRole: Role): boolean {
  if (!session?.user?.role) return false;
  const userLevel = ROLE_HIERARCHY[session.user.role as Role] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole];
  return userLevel >= requiredLevel;
}

export async function requireRole(requiredRole: Role) {
  const session = await auth();
  if (!session || !hasRole(session, requiredRole)) {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function withRoleProtection(req: Request, requiredRole: Role, handler: (req: Request, session: Session) => Promise<NextResponse>) {
  const session = await auth();
  if (!session || !hasRole(session, requiredRole)) {
    return NextResponse.json({ error: 'Forbidden: Insufficient Permissions' }, { status: 403 });
  }
  return handler(req, session);
}
