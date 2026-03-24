import { Resend } from 'resend';
import { env } from '../config/env.js';

let _resend: Resend | null = null;

function getResend(): Resend | null {
  if (!env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(env.RESEND_API_KEY);
  return _resend;
}

export async function sendVerificationEmail(params: {
  to: string;
  code: string;
  profileType: string;
}): Promise<void> {
  const client = getResend();

  if (!client) {
    // Mode dev sans clé API → simulation
    console.log(
      `[DEV EMAIL] Vérification pour ${params.to} (${params.profileType}) — Code: ${params.code}`,
    );
    return;
  }

  await client.emails.send({
    from: `Yunicity <${env.EMAIL_FROM}>`,
    to: params.to,
    subject: 'Votre code de vérification Yunicity',
    html: `
      <div style="font-family:'DM Sans',Arial,sans-serif;max-width:480px;margin:0 auto;padding:40px 24px;background:#fff;">
        <p style="font-family:'Syne',Arial,sans-serif;font-size:22px;font-weight:800;color:#2A2FFF;margin:0 0 24px;">Yunicity</p>
        <h1 style="font-family:'Syne',Arial,sans-serif;font-size:26px;font-weight:700;color:#0D0F2E;margin:0 0 12px;">
          Vérifiez votre email
        </h1>
        <p style="color:#6B7280;font-size:15px;line-height:1.6;margin:0 0 28px;">
          Ce code expire dans <strong>10 minutes</strong>.
        </p>
        <div style="background:#E8E9FF;border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
          <span style="font-family:'JetBrains Mono',monospace;font-size:36px;font-weight:700;color:#2A2FFF;letter-spacing:8px;">
            ${params.code}
          </span>
        </div>
        <p style="color:#D1D5DB;font-size:12px;">
          Si vous n'avez pas demandé ce code, ignorez cet email.
        </p>
      </div>
    `,
  });
}

export async function sendWelcomeEmail(params: {
  to: string;
  displayName: string;
  profileType: string;
}): Promise<void> {
  const client = getResend();
  if (!client) {
    console.log(
      `[DEV EMAIL] Bienvenue ${params.displayName} (${params.profileType}) → ${params.to}`,
    );
    return;
  }
  await client.emails.send({
    from: `Yunicity <${env.EMAIL_FROM}>`,
    to: params.to,
    subject: 'Bienvenue sur Yunicity',
    html: `<p>Bienvenue ${params.displayName} ! Votre compte Yunicity est en cours de vérification.</p>`,
  });
}
