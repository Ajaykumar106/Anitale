import { auth } from '@/lib/auth';
import { getProfile } from '@/services/user/profile';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FriendsList } from '@/components/profile/FriendsList';

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const user = await getProfile(session.user.id);
  if (!user) redirect('/login');

  return (
    <div className="container py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Profile</h1>
        <Link href="/settings" className="text-sm font-medium border px-4 py-2 rounded hover:bg-accent">
          Edit Settings
        </Link>
      </div>

      <div className="border rounded-lg p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center text-primary text-2xl font-bold">
            {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-2xl font-semibold">{user.name || 'Anonymous User'}</h2>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="pt-6 border-t">
          <h3 className="font-medium text-lg mb-4">About Me</h3>
          <p className="text-muted-foreground">
            {user.profile?.bio || 'No bio provided.'}
          </p>
        </div>

        <div className="pt-6 border-t grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-muted-foreground block">Location</span>
            <span className="font-medium">{user.profile?.location || 'Unknown'}</span>
          </div>
          <div>
            <span className="text-sm text-muted-foreground block">Website</span>
            {user.profile?.website ? (
              <a href={user.profile.website} className="font-medium text-primary hover:underline" target="_blank" rel="noreferrer">
                {user.profile.website}
              </a>
            ) : (
              <span className="font-medium">None</span>
            )}
          </div>
        </div>
        
        <FriendsList />
      </div>
    </div>
  );
}
