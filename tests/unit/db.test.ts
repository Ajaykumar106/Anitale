import { describe, it, expect } from 'vitest';
import { prisma } from '../../src/lib/prisma';

describe('Database Connection', () => {
  it('should instantiate the prisma client', () => {
    expect(prisma).toBeDefined();
  });

  // We skip actual DB queries here unless we configure a test database environment
  it.skip('should be able to query the database', async () => {
    const userCount = await prisma.user.count();
    expect(typeof userCount).toBe('number');
  });
});
