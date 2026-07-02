import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

import { getRateLimitEnv } from "@/lib/env";

/**
 * Upstash Redis-backed rate limiting. Distributed and persistent, so limits
 * hold across serverless instances and deploys (unlike an in-memory store).
 *
 * The Redis client and the per-config Ratelimit instances are created lazily
 * and cached, so we only touch env/network when a limit is actually checked.
 */

let redis: Redis | undefined;

function getRedis(): Redis {
  if (!redis) {
    const env = getRateLimitEnv();
    redis = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redis;
}

// Cache one Ratelimit per (limit, window) config. Different configs get
// different instances; identifiers keep separate actions/scopes isolated.
const limiters = new Map<string, Ratelimit>();

function getLimiter(limit: number, windowSeconds: number): Ratelimit {
  const key = `${limit}:${windowSeconds}`;
  let limiter = limiters.get(key);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
      prefix: "rl",
      analytics: false,
    });
    limiters.set(key, limiter);
  }
  return limiter;
}

/**
 * Best-effort client IP from proxy headers. Falls back to "unknown" (e.g. local
 * dev), which means local requests share one bucket -- fine for testing.
 */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  return h.get("x-real-ip") ?? "unknown";
}

/**
 * Applies a per-IP and (optionally) per-account limit for an auth action.
 * Returns false if EITHER limit is exceeded. Callers should return a single
 * generic "too many attempts" message -- never reveal which limit tripped, to
 * avoid leaking whether an account exists.
 */
export async function checkAuthRateLimit(opts: {
  action: string;
  account?: string;
  ipLimit: number;
  ipWindowMs: number;
  accountLimit?: number;
  accountWindowMs?: number;
}): Promise<boolean> {
  const ip = await getClientIp();

  const ipLimiter = getLimiter(
    opts.ipLimit,
    Math.round(opts.ipWindowMs / 1000),
  );
  const ipResult = await ipLimiter.limit(`${opts.action}:ip:${ip}`);
  if (!ipResult.success) {
    return false;
  }

  if (opts.account && opts.accountLimit && opts.accountWindowMs) {
    const accountLimiter = getLimiter(
      opts.accountLimit,
      Math.round(opts.accountWindowMs / 1000),
    );
    const accountResult = await accountLimiter.limit(
      `${opts.action}:account:${opts.account.toLowerCase()}`,
    );
    if (!accountResult.success) {
      return false;
    }
  }

  return true;
}
