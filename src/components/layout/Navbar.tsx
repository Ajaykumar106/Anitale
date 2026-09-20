import Link from 'next/link';
import { Suspense } from 'react';

import { auth } from '@/lib/auth';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { Search } from 'lucide-react';

export async function Navbar() {
  const session = await auth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-4">
        {/* Desktop Left */}
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold text-primary">Anitale</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="/movie" className="transition-colors hover:text-foreground/80 text-foreground/60">Movies</Link>
            <Link href="/show" className="transition-colors hover:text-foreground/80 text-foreground/60">Series</Link>
            <Link href="/anime" className="transition-colors hover:text-foreground/80 text-foreground/60">Anime</Link>
            <Link href="/community" className="transition-colors hover:text-foreground/80 text-foreground/60">Community</Link>
            <Link href="/news" className="transition-colors hover:text-foreground/80 text-foreground/60">News</Link>
          </nav>
        </div>
        
        <div className="flex flex-1 items-center justify-end space-x-2">
          {/* Global Search Icon */}
          <div className="flex mr-2">
            <Link href="/search" className="p-2 text-muted-foreground hover:text-foreground">
              <Search className="h-6 w-6" />
              <span className="sr-only">Search</span>
            </Link>
          </div>
          
          {/* Desktop Right Nav */}
          <nav className="hidden md:flex items-center space-x-4">
            {session?.user ? (
              <>
                <NotificationBell />
                <Link href="/watchlist" className="text-sm font-medium transition-colors hover:text-foreground/80">Watchlist</Link>
                <Link href="/calendar" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                  Calendar
                </Link>
                <Link href="/feedback" className="text-sm font-medium text-yellow-500 transition-colors hover:text-yellow-400">
                  Beta Feedback
                </Link>
                <Link href="/profile" className="text-sm font-medium transition-colors hover:text-foreground/80">Profile</Link>
                <Link href="/api/auth/signout" className="text-sm font-medium transition-colors text-destructive hover:text-destructive/80">Logout</Link>
              </>
            ) : (
              <Link href="/login" className="text-sm font-medium transition-colors hover:text-foreground/80">Sign In</Link>
            )}
          </nav>
        </div>
      </div>
    </nav>
  );
}
