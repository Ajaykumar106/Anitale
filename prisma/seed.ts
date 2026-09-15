import { PrismaClient, MediaType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database for development/testing...');

  if (process.env.NODE_ENV === 'production') {
    console.warn('Skipping seed in production.');
    return;
  }

  // Create an Admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@anitale.local' },
    update: {},
    create: {
      email: 'admin@anitale.local',
      name: 'Dev Admin',
      role: 'ADMIN',
      profile: {
        create: {
          bio: 'Platform Administrator (Development)',
        },
      },
    },
  });

  console.log('Created Dev Admin:', admin.email);

  // Seed TMDB Movie
  const mockMovie = await prisma.media.upsert({
    where: {
      externalId_type: { externalId: 'mock-1', type: MediaType.MOVIE },
    },
    update: {},
    create: {
      externalId: 'mock-1',
      type: MediaType.MOVIE,
      title: 'Dev Movie: The Return',
      releaseDate: new Date('2024-01-01'),
      status: 'Released',
      overview: 'This is a mocked movie for development testing purposes only.',
      genres: {
        create: [
          { genre: { connectOrCreate: { where: { name: 'Action' }, create: { name: 'Action' } } } }
        ]
      }
    },
  });

  // Seed TV Series
  const mockSeries = await prisma.media.upsert({
    where: {
      externalId_type: { externalId: 'mock-2', type: MediaType.SERIES },
    },
    update: {},
    create: {
      externalId: 'mock-2',
      type: MediaType.SERIES,
      title: 'Dev Series: The Beginning',
      releaseDate: new Date('2023-01-01'),
      status: 'Returning Series',
      overview: 'This is a mocked series for development testing purposes only.',
      seasons: {
        create: [
          {
            seasonNumber: 1,
            name: 'Season 1',
            episodes: {
              create: [
                { episodeNumber: 1, name: 'Pilot' },
                { episodeNumber: 2, name: 'The Setup' },
              ]
            }
          }
        ]
      }
    },
  });

  console.log('Seeded Mock Media.');
  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
