/**
 * Lightweight in-memory rate limiter.
 *
 * Works well for single-process deployments. On Vercel, each serverless function
 * instance has its own memory, so limits are per-instance. This still provides
 * meaningful protection against simple brute-force bursts.
 *
 * For strict, distributed rate limiting upgrade to @upstash/ratelimit + Upstash Redis.
 */

interface RateLimitEntry {
  count: number;
  firstRequest: number;
  resetAt: number;
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();

  // Purge stale entries every 5 minutes to prevent memory leaks
  constructor() {
    if (typeof globalThis !== "undefined") {
      setInterval(() => this.purge(), 5 * 60 * 1000).unref?.();
    }
  }

  /**
   * @param key        Unique key (e.g. "login:1.2.3.4")
   * @param limit      Max requests allowed in the window
   * @param windowMs   Time window in milliseconds
   */
  check(
    key: string,
    limit: number,
    windowMs: number
  ): { allowed: boolean; remaining: number; retryAfterSeconds?: number } {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetAt) {
      // New window
      this.store.set(key, { count: 1, firstRequest: now, resetAt: now + windowMs });
      return { allowed: true, remaining: limit - 1 };
    }

    if (entry.count >= limit) {
      const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
      return { allowed: false, remaining: 0, retryAfterSeconds };
    }

    entry.count++;
    return { allowed: true, remaining: limit - entry.count };
  }

  reset(key: string): void {
    this.store.delete(key);
  }

  private purge(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.resetAt) this.store.delete(key);
    }
  }
}

// Singleton — shared across requests in the same process/instance
export const rateLimiter = new RateLimiter();
