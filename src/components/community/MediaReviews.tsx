import { prisma } from '@/lib/prisma';
import { ReviewCard } from './ReviewCard';

export async function MediaReviews({ mediaId }: { mediaId: string }) {
  const reviews = await prisma.review.findMany({
    where: { mediaId },
    include: {
      user: { select: { id: true, name: true, image: true } },
      _count: { select: { likes: true, comments: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 20
  });

  if (reviews.length === 0) {
    return <div className="text-muted-foreground italic">No reviews yet. Be the first to share your thoughts!</div>;
  }

  return (
    <div className="space-y-4">
      {reviews.map(review => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}
