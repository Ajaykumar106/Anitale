import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <div className="container flex h-[80vh] w-full flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Forgot Password</h1>
          <p className="text-sm text-muted-foreground">
            Since Anitale uses secure OAuth (GitHub/Google), password recovery is handled directly by your provider.
          </p>
        </div>
        <p className="px-8 text-center text-sm text-muted-foreground mt-4">
          <Link href="/login" className="hover:text-brand underline underline-offset-4">
            Return to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
