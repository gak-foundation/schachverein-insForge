import { getRedis } from "@/lib/auth/redis";
import { RateLimitError } from "@/lib/errors";

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyPrefix: string;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

// WARNING: In-memory store is for development only.
// In production with multiple instances, this can lead to:
// 1. Race conditions (non-atomic increments)
// 2. Unbounded memory growth (no cleanup)
// Use Redis in production for proper rate limiting.
const inMemoryStore = new Map<string, { count: number; resetAt: number }>();

function rateLimitInMemory(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const entry = inMemoryStore.get(key);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + options.windowMs;
    inMemoryStore.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: options.maxRequests - 1, resetAt };
  }

  if (entry.count >= options.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: options.maxRequests - entry.count, resetAt: entry.resetAt };
}

async function rateLimitRedis(key: string, options: RateLimitOptions): Promise<RateLimitResult> {
  const redis = getRedis();
  if (!redis) {
    return rateLimitInMemory(key, options);
  }

  const redisKey = `ratelimit:${options.keyPrefix}:${key}`;
  const now = Date.now();
  const windowStart = now - (now % options.windowMs);
  const resetAt = windowStart + options.windowMs;

  const multi = redis.multi();
  multi.incr(redisKey);
  multi.pexpire(redisKey, options.windowMs);

  const results = await multi.exec();
  if (!results || !results[0] || !results[1]) {
    return rateLimitInMemory(key, options);
  }

  const count = results[0][1] as number;

  return {
    allowed: count <= options.maxRequests,
    remaining: Math.max(0, options.maxRequests - count),
    resetAt,
  };
}

export async function rateLimit(key: string, options: RateLimitOptions): Promise<RateLimitResult> {
  const redis = getRedis();

  // In production, require Redis for proper rate limiting
  if (process.env.NODE_ENV === "production") {
    if (!redis) {
      console.error("[RateLimit] Redis is required in production but not available");
      // Fail closed - block the request if Redis is unavailable
      return { allowed: false, remaining: 0, resetAt: Date.now() + options.windowMs };
    }
    return rateLimitRedis(key, options);
  }

  // In development, allow in-memory fallback
  if (!redis) {
    return rateLimitInMemory(key, options);
  }

  return rateLimitRedis(key, options);
}

export const RATE_LIMITS = {
  login: { windowMs: 15 * 60 * 1000, maxRequests: 5, keyPrefix: "login" },
  login_ip: { windowMs: 15 * 60 * 1000, maxRequests: 20, keyPrefix: "login-ip" },
  register: { windowMs: 60 * 60 * 1000, maxRequests: 3, keyPrefix: "register" },
  passwordReset: { windowMs: 60 * 60 * 1000, maxRequests: 3, keyPrefix: "password-reset" },
  passwordReset_ip: { windowMs: 60 * 60 * 1000, maxRequests: 10, keyPrefix: "password-reset-ip" },
  emailVerification: { windowMs: 60 * 60 * 1000, maxRequests: 5, keyPrefix: "email-verification" },
  emailVerification_ip: { windowMs: 60 * 60 * 1000, maxRequests: 15, keyPrefix: "email-verification-ip" },
  api: { windowMs: 60 * 1000, maxRequests: 100, keyPrefix: "api" },
} as const;

export async function checkRateLimit(key: string, type: keyof typeof RATE_LIMITS): Promise<void> {
  const result = await rateLimit(key, RATE_LIMITS[type]);
  if (!result.allowed) {
    throw new RateLimitError();
  }
}

// IP-based rate limiting for additional protection
export async function checkRateLimitByIP(
  ip: string,
  type: "login_ip" | "passwordReset_ip" | "emailVerification_ip"
): Promise<void> {
  const result = await rateLimit(ip, RATE_LIMITS[type]);
  if (!result.allowed) {
    throw new RateLimitError();
  }
}