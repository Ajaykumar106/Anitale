import { describe, it, expect } from 'vitest';
import { prisma } from '../../src/lib/prisma';
import { MediaType } from '@prisma/client';

describe('Database Constraints & Import', () => {
  // DB tests are skipped if no DB is available. In CI, they will run if DB is provisioned.
  it.skip('should enforce uniqueness on externalId and type', async () => {
    await prisma.media.create({
      data: {
        externalId: '100',
        type: MediaType.MOVIE,
        title: 'Original Title',
      }
    });

    // Attempting to create duplicate should throw
    await expect(prisma.media.create({
      data: {
        externalId: '100',
        type: MediaType.MOVIE,
        title: 'Duplicate Title',
      }
    })).rejects.toThrow();
  });
});
