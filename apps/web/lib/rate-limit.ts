import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Check env vars
if (
  !process.env.UPSTASH_REDIS_REST_URL ||
  !process.env.UPSTASH_REDIS_REST_TOKEN
) {
  console.warn(
    "[RATE LIMIT] Upstash credentials missing. Rate limiting disabled."
  );
}

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

/**
 * Strict rate limit: 30 requests per minute per IP.
 * For expensive endpoints (reality-check, market, rents).
 */
export const strictLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "1 m"),
      analytics: true,
      prefix: "ratelimit:strict",
    })
  : null;

/**
 * Standard rate limit: 100 requests per minute per IP.
 * For general endpoints (areas list, health).
 */
export const standardLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, "1 m"),
      analytics: true,
      prefix: "ratelimit:standard",
    })
  : null;

/**
 * Get client IP from request headers.
 * Vercel populates x-forwarded-for.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "anonymous";
}

/**
 * Check rate limit. Returns { success, limit, remaining, reset }.
 * If Upstash is not configured, always returns success (fails open).
 */
export async function checkRateLimit(
  request: Request,
  type: "strict" | "standard" = "standard"
) {
  const limiter = type === "strict" ? strictLimiter : standardLimiter;

  if (!limiter) {
    return { success: true, limit: 0, remaining: 0, reset: 0 };
  }

  const ip = getClientIp(request);
  const result = await limiter.limit(ip);
  return result;
}
