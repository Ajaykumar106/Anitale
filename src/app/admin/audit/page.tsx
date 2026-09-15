import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/rbac';
import { logAction } from '@/services/admin/audit';

export default async function AdminAuditPage() {
  await requireRole('SUPER_ADMIN');
  await logAction('VIEW_AUDIT_LOGS', 'admin_audit');

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { user: { select: { name: true, email: true } } }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Security Audit Logs</h1>
      </div>
      
      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Timestamp</th>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Resource</th>
              <th className="px-4 py-3 font-medium">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {logs.map(log => (
              <tr key={log.id} className="hover:bg-muted/50">
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">{log.user?.name || 'Unknown'}</div>
                  <div className="text-xs text-muted-foreground">{log.user?.email}</div>
                </td>
                <td className="px-4 py-3 font-mono text-xs">
                  {log.action}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {log.resource}
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {log.ipAddress || 'unknown'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
