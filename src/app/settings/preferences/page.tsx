import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PreferencesForm } from './PreferencesForm';

export default async function PreferencesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const genres = await prisma.genre.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="container py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Personalization & Settings</h1>
      <p className="text-muted-foreground mb-8">
        Control what content appears in your feeds and recommendations.
      </p>

      <PreferencesForm genres={genres} />
    </div>
  );
}
