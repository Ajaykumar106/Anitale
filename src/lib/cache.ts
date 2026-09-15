import { unstable_cache } from 'next/cache';

// TTL Constants (in seconds)
export const CACHE_TTL = {
  METADATA: 86400, // 24 hours
  SEARCH: 3600,    // 1 hour
  AVAILABILITY: 21600, // 6 hours
  RECOMMENDATIONS: 14400 // 4 hours
};

// Simple wrapper around Next.js unstable_cache
export function withCache<T>(
  fetcher: () => Promise<T>,
  keys: string[],
  ttl: number = CACHE_TTL.METADATA
): () => Promise<T> {
  return unstable_cache(fetcher, keys, {
    revalidate: ttl,
    tags: keys,
  });
}

// Memory cache fallback for environment testing without Redis
const memCache = new Map<string, { data: unknown, expiresAt: number }>();

export async function withMemoryCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number
): Promise<T> {
  const cached = memCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data as T;
  }

  const data = await fetcher();
  memCache.set(key, {
    data,
    expiresAt: Date.now() + (ttlSeconds * 1000)
  });
  return data;
}
