import { requireRole } from '@/lib/rbac';
import Link from 'next/link';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole('MODERATOR'); // Lowest admin tier

  return (
    <div className="flex min-h-[80vh] flex-col md:flex-row gap-6 container py-8">
      <aside className="w-full md:w-64 shrink-0 flex flex-col space-y-4">
        <div className="bg-muted p-4 rounded-lg">
          <h2 className="font-semibold text-lg">Admin Panel</h2>
          <p className="text-sm text-muted-foreground">Welcome back, {session.user.name}</p>
          <div className="mt-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
            {session.user.role}
          </div>
        </div>
        
        <nav className="flex flex-col space-y-1">
          <Link href="/admin" className="px-3 py-2 rounded-md hover:bg-muted font-medium text-sm">Dashboard</Link>
          <Link href="/admin/users" className="px-3 py-2 rounded-md hover:bg-muted font-medium text-sm">User Management</Link>
          <Link href="/admin/media" className="px-3 py-2 rounded-md hover:bg-muted font-medium text-sm">Media & Providers</Link>
          <Link href="/admin/analytics" className="px-3 py-2 rounded-md hover:bg-muted font-medium text-sm">Product Analytics</Link>
          <Link href="/admin/health" className="px-3 py-2 rounded-md hover:bg-muted font-medium text-sm">System Health</Link>
          <Link href="/admin/jobs" className="px-3 py-2 rounded-md hover:bg-muted font-medium text-sm text-muted-foreground">Background Jobs</Link>
          <Link href="/admin/audit" className="px-3 py-2 rounded-md hover:bg-muted font-medium text-sm text-muted-foreground">Audit Logs</Link>
        </nav>
      </aside>
      
      <main className="flex-1 border rounded-lg p-6 bg-card">
        {children}
      </main>
    </div>
  );
}
