'use client';

import { Button } from '@/components/ui/button';
import { Share, Copy } from 'lucide-react';

export function ReferralDashboard({ inviteCode, referredUsers }: { inviteCode: string, referredUsers: any[] }) {
  
  const inviteUrl = typeof window !== 'undefined' ? `${window.location.origin}/register?ref=${inviteCode}` : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    alert('Invite link copied to clipboard!');
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'Join Anitale',
        text: 'Join me on Anitale to track and discover new anime and movies!',
        url: inviteUrl
      });
    } else {
      handleCopy();
    }
  };

  return (
    <div className="space-y-8">
      <div className="p-6 border rounded-lg bg-card shadow-sm space-y-4">
        <h3 className="text-xl font-semibold">Your Invite Link</h3>
        <div className="flex items-center space-x-2">
          <code className="flex-1 p-3 bg-muted rounded-md border text-sm overflow-x-auto whitespace-nowrap">
            {inviteUrl}
          </code>
          <Button onClick={handleCopy} variant="outline" size="icon" title="Copy">
            <Copy className="w-4 h-4" />
          </Button>
          <Button onClick={handleShare} size="icon" title="Share">
            <Share className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Your Referrals ({referredUsers.length})</h3>
        {referredUsers.length === 0 ? (
          <p className="text-muted-foreground bg-muted p-4 rounded-md text-center italic">
            You haven't invited anyone yet. Share your link to get started!
          </p>
        ) : (
          <div className="space-y-3">
            {referredUsers.map((u, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 border rounded-md">
                <div className="h-10 w-10 rounded-full bg-primary/20 overflow-hidden flex items-center justify-center font-bold text-primary">
                  {u.image ? <img src={u.image} alt={u.name} /> : (u.name || 'A')[0]}
                </div>
                <div>
                  <div className="font-medium">{u.name || 'Anonymous User'}</div>
                  <div className="text-xs text-muted-foreground">Joined {new Date(u.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
