import { signIn } from '@/lib/auth';
import Link from 'next/link';

export default function SignupPage() {
  return (
    <div className="container flex h-[80vh] w-full flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground">Sign up to start tracking your media</p>
        </div>
        <div className="grid gap-4">

          <form
            action={async () => {
              'use server';
              await signIn('google', { redirectTo: '/profile' });
            }}
          >
            <button className="inline-flex w-full items-center justify-center rounded-md border border-input bg-background px-8 h-10 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
              Sign up with Google
            </button>
          </form>
        </div>
        <p className="px-8 text-center text-sm text-muted-foreground">
          <Link href="/login" className="hover:text-brand underline underline-offset-4">
            Already have an account? Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
