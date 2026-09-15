import { prisma } from '@/lib/prisma';
import { NotificationType } from '@prisma/client';
import { sendEmailNotification } from './email';

export async function createNotification(data: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  mediaId?: string;
}) {
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

  const notification = await prisma.notification.create({
    data
  });

  // Optionally send email based on type
  if (data.type === 'NEW_EPISODE' || data.type === 'FOLLOW') {
    const html = `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>${data.title}</h2>
        <p>${data.message}</p>
        ${data.link ? `<a href="https://anitale.app${data.link}">View Details</a>` : ''}
      </div>
    `;
    await sendEmailNotification(data.userId, data.title, html);
  }

  return notification;
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
