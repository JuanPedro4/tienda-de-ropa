import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

function getRedisUrl(): string {
  return process.env.REDIS_URL ?? "redis://localhost:6379";
}

/**
 * Redis client singleton.
 * Uses global object to survive hot-reloads in development.
 */
export const redis = globalForRedis.redis ?? new Redis(getRedisUrl(), {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    if (times > 3) return null; // give up after 3 retries
    return Math.min(times * 200, 2000);
  },
});

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

/**
 * Default cache TTL (seconds).
 * Read from env or fall back to 5 minutes.
 */
export const DEFAULT_CACHE_TTL = Number(process.env.REDIS_CACHE_TTL ?? 300);

/**
 * Cache key namespaces.
 */
export const CACHE_KEYS = {
  PRODUCTS: "cache:products",
  PRODUCT: (handle: string) => `cache:product:${handle}`,
  CATEGORIES: "cache:categories",
  CATEGORY: (slug: string) => `cache:category:${slug}`,
} as const;
