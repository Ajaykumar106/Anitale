'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, Check } from 'lucide-react';
import Link from 'next/link';

export type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  media?: {
    id: string;
    title: string;
    posterPath: string | null;
  } | null;
};

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'All' | 'Unread'>('Unread');
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/notifications?unread=${filter === 'Unread'}`);
      if (res.ok) {
        setNotifications(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'PUT' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PUT' });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button variant={filter === 'Unread' ? 'default' : 'outline'} onClick={() => setFilter('Unread')}>
            Unread
          </Button>
          <Button variant={filter === 'All' ? 'default' : 'outline'} onClick={() => setFilter('All')}>
            All
          </Button>
        </div>
        <Button variant="ghost" onClick={markAllAsRead} disabled={!notifications.some(n => !n.isRead)}>
          <Check className="w-4 h-4 mr-2" />
          Mark all as read
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-lg">
          <Bell className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">You are all caught up!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map(n => (
            <div key={n.id} className={`p-4 border rounded-lg flex items-start gap-4 transition-colors ${n.isRead ? 'bg-muted/30 opacity-70' : 'bg-card'}`}>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold">{n.title}</h4>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                    {formatTimeAgo(n.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                {n.media && (
                  <Link href={`/show/${n.media.id}`} className="text-xs text-primary hover:underline mt-2 inline-block">
                    View Title →
                  </Link>
                )}
              </div>
              {!n.isRead && (
                <Button variant="ghost" size="icon" onClick={() => markAsRead(n.id)} title="Mark as read">
                  <Check className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
