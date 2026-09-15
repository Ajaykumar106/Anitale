import { auth } from '@/lib/auth';
import { getCollection } from '@/services/user/collections';
import { MediaGrid } from '@/components/media/MediaGrid';
import { MediaCard } from '@/components/media/MediaCard';
import { notFound, redirect } from 'next/navigation';

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const { id } = await params;
  const collection = await getCollection(id);

  if (!collection) notFound();

  const isOwner = collection.userId === session.user.id;
  if (!collection.isPublic && !isOwner) notFound();

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{collection.name}</h1>
        {collection.description && (
          <p className="text-muted-foreground max-w-2xl">{collection.description}</p>
        )}
        <div className="mt-4 text-sm text-muted-foreground flex items-center space-x-2">
          <span>Created by {collection.user.name || 'Anonymous'}</span>
          <span>•</span>
          <span>{collection.items.length} items</span>
          {!collection.isPublic && (
            <>
              <span>•</span>
              <span className="bg-muted px-2 py-0.5 rounded text-xs font-medium">Private</span>
            </>
          )}
        </div>
      </div>

      {collection.items.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
          <p className="text-muted-foreground">This collection has no items.</p>
        </div>
      ) : (
        <MediaGrid>
          {collection.items.map((item) => (
            <MediaCard
              key={item.id}
              id={item.media.externalId}
              title={item.media.title}
              type={item.media.type}
              posterPath={item.media.posterPath}
              year={item.media.releaseDate?.getFullYear()}
            />
          ))}
        </MediaGrid>
      )}
    </div>
  );
}
