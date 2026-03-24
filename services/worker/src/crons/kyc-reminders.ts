import { env } from '../config/env.js';

export async function sendKycReminders(): Promise<{
  ok: boolean;
  remindersSent: number;
  error?: string | undefined;
}> {
  try {
    // Fetch users with pending KYC older than 48h
    const response = await fetch(
      `${env.USER_SERVICE_URL}/internal/pending-kyc-users`,
      {
        method: 'GET',
        headers: {
          'x-internal-service': 'worker',
        },
        signal: AbortSignal.timeout(10000),
      },
    );

    if (!response.ok) {
      return { ok: false, remindersSent: 0, error: `HTTP ${response.status}` };
    }

    const data = (await response.json()) as {
      users: Array<{ id: string; email: string; profileType: string }>;
    };
    const users = data.users ?? [];

    let sent = 0;
    for (const user of users) {
      try {
        await fetch(`${env.NOTIFICATION_SERVICE_URL}/internal/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-internal-service': 'worker',
          },
          body: JSON.stringify({
            userId: user.id,
            type: 'kyc_reminder',
            channel: 'email',
            data: {
              email: user.email,
              profileType: user.profileType,
            },
          }),
          signal: AbortSignal.timeout(3000),
        });
        sent++;
      } catch {
        // Continue on individual failures
      }
    }

    return { ok: true, remindersSent: sent };
  } catch (err) {
    return {
      ok: false,
      remindersSent: 0,
      error: err instanceof Error ? err.message : 'unknown',
    };
  }
}
