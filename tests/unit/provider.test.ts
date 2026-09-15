import { describe, it, expect, vi } from 'vitest';
import { TMDBAdapter } from '../../src/providers/tmdb/adapter';
import { MediaType } from '@prisma/client';

describe('TMDB Provider Adapter', () => {
  it('should timeout and throw after retries if API is unresponsive', async () => {
    const adapter = new TMDBAdapter('test_key');
    
    // Mock global fetch to abort/timeout
    global.fetch = vi.fn().mockImplementation(() => {
      const err = new Error('Timeout');
      err.name = 'AbortError';
      return Promise.reject(err);
    });

    await expect(adapter.search('Inception')).rejects.toThrow('Timeout');
  });

  it('should throw an error on invalid schema response', async () => {
    const adapter = new TMDBAdapter('test_key');
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ unexpected_field: 'data' }) // Missing 'results' array
    });

    await expect(adapter.search('Inception')).rejects.toThrow();
  });

  it('should successfully parse valid search responses', async () => {
    const adapter = new TMDBAdapter('test_key');
    
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        results: [
          {
            id: 123,
            title: 'Mock Movie',
            media_type: 'movie',
            release_date: '2020-01-01'
          }
        ]
      })
    });

    const results = await adapter.search('Mock');
    expect(results).toHaveLength(1);
    expect(results[0].externalId).toBe('123');
    expect(results[0].type).toBe(MediaType.MOVIE);
  });
});
