import { prisma } from '@/lib/prisma';
import { UserProfile } from './signals';
import { Media, MediaGenre } from '@prisma/client';

export type MediaWithGenres = Media & { genres: MediaGenre[] };

export async function getCandidates(
  userProfile: UserProfile,
  strategy: 'SIMILAR' | 'TRENDING' | 'HIDDEN_GEMS' | 'NEW_RELEASES',
  limit: number = 100,
  anchorMediaId?: string
): Promise<MediaWithGenres[]> {
  const excludedIds = [
    ...Array.from(userProfile.droppedMediaIds),
    ...(strategy !== 'SIMILAR' ? Array.from(userProfile.completedMediaIds) : []),
    ...(anchorMediaId ? [anchorMediaId] : [])
  ];

  let candidates: MediaWithGenres[] = [];

  switch (strategy) {
    case 'TRENDING':
      candidates = await prisma.media.findMany({
        where: { id: { notIn: excludedIds } },
        orderBy: { updatedAt: 'desc' }, // Proxy for trending interactions
        take: limit,
        include: { genres: true }
      });
      break;

    case 'HIDDEN_GEMS':
      // Older or less popular but generally decent (we use random offset or just older release dates)
      candidates = await prisma.media.findMany({
        where: {
          id: { notIn: excludedIds },
          releaseDate: { lte: new Date(new Date().setFullYear(new Date().getFullYear() - 5)) }
        },
        take: limit,
        include: { genres: true }
      });
      break;

    case 'NEW_RELEASES':
      candidates = await prisma.media.findMany({
        where: {
          id: { notIn: excludedIds },
          releaseDate: { gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) }
        },
        orderBy: { releaseDate: 'desc' },
        take: limit,
        include: { genres: true }
      });
      break;

    case 'SIMILAR':
      if (anchorMediaId) {
        const anchor = await prisma.media.findUnique({
          where: { id: anchorMediaId },
          include: { genres: true }
        });
        if (anchor) {
          const anchorGenreIds = anchor.genres.map(g => g.genreId);
          candidates = await prisma.media.findMany({
            where: {
              id: { notIn: excludedIds },
              type: anchor.type,
              genres: { some: { genreId: { in: anchorGenreIds } } }
            },
            take: limit,
            include: { genres: true }
          });
        }
      }
      break;
  }

  // Fallback if not enough candidates
  if (candidates.length < 10) {
    const fallback = await prisma.media.findMany({
      where: { id: { notIn: [...excludedIds, ...candidates.map(c => c.id)] } },
      take: limit - candidates.length,
      include: { genres: true }
    });
    candidates = [...candidates, ...fallback];
  }

  return candidates;
}
