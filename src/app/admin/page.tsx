import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/rbac';
import { logAction } from '@/services/admin/audit';

export default async function AdminDashboardPage() {
  await requireRole('MODERATOR');
  await logAction('VIEW_DASHBOARD', 'admin_panel');

  const [userCount, mediaCount, reviewCount, providerCount] = await Promise.all([
    prisma.user.count(),
    prisma.media.count(),
    prisma.review.count(),
    prisma.videoProvider.count()
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">System Overview</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border bg-card flex flex-col gap-1">
          <span className="text-muted-foreground text-sm font-medium">Total Users</span>
          <span className="text-2xl font-bold">{userCount}</span>
        </div>
        <div className="p-4 rounded-xl border bg-card flex flex-col gap-1">
          <span className="text-muted-foreground text-sm font-medium">Indexed Media</span>
          <span className="text-2xl font-bold">{mediaCount}</span>
        </div>
        <div className="p-4 rounded-xl border bg-card flex flex-col gap-1">
          <span className="text-muted-foreground text-sm font-medium">User Reviews</span>
          <span className="text-2xl font-bold">{reviewCount}</span>
        </div>
        <div className="p-4 rounded-xl border bg-card flex flex-col gap-1">
          <span className="text-muted-foreground text-sm font-medium">Active Providers</span>
          <span className="text-2xl font-bold">{providerCount}</span>
        </div>
      </div>
    </div>
  );
}
