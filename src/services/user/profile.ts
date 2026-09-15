import { prisma } from '@/lib/prisma';

export async function updateProfile(userId: string, data: { name?: string; bio?: string; location?: string; website?: string }) {
  await prisma.user.update({
    where: { id: userId },
    data: { name: data.name },
  });

  return prisma.profile.upsert({
    where: { userId },
    update: {
      bio: data.bio,
      location: data.location,
      website: data.website,
    },
    create: {
      userId,
      bio: data.bio,
      location: data.location,
      website: data.website,
    },
  });
}

export async function deleteAccount(userId: string) {
  // Rely on cascade deletes in Prisma to handle associated records
  return prisma.user.delete({
    where: { id: userId },
  });
}

export async function getProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });
}
