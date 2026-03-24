import { getRedis } from '../config/redis.js';

/** Aligné sur auth-service/src/auth/otp.ts — même clé Redis pour cohérence. */
export async function checkOTPRateLimit(
  identifier: string,
  action: string,
  maxAttempts = 10,
  windowSeconds = 900,
): Promise<{ allowed: boolean; remaining: number }> {
  const redis = getRedis();
  const key = `ratelimit:otp:${action}:${identifier}`;
  const current = await redis.incr(key);
  if (current === 1) {
    await redis.expire(key, windowSeconds);
  }
  return {
    allowed: current <= maxAttempts,
    remaining: Math.max(0, maxAttempts - current),
  };
}
