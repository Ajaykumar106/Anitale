import { auth } from '@/lib/auth';
import { getReportQueue } from '@/services/community/moderation';
import { redirect } from 'next/navigation';

import { Report } from '@prisma/client';
import { ModerationActions } from './ModerationActions';

export default async function ModerationQueuePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  let queue: Array<Report & { 
    reporter: { name?: string | null; email?: string | null } | null; 
    review: { content?: string | null } | null; 
    comment: { content?: string | null } | null;
  }> = [];
  try {
    queue = await getReportQueue(session.user.id);
  } catch (error) {
    return (
      <div className="container py-8 text-center text-destructive">
        <h1 className="text-2xl font-bold">Unauthorized</h1>
        <p>You must be an administrator to view this page.</p>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Moderation Queue</h1>
      
      {queue.length === 0 ? (
        <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
          <p className="text-muted-foreground">No pending reports.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {queue.map(report => (
            <div key={report.id} className="border p-4 rounded-lg bg-card">
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold text-sm bg-destructive/10 text-destructive px-2 py-1 rounded">
                  {report.targetType}
                </span>
                <span className="text-xs text-muted-foreground">
                  Reported by {report.reporter?.name || report.reporter?.email}
                </span>
              </div>
              <p className="font-medium mb-1">Reason:</p>
              <p className="text-sm text-muted-foreground bg-muted p-2 rounded mb-4">
                {report.reason}
              </p>
              
              <div className="mb-4">
                <p className="font-medium mb-1">Reported Content Snippet:</p>
                <div className="text-sm bg-muted p-2 rounded italic">
                  {report.review?.content || report.comment?.content || 'User Profile / No content preview'}
                </div>
              </div>

              <ModerationActions report={report} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
