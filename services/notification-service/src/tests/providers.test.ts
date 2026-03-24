process.env['NODE_ENV'] = 'test';

import { describe, it, expect } from 'vitest';
import { sendVerificationEmail } from '../providers/email.provider.js';
import { verifySmsCode } from '../providers/sms.provider.js';

describe('Email provider', () => {
  it('simulation en dev sans RESEND_API_KEY (pas de crash)', async () => {
    delete process.env['RESEND_API_KEY'];
    await expect(
      sendVerificationEmail({
        to: 'test@yunicity.fr',
        code: '123456',
        profileType: 'yunicitizen',
      }),
    ).resolves.not.toThrow();
  });
});

describe('SMS provider', () => {
  it('verifySmsCode accepte 123456 en dev (pas de Twilio)', async () => {
    const result = await verifySmsCode({
      to: '+33612345678',
      code: '123456',
    });
    expect(result).toBe(true);
  });

  it('verifySmsCode refuse un mauvais code en dev', async () => {
    const result = await verifySmsCode({
      to: '+33612345678',
      code: '000000',
    });
    expect(result).toBe(false);
  });
});
