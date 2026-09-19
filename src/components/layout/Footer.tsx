import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-background mt-auto">
      <div className="container py-8 md:py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="text-xl font-bold tracking-tight text-primary">Anitale</span>
            <p className="text-sm text-muted-foreground text-center md:text-left">
              Your ultimate legal mediator for finding where to watch movies, series, and anime.
            </p>
          </div>
          
          <nav className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <Link href="/about" className="hover:text-primary transition-colors">
              About Us
            </Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </nav>
        </div>
        
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Anitale. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
