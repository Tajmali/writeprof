/**
 * Distributed rate limiter using Upstash Redis when configured,
 * falling back to in-memory for local development.
 *
 * To enable distributed rate limiting (required for Vercel serverless):
 * 1. Create a free Redis database at https://console.upstash.com
 * 2. Add to Vercel env vars:
 *    UPSTASH_REDIS_REST_URL=https://...
 *    UPSTASH_REDIS_REST_TOKEN=...
 */

// ─── In-memory fallback (dev / no Upstash configured) ───────────────────────

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class InMemoryRateLimiter {
  private store = new Map<string, RateLimitEntry>();

  constructor() {
    if (typeof globalThis !== "undefined") {
      setInterval(() => this.purge(), 5 * 60 * 1000).unref?.();
    }
  }

  check(
    key: string,
    limit: number,
    windowMs: number
  ): { allowed: boolean; remaining: number; retryAfterSeconds?: number } {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetAt) {
      this.store.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true, remaining: limit - 1 };
    }

    if (entry.count >= limit) {
      return { allowed: false, remaining: 0, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) };
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

// ─── Upstash distributed rate limiter ───────────────────────────────────────

let upstashLimiter: any = null;

function getUpstashLimiter() {
  if (upstashLimiter) return upstashLimiter;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  try {
    const { Redis } = require("@upstash/redis");
    const { Ratelimit } = require("@upstash/ratelimit");
    const redis = new Redis({ url, token });
    // Create limiters for different windows — keyed by "limit:windowSec"
    upstashLimiter = { redis, Ratelimit };
    return upstashLimiter;
  } catch {
    return null;
  }
}

// ─── Unified interface ───────────────────────────────────────────────────────

const inMemory = new InMemoryRateLimiter();

export const rateLimiter = {
  /**
   * Check rate limit for a key.
   * Uses Upstash Redis if UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set,
   * otherwise falls back to in-memory (development only).
   */
  async checkAsync(
    key: string,
    limit: number,
    windowMs: number
  ): Promise<{ allowed: boolean; remaining: number; retryAfterSeconds?: number }> {
    const upstash = getUpstashLimiter();
    if (upstash) {
      try {
        const { Ratelimit, redis } = upstash;
        const windowSec = Math.ceil(windowMs / 1000);
        const rl = new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
          prefix: "wp_rl",
        });
        const result = await rl.limit(key);
        return {
          allowed: result.success,
          remaining: result.remaining,
          retryAfterSeconds: result.success ? undefined : Math.ceil((result.reset - Date.now()) / 1000),
        };
      } catch {
        // Redis error — fall through to in-memory
      }
    }
    return inMemory.check(key, limit, windowMs);
  },

  /**
   * Synchronous check — uses in-memory only.
   * Kept for backwards compatibility with existing callers.
   * Prefer checkAsync() for new code.
   */
  check(
    key: string,
    limit: number,
    windowMs: number
  ): { allowed: boolean; remaining: number; retryAfterSeconds?: number } {
    return inMemory.check(key, limit, windowMs);
  },

  reset(key: string): void {
    inMemory.reset(key);
  },
};
