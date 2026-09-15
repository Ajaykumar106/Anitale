import { prisma } from '@/lib/prisma';
import sanitizeHtml from 'sanitize-html';
import { checkRateLimit } from '@/lib/rate-limit';

export async function createReview(userId: string, mediaId: string, rating: number, content?: string, hasSpoilers: boolean = false) {
  // Rate limit: 5 reviews per hour per user
  if (!checkRateLimit(`review:${userId}`, 5, 3600 * 1000)) {
    throw new Error('Rate limit exceeded. Try again later.');
  }

  // Ensure user is not blocked from posting (basic check)
  // In a real app, we'd check if user has a site-wide block/ban

  let sanitizedContent: string | null = null;
  if (content) {
    sanitizedContent = sanitizeHtml(content, {
      allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
      allowedAttributes: {
        'a': ['href']
      }
    });
  }

  return prisma.review.create({
    data: {
      userId,
      mediaId,
      rating,
      content: sanitizedContent,
      hasSpoilers,
    },
  });
}

export async function updateReview(userId: string, reviewId: string, rating: number, content?: string, hasSpoilers?: boolean) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new Error('Review not found');
  if (review.userId !== userId) throw new Error('Unauthorized');

  let sanitizedContent = review.content;
  if (content !== undefined) {
    sanitizedContent = content ? sanitizeHtml(content, {
      allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
      allowedAttributes: {
        'a': ['href']
      }
    }) : null;
  }

  return prisma.review.update({
    where: { id: reviewId },
    data: {
      rating,
      content: sanitizedContent,
      hasSpoilers: hasSpoilers !== undefined ? hasSpoilers : review.hasSpoilers,
    },
  });
}

export async function deleteReview(userId: string, reviewId: string) {
  const review = await prisma.review.findUnique({ where: { id: reviewId }, include: { user: true } });
  if (!review) throw new Error('Review not found');
  
  // Allow the author or an admin to delete
  if (review.userId !== userId && review.user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  return prisma.review.delete({
    where: { id: reviewId },
  });
}
