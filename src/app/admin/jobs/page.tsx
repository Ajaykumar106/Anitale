import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/rbac';
import { logAction } from '@/services/admin/audit';

export default async function AdminJobsPage() {
  await requireRole('SUPER_ADMIN');
  await logAction('VIEW_JOBS', 'admin_jobs');

  const jobs = await prisma.backgroundJob.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  async function triggerJobs() {
    'use server';
    await requireRole('SUPER_ADMIN');
    const secret = process.env.CRON_SECRET || '';
    if (!secret) return;
    
    // Internal fetch using the secret
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/cron/process-jobs`, {
      headers: { Authorization: `Bearer ${secret}` }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Background Jobs Monitor</h1>
        <form action={triggerJobs}>
          <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90">
            Trigger Queue manually
          </button>
        </form>
      </div>
      
      <div className="rounded-md border overflow-x-auto bg-card">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Attempts</th>
              <th className="px-4 py-3 font-medium">Run At</th>
              <th className="px-4 py-3 font-medium">Error Trace</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {jobs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No jobs found in the database.
                </td>
              </tr>
            )}
            {jobs.map(job => (
              <tr key={job.id} className="hover:bg-muted/50">
                <td className="px-4 py-3 font-mono text-xs">{job.type}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold
                    ${job.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500 border-green-500/20' : ''}
                    ${job.status === 'FAILED' ? 'bg-destructive/10 text-destructive border-destructive/20' : ''}
                    ${job.status === 'RUNNING' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : ''}
                    ${job.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : ''}
                  `}>
                    {job.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {job.attempts} / {job.maxAttempts}
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                  {new Date(job.runAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs font-mono max-w-[200px] truncate">
                  {job.lastError || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
