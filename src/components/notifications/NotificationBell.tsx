'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetch('/api/user/notifications')
      .then(res => res.json())
      .then(data => {
        if (data && data.notifications) {
          setNotifications(data.notifications.slice(0, 5)); // Show top 5 in dropdown
          setUnreadCount(data.unreadCount);
        }
      })
      .catch(console.error);
  }, []);

  const markAllRead = async () => {
    await fetch('/api/user/notifications', { method: 'PATCH' });
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex justify-between items-center px-2 py-1.5">
          <DropdownMenuLabel className="px-0">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-auto px-2 py-1 text-xs" onClick={markAllRead}>
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No notifications yet.
          </div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto">
            {notifications.map(notification => (
              <DropdownMenuItem key={notification.id} asChild>
                <Link 
                  href={notification.link || '#'} 
                  className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${!notification.isRead ? 'bg-primary/5' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex justify-between w-full">
                    <span className="font-semibold text-sm">{notification.title}</span>
                    {!notification.isRead && <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />}
                  </div>
                  <span className="text-xs text-muted-foreground line-clamp-2">
                    {notification.message}
                  </span>
                  <span className="text-[10px] text-muted-foreground/70 mt-1">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </span>
                </Link>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
