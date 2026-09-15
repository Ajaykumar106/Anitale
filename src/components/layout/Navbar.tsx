import Link from 'next/link';
import { Suspense } from 'react';
import { SearchBar } from '@/components/search/SearchBar';
import { auth } from '@/lib/auth';

export async function Navbar() {
  const session = await auth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-4">
        {/* Desktop Left */}
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold text-primary">Anitale</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/movie" className="transition-colors hover:text-foreground/80 text-foreground/60">Movies</Link>
            <Link href="/show" className="transition-colors hover:text-foreground/80 text-foreground/60">Series</Link>
            <Link href="/anime" className="transition-colors hover:text-foreground/80 text-foreground/60">Anime</Link>
          </nav>
        </div>
        
        {/* Mobile Left */}
        <div className="flex md:hidden mr-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-primary">Anitale</span>
          </Link>
        </div>
        
        <div className="flex flex-1 items-center justify-end space-x-2">
          <div className="w-full flex-1 md:w-auto md:flex-none hidden md:block">
            <Suspense fallback={<div className="h-10 w-full rounded-md bg-muted animate-pulse max-w-xl" />}>
              <SearchBar />
            </Suspense>
          </div>
          
          {/* Desktop Right Nav */}
          <nav className="hidden md:flex items-center space-x-4">
            {session?.user ? (
              <>
                <Link href="/watchlist" className="text-sm font-medium transition-colors hover:text-foreground/80">Watchlist</Link>
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
