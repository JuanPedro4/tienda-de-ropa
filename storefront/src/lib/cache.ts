import { redis, DEFAULT_CACHE_TTL } from "./redis";

/**
 * Get a cached value. Returns `null` on cache miss.
 */
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const raw = await redis.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Set a cached value with TTL.
 */
export async function setCached<T>(
  key: string,
  value: T,
  ttl: number = DEFAULT_CACHE_TTL,
): Promise<void> {
  try {
    const serialized = JSON.stringify(value);
    await redis.setex(key, ttl, serialized);
  } catch {
    // Cache write failure is non-fatal
  }
}

/**
 * Invalidate a single cache key.
 */
export async function invalidateCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch {
    // Cache invalidation failure is non-fatal
  }
}

/**
 * Invalidate multiple cache keys by pattern.
 * Example: invalidatePattern("cache:products:*")
 */
export async function invalidatePattern(pattern: string): Promise<void> {
  try {
    const stream = redis.scanStream({ match: pattern, count: 100 });
    for await (const keys of stream) {
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    }
  } catch {
    // Cache invalidation failure is non-fatal
  }
}

/**
 * Cache-aside pattern: try cache first, fall back to fetcher,
 * then store in cache and return.
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = DEFAULT_CACHE_TTL,
): Promise<T> {
  const cached = await getCached<T>(key);
  if (cached !== null) return cached;

  const fresh = await fetcher();
  await setCached(key, fresh, ttl);
  return fresh;
}
