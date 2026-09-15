// In-memory rate limiter for single-instance scaling.
// PHASE 30 NOTE: For multi-region / Vercel Edge scaling, replace this `Map` 
// with @upstash/ratelimit and a Redis KV store.
const store = new Map<string, { count: number; timestamp: number }>();

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = store.get(key);

  if (!record) {
    store.set(key, { count: 1, timestamp: now });
    return true;
  }

  if (now - record.timestamp > windowMs) {
    store.set(key, { count: 1, timestamp: now });
    return true;
  }

  if (record.count >= limit) {
    console.warn(`[RATE LIMIT EXCEEDED] Key: ${key} | Limit: ${limit}`);
    return false;
  }

  record.count += 1;
  return true;
}
