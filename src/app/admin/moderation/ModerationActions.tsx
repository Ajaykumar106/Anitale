'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { dismissReport, resolveAndHideContent, banUser } from './actions';

export function ModerationActions({ report }: { report: any }) {
  const [isPending, startTransition] = useTransition();

  const handleDismiss = () => {
    startTransition(async () => {
      await dismissReport(report.id);
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const targetId = report.targetType === 'REVIEW' ? report.reviewId : report.targetType === 'COMMENT' ? report.commentId : report.targetUserId;
      if (targetId) {
        await resolveAndHideContent(report.id, report.targetType, targetId);
      }
    });
  };

  const handleBan = () => {
    startTransition(async () => {
      if (report.targetUserId) {
        await banUser(report.id, report.targetUserId);
      }
    });
  };

  return (
    <div className="flex gap-2">
      <Button 
        variant="default" 
        size="sm" 
        onClick={handleDismiss}
        disabled={isPending}
      >
        Dismiss Report
      </Button>
      <Button 
        variant="destructive" 
        size="sm" 
        onClick={handleDelete}
        disabled={isPending || report.targetType === 'USER'}
      >
        Delete Content
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleBan}
        disabled={isPending || !report.targetUserId}
      >
        Ban User
      </Button>
    </div>
  );
}
