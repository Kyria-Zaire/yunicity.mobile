import { env } from '../config/env.js';

// Twilio SDK — import dynamique pour éviter crash si absent
async function getTwilio() {
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN) return null;
  const { default: twilio } = await import('twilio');
  return twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
}

export async function sendSmsOTP(params: {
  to: string; // Format E.164 : +33612345678
  code: string;
}): Promise<void> {
  const client = await getTwilio();

  if (!client || !env.TWILIO_VERIFY_SERVICE_SID) {
    console.log(`[DEV SMS] OTP pour ${params.to} — Code: ${params.code}`);
    return;
  }

  // Twilio Verify envoie automatiquement le code
  await client.verify.v2
    .services(env.TWILIO_VERIFY_SERVICE_SID)
    .verifications.create({ to: params.to, channel: 'sms' });
}

export async function verifySmsCode(params: {
  to: string;
  code: string;
}): Promise<boolean> {
  const client = await getTwilio();

  if (!client || !env.TWILIO_VERIFY_SERVICE_SID) {
    // En dev : accepter "123456" comme code de test universel
    return params.code === '123456';
  }

  const result = await client.verify.v2
    .services(env.TWILIO_VERIFY_SERVICE_SID)
    .verificationChecks.create({ to: params.to, code: params.code });

  return result.status === 'approved';
}
