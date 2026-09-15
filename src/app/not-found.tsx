import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex h-[70vh] flex-col items-center justify-center space-y-4 text-center px-4">
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">404</h1>
      <h2 className="text-2xl font-semibold tracking-tight">Page Not Found</h2>
      <p className="text-muted-foreground max-w-md">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="pt-4">
        <Link href="/">
          <Button>Return to Home</Button>
        </Link>
      </div>
    </div>
  );
}
