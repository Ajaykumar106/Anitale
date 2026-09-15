import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

export const metadata = {
  title: 'Notifications | Anitale',
};

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  return (
    <div className="container py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>
      <NotificationCenter />
    </div>
  );
}
