import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

function isValidUpstashUrl(url: string | undefined): url is string {
  if (!url) return false;
  if (!url.startsWith("https://")) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function isValidUpstashToken(token: string | undefined): token is string {
  if (!token) return false;
  if (token.length < 20) return false;
  return true;
}

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

const hasValidCredentials =
  isValidUpstashUrl(url) && isValidUpstashToken(token);

if (!hasValidCredentials) {
  console.warn(
    "[RATE LIMIT] Upstash credentials missing or invalid. Rate limiting disabled."
  );
}

const redis = hasValidCredentials
  ? new Redis({
      url,
      token,
    })
  : null;

export const strictLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "1 m"),
      analytics: true,
      prefix: "ratelimit:strict",
    })
  : null;

export const standardLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, "1 m"),
      analytics: true,
      prefix: "ratelimit:standard",
    })
  : null;

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "anonymous";
}

export async function checkRateLimit(
  request: Request,
  type: "strict" | "standard" = "standard"
) {
  const limiter = type === "strict" ? strictLimiter : standardLimiter;

  if (!limiter) {
    return { success: true, limit: 0, remaining: 0, reset: 0 };
  }

  try {
    const ip = getClientIp(request);
    const result = await limiter.limit(ip);
    return result;
  } catch (e) {
    console.error("[RATE LIMIT] Check failed:", e);
    return { success: true, limit: 0, remaining: 0, reset: 0 };
  }
}
