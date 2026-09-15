import { auth } from '@/lib/auth';
import { deleteAccount } from '@/services/user/profile';
import { redirect } from 'next/navigation';
import { NotificationPreferences } from '@/components/notifications/NotificationPreferences';

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const handleDelete = async () => {
    'use server';
    const session = await auth();
    if (session?.user?.id) {
      await deleteAccount(session.user.id);
      redirect('/api/auth/signout');
    }
  };

  return (
    <div className="container py-8 max-w-3xl space-y-8">
      <h1 className="text-3xl font-bold">Account Settings</h1>

      <div className="border rounded-lg p-6 space-y-6">
        <h2 className="text-xl font-semibold">Privacy Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Public Profile</p>
              <p className="text-sm text-muted-foreground">Allow others to view your profile and public collections.</p>
            </div>
            <div className="w-10 h-6 bg-primary rounded-full relative">
              <div className="absolute right-1 top-1 bg-white w-4 h-4 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-6">
        <NotificationPreferences />
      </div>

      <div className="border border-destructive/20 bg-destructive/5 rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold text-destructive">Danger Zone</h2>
        <p className="text-sm text-muted-foreground">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <form action={handleDelete}>
          <button className="bg-destructive text-destructive-foreground px-4 py-2 rounded font-medium text-sm hover:bg-destructive/90">
            Delete Account
          </button>
        </form>
      </div>
    </div>
  );
}
