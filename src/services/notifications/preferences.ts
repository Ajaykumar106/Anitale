import { prisma } from '@/lib/prisma';

export async function getUserPreferences(userId: string) {
  const prefs = await prisma.notificationPreference.findUnique({
    where: { userId }
  });

  if (!prefs) {
    // Return default preferences if none exist
    return prisma.notificationPreference.create({
      data: { userId }
    });
  }

  return prefs;
}

export async function updatePreferences(userId: string, updates: {
  newEpisode?: boolean;
  newSeason?: boolean;
  releaseReminder?: boolean;
  availabilityChange?: boolean;
  recommendations?: boolean;
}) {
  return prisma.notificationPreference.upsert({
    where: { userId },
    update: updates,
    create: {
      userId,
      ...updates
    }
  });
}
