import { prisma } from '@/lib/prisma';
import { ProviderMediaDetails } from '@/providers/types';
import { MediaType } from '@prisma/client';

export async function importMedia(data: ProviderMediaDetails) {
  // Upsert the media to avoid duplicates
  const media = await prisma.media.upsert({
    where: {
      externalId_type: {
        externalId: data.externalId,
        type: data.type,
      },
    },
    update: {
      title: data.title,
      originalTitle: data.originalTitle,
      overview: data.overview,
      posterPath: data.posterPath,
      backdropPath: data.backdropPath,
      releaseDate: data.releaseDate,
      status: data.status,
      runtime: data.runtime,
    },
    create: {
      externalId: data.externalId,
      type: data.type,
      title: data.title,
      originalTitle: data.originalTitle,
      overview: data.overview,
      posterPath: data.posterPath,
      backdropPath: data.backdropPath,
      releaseDate: data.releaseDate,
      status: data.status,
      runtime: data.runtime,
    },
  });

  // Handle Genres
  if (data.genres && data.genres.length > 0) {
    for (const genreName of data.genres) {
      const genre = await prisma.genre.upsert({
        where: { name: genreName },
        update: {},
        create: { name: genreName },
      });

      await prisma.mediaGenre.upsert({
        where: {
          mediaId_genreId: {
            mediaId: media.id,
            genreId: genre.id,
          },
        },
        update: {},
        create: {
          mediaId: media.id,
          genreId: genre.id,
        },
      });
    }
  }

  // Handle Alternative Titles
  if (data.alternativeTitles && data.alternativeTitles.length > 0) {
    for (const alt of data.alternativeTitles) {
      // We check if it exists using a compound query, but there's no unique constraint on (mediaId, title) in DB right now
      // So we'll just delete existing and recreate for simplicity in import
    }
    
    await prisma.mediaAlternativeTitle.deleteMany({
      where: { mediaId: media.id },
    });
    
    await prisma.mediaAlternativeTitle.createMany({
      data: data.alternativeTitles.map(alt => ({
        mediaId: media.id,
        title: alt.title,
        language: alt.language,
      })),
    });
  }

  return media;
}
