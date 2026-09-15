import { auth } from '@/lib/auth';
import { getCollections } from '@/services/user/collections';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function CollectionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const collections = await getCollections(session.user.id);

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Your Collections</h1>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium text-sm">
          New Collection
        </button>
      </div>

      {collections.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
          <p className="text-muted-foreground">You haven&apos;t created any collections yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <Link key={collection.id} href={`/collections/${collection.id}`} className="group block">
              <div className="p-6 border rounded-lg transition-colors group-hover:border-primary">
                <h3 className="text-xl font-semibold mb-2">{collection.name}</h3>
                <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                  {collection.description || 'No description'}
                </p>
                <div className="text-xs font-medium bg-muted w-fit px-2 py-1 rounded">
                  {collection._count.items} items
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
