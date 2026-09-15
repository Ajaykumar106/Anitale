import Link from 'next/link';
import { Home, Search, Bookmark, User, Compass } from 'lucide-react';
import { auth } from '@/lib/auth';

export async function MobileBottomNav() {
  const session = await auth();

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t md:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="flex h-full w-full justify-around items-center px-2">
        <Link href="/" className="flex flex-col items-center justify-center w-16 text-muted-foreground hover:text-foreground">
          <Home className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link href="/movie" className="flex flex-col items-center justify-center w-16 text-muted-foreground hover:text-foreground">
          <Compass className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">Discover</span>
        </Link>
        <Link href="/search" className="flex flex-col items-center justify-center w-16 text-muted-foreground hover:text-foreground">
          <Search className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">Search</span>
        </Link>
        <Link href={session ? "/watchlist" : "/login"} className="flex flex-col items-center justify-center w-16 text-muted-foreground hover:text-foreground">
          <Bookmark className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">Lists</span>
        </Link>
        <Link href={session ? "/profile" : "/login"} className="flex flex-col items-center justify-center w-16 text-muted-foreground hover:text-foreground">
          <User className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </div>
    </nav>
  );
}
