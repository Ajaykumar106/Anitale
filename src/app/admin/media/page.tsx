import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/rbac';
import { logAction } from '@/services/admin/audit';

export default async function AdminMediaPage() {
  await requireRole('MODERATOR');
  await logAction('VIEW_MEDIA', 'admin_media');

  const mediaList = await prisma.media.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Media Management</h1>
      </div>
      
      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">External ID</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {mediaList.map(item => (
              <tr key={item.id} className="hover:bg-muted/50">
                <td className="px-4 py-3 font-medium">
                  {item.title}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                    {item.type}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {item.externalId}
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {item.status || 'Unknown'}
                </td>
                <td className="px-4 py-3 text-right space-x-3">
                  <button className="text-primary hover:underline text-xs">Edit</button>
                  <button className="text-destructive hover:underline text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
