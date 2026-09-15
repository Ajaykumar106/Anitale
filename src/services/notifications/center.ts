import { prisma } from '@/lib/prisma';
import { NotificationType } from '@prisma/client';

export async function createNotification(data: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  mediaId?: string;
}) {
  // Prevent duplicate notifications: check if an identical unread notification exists
  // for the same type, title, and mediaId within the last 24 hours.
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const existing = await prisma.notification.findFirst({
    where: {
      userId: data.userId,
      type: data.type,
      title: data.title,
      mediaId: data.mediaId,
      createdAt: { gte: yesterday }
    }
  });

  if (existing) {
    return existing; // Skip creation if it already exists recently
  }

  return prisma.notification.create({
    data
  });
}

export async function getUserNotifications(userId: string, unreadOnly: boolean = false) {
  return prisma.notification.findMany({
    where: {
      userId,
      ...(unreadOnly ? { isRead: false } : {})
    },
    orderBy: { createdAt: 'desc' },
    include: {
      media: {
        select: {
          id: true,
          title: true,
          posterPath: true
        }
      }
    }
  });
}

export async function markAsRead(notificationId: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true }
  });
}

export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true }
  });
}
