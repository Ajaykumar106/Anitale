import { requireRole } from '@/lib/rbac';
import { logAction } from '@/services/admin/audit';
import { getEventCounts, getDailyActiveUsers } from '@/services/analytics';

export default async function AdminAnalyticsPage() {
  await requireRole('ADMIN');
  await logAction('VIEW_ANALYTICS', 'admin_analytics');

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7); // Last 7 days

  const [eventCounts, dauRows] = await Promise.all([
    getEventCounts(startDate, endDate),
    getDailyActiveUsers(startDate, endDate)
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Product Analytics (Last 7 Days)</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-md border p-6 bg-card">
          <h3 className="font-semibold text-lg mb-4">Top Events</h3>
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium rounded-tl-md">Event Name</th>
                <th className="px-4 py-3 font-medium rounded-tr-md text-right">Count</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {eventCounts.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-4 py-4 text-center text-muted-foreground">No events recorded.</td>
                </tr>
              ) : (
                eventCounts.sort((a, b) => b._count.id - a._count.id).map(e => (
                  <tr key={e.eventName} className="hover:bg-muted/50">
                    <td className="px-4 py-3 font-medium">{e.eventName}</td>
                    <td className="px-4 py-3 text-right">{e._count.id}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="rounded-md border p-6 bg-card">
          <h3 className="font-semibold text-lg mb-4">Daily Active Users</h3>
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium rounded-tl-md">Date</th>
                <th className="px-4 py-3 font-medium rounded-tr-md text-right">Unique Users</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(dauRows as any[]).length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-4 py-4 text-center text-muted-foreground">No DAU data available.</td>
                </tr>
              ) : (
                (dauRows as any[]).map((row, i) => (
                  <tr key={i} className="hover:bg-muted/50">
                    <td className="px-4 py-3 font-medium">{new Date(row.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">{Number(row.dau)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
