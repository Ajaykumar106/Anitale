import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resolvePlayback } from '../../src/services/video/resolver';
import { prisma } from '../../src/lib/prisma';

vi.mock('../../src/lib/prisma', () => ({
  prisma: {
    videoProvider: { findMany: vi.fn() },
    videoProviderMediaMapping: { findMany: vi.fn() }
  }
}));

// Mock the actual registry
vi.mock('../../src/providers/video/mock', () => {
  return {
    MockVideoProvider: class MockVideoProvider {
      id = 'mock-provider';
      name = 'Mock Video Provider';
      canEmbed = () => true;
      getPlayback = async (mediaId: string) => {
        if (mediaId === 'error-test') throw new Error('Provider failed');
        if (mediaId === 'unavailable-test') return null;
        if (mediaId === 'timeout-test') {
          await new Promise(r => setTimeout(r, 6000));
          return null;
        }
        return { isEmbed: true, embedUrl: 'test-url', sources: [] };
      };
    }
  };
});

describe('Video Provider Abstraction (Phase 8)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('successfully resolves playback for a valid media ID', async () => {
    // @ts-expect-error: mocking
    prisma.videoProvider.findMany.mockResolvedValue([
      { id: '1', slug: 'mock-provider', name: 'Mock Video Provider', isEnabled: true, priority: 10 }
    ]);
    // @ts-expect-error: mocking
    prisma.videoProviderMediaMapping.findMany.mockResolvedValue([]);

    const result = await resolvePlayback('valid-media');
    
    expect(result).not.toBeNull();
    expect(result?.providerId).toBe('mock-provider');
    expect(result?.playback.isEmbed).toBe(true);
  });

  it('falls back if provider returns null (unavailable)', async () => {
    // @ts-expect-error: mocking
    prisma.videoProvider.findMany.mockResolvedValue([
      { id: '1', slug: 'mock-provider', name: 'Mock Video Provider', isEnabled: true, priority: 10 }
    ]);
    // @ts-expect-error: mocking
    prisma.videoProviderMediaMapping.findMany.mockResolvedValue([]);

    const result = await resolvePlayback('unavailable-test');
    expect(result).toBeNull();
  });

  it('gracefully handles provider exceptions', async () => {
    // @ts-expect-error: mocking
    prisma.videoProvider.findMany.mockResolvedValue([
      { id: '1', slug: 'mock-provider', name: 'Mock Video Provider', isEnabled: true, priority: 10 }
    ]);
    // @ts-expect-error: mocking
    prisma.videoProviderMediaMapping.findMany.mockResolvedValue([]);

    await expect(resolvePlayback('error-test')).rejects.toThrow('Provider failed');
  });

  it('times out safely if provider hangs', async () => {
    // @ts-expect-error: mocking
    prisma.videoProvider.findMany.mockResolvedValue([
      { id: '1', slug: 'mock-provider', name: 'Mock Video Provider', isEnabled: true, priority: 10 }
    ]);
    // @ts-expect-error: mocking
    prisma.videoProviderMediaMapping.findMany.mockResolvedValue([]);
    
    // Instead of fake timers which can be tricky with Promise.race in vitest,
    // we'll let the provider mock reject quickly for timeout test, OR we can mock the Promise.race
    
    // Quick and dirty vitest async timer workaround:
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const promise = resolvePlayback('timeout-test');
    
    // Advance timers past 5000ms
    vi.advanceTimersByTimeAsync(5100);
    
    await expect(promise).rejects.toThrow('Provider timeout');
    vi.useRealTimers();
  });
});
