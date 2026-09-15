import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/rbac';
import { logAction } from '@/services/admin/audit';

export default async function AdminHealthPage() {
  await requireRole('ADMIN');
  await logAction('VIEW_HEALTH', 'admin_health');

  let dbStatus = 'Disconnected';
  let dbLatency = 0;

  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatency = Date.now() - start;
    dbStatus = 'Connected';
  } catch (e) {
    dbStatus = 'Failed';
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">System Health</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border bg-card space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Database</h3>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${dbStatus === 'Connected' ? 'bg-green-500' : 'bg-destructive'}`} />
            <span className="font-medium">{dbStatus}</span>
          </div>
          {dbStatus === 'Connected' && (
            <p className="text-xs text-muted-foreground">Ping: {dbLatency}ms</p>
          )}
        </div>
        
        <div className="p-4 rounded-xl border bg-card space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Server Environment</h3>
          <div className="flex flex-col gap-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Node Version</span>
              <span className="font-mono">{process.version}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Environment</span>
              <span className="font-mono">{process.env.NODE_ENV}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
