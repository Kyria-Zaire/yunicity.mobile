import { authenticator } from 'otplib';
import { getRedis } from '../config/redis.js';

// Configuration TOTP (MFA)
authenticator.options = {
  window: 1, // Tolérance ±1 période (30s)
  step: 30, // Période 30 secondes
  digits: 6, // 6 chiffres
};

// ── OTP email/SMS (code numérique 6 chiffres, TTL court) ──

export async function generateEmailOTP(userId: string): Promise<string> {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const redis = getRedis();
  // TTL 10 minutes pour l'email
  await redis.setex(`otp:email:${userId}`, 600, code);
  return code;
}

export async function verifyEmailOTP(
  userId: string,
  code: string,
): Promise<boolean> {
  const redis = getRedis();
  const stored = await redis.get(`otp:email:${userId}`);
  if (!stored || stored !== code) return false;
  // Supprimer après utilisation (one-time)
  await redis.del(`otp:email:${userId}`);
  return true;
}

export async function generateSmsOTP(userId: string): Promise<string> {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const redis = getRedis();
  // TTL 5 minutes pour le SMS
  await redis.setex(`otp:sms:${userId}`, 300, code);
  return code;
}

export async function verifySmsOTP(
  userId: string,
  code: string,
): Promise<boolean> {
  const redis = getRedis();
  const stored = await redis.get(`otp:sms:${userId}`);
  if (!stored || stored !== code) return false;
  await redis.del(`otp:sms:${userId}`);
  return true;
}

// ── TOTP (MFA via Authenticator App) ──

export function generateTOTPSecret(): string {
  return authenticator.generateSecret();
}

export function generateTOTPUri(secret: string, email: string): string {
  return authenticator.keyuri(email, 'Yunicity', secret);
}

export function verifyTOTPCode(secret: string, token: string): boolean {
  return authenticator.verify({ token, secret });
}

// ── Rate limiting OTP (anti-bruteforce) ──

export async function checkOTPRateLimit(
  identifier: string, // IP ou userId
  action: string, // 'email-otp' | 'sms-otp' | 'totp'
  maxAttempts = 5,
  windowSeconds = 900, // 15 minutes
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
