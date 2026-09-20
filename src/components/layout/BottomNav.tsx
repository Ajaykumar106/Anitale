import Link from 'next/link';
import { Home, Film, Tv, Bookmark, User } from 'lucide-react';
import { auth } from '@/lib/auth';

export async function BottomNav() {
  const session = await auth();

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background/80 backdrop-blur border-t md:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="flex h-full w-full justify-around items-center px-2">
        <Link href="/" className="flex flex-col items-center justify-center w-16 text-muted-foreground hover:text-foreground">
          <Home className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link href="/movie" className="flex flex-col items-center justify-center w-16 text-muted-foreground hover:text-foreground">
          <Film className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium">Movies</span>
        </Link>
        <Link href="/show" className="flex flex-col items-center justify-center w-16 text-muted-foreground hover:text-foreground">
          <Tv className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium">Series</span>
        </Link>
        <Link href={session ? "/watchlist" : "/login"} className="flex flex-col items-center justify-center w-16 text-muted-foreground hover:text-foreground">
          <Bookmark className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium">Watchlist</span>
        </Link>
        <Link href={session ? "/profile" : "/login"} className="flex flex-col items-center justify-center w-16 text-muted-foreground hover:text-foreground">
          <User className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </div>
    </nav>
  );
}
