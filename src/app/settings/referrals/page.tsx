import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { ReferralDashboard } from './ReferralDashboard';
import crypto from 'crypto';

export default async function ReferralsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  let user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { inviteCode: true }
  });

  if (!user) redirect('/login');

  // Auto-generate invite code if not exists
  if (!user.inviteCode) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    user = await prisma.user.update({
      where: { id: session.user.id },
      data: { inviteCode: code },
      select: { inviteCode: true }
    });
  }

  // Find users who were referred by this user
  const referredUsers = await prisma.user.findMany({
    where: { referredBy: session.user.id },
    select: { name: true, createdAt: true, image: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="container py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Invite Friends</h1>
      <p className="text-muted-foreground mb-8">
        Share Anitale with your friends and build the ultimate anime community.
      </p>

      <ReferralDashboard 
        inviteCode={user.inviteCode!} 
        referredUsers={referredUsers} 
      />
    </div>
  );
}
