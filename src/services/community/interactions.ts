import { prisma } from '@/lib/prisma';
import sanitizeHtml from 'sanitize-html';
import { checkRateLimit } from '@/lib/rate-limit';

export async function addComment(userId: string, reviewId: string, content: string) {
  if (!checkRateLimit(`comment:${userId}`, 10, 3600 * 1000)) {
    throw new Error('Rate limit exceeded');
  }

  const sanitizedContent = sanitizeHtml(content, { allowedTags: [], allowedAttributes: {} }); // plain text only for comments

  // Check if blocked by review author
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new Error('Review not found');

  const block = await prisma.block.findFirst({
    where: {
      OR: [
        { blockerId: review.userId, blockedId: userId },
        { blockerId: userId, blockedId: review.userId }
      ]
    }
  });

  if (block) throw new Error('Cannot interact with this user');

  return prisma.comment.create({
    data: {
      userId,
      reviewId,
      content: sanitizedContent,
    },
  });
}

export async function toggleLike(userId: string, reviewId: string) {
  const existing = await prisma.like.findUnique({
    where: { userId_reviewId: { userId, reviewId } }
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    return false;
  } else {
    await prisma.like.create({ data: { userId, reviewId } });
    return true;
  }
}

export async function toggleFollow(followerId: string, followingId: string) {
  if (followerId === followingId) throw new Error('Cannot follow yourself');

  const block = await prisma.block.findFirst({
    where: {
      OR: [
        { blockerId: followerId, blockedId: followingId },
        { blockerId: followingId, blockedId: followerId }
      ]
    }
  });

  if (block) throw new Error('Cannot follow this user');

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } }
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
    return false;
  } else {
    await prisma.follow.create({ data: { followerId, followingId } });
    return true;
  }
}
