// Forcer env AVANT les imports
process.env['NODE_ENV'] = 'test';
process.env['AUTH_SECRET'] = 'test_secret_min_32_chars_yunicity_ok';
process.env['DATABASE_URL'] = 'postgresql://yunicity:changeme_local@localhost:5432/yunicity_test';
process.env['REDIS_URL'] = 'redis://localhost:6379';
process.env['CORS_ORIGINS'] = 'http://localhost:3010';

import { describe, it, expect } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
} from '../auth/password.js';

describe('Auth — Password (Argon2id)', () => {
  it('hash different du password en clair', async () => {
    const hash = await hashPassword('ValidPassword123!');
    expect(hash).not.toBe('ValidPassword123!');
    expect(hash).toMatch(/^\$argon2id/);
  });

  it('verify retourne true pour le bon password', async () => {
    const hash = await hashPassword('ValidPassword123!');
    expect(await verifyPassword(hash, 'ValidPassword123!')).toBe(true);
  });

  it('verify retourne false pour un mauvais password', async () => {
    const hash = await hashPassword('ValidPassword123!');
    expect(await verifyPassword(hash, 'WrongPassword!')).toBe(false);
  });

  it('validatePasswordStrength — password trop court', () => {
    const result = validatePasswordStrength('short');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Minimum 12 caractères');
  });

  it('validatePasswordStrength — password valide', () => {
    const result = validatePasswordStrength('ValidPassword123!');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

describe('Auth — OTP (nécessite Redis)', () => {
  // Ces tests sont skippés si Redis n'est pas disponible
  it.skip('generateEmailOTP retourne un code 6 chiffres', async () => {
    const { generateEmailOTP } = await import('../auth/otp.js');
    const code = await generateEmailOTP('user-123');
    expect(code).toMatch(/^\d{6}$/);
  });

  it.skip('verifyEmailOTP valide le bon code', async () => {
    const { generateEmailOTP, verifyEmailOTP } = await import(
      '../auth/otp.js'
    );
    const code = await generateEmailOTP('user-456');
    expect(await verifyEmailOTP('user-456', code)).toBe(true);
  });

  it.skip('verifyEmailOTP refuse un mauvais code', async () => {
    const { generateEmailOTP, verifyEmailOTP } = await import(
      '../auth/otp.js'
    );
    await generateEmailOTP('user-789');
    expect(await verifyEmailOTP('user-789', '000000')).toBe(false);
  });
});
