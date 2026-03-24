import { env } from '../config/env.js';

export async function sendWeeklyDigest(): Promise<{
  ok: boolean;
  usersNotified: number;
  error?: string | undefined;
}> {
  try {
    const response = await fetch(
      `${env.USER_SERVICE_URL}/internal/weekly-digest-users`,
      {
        method: 'GET',
        headers: {
          'x-internal-service': 'worker',
        },
        signal: AbortSignal.timeout(10000),
      },
    );

    if (!response.ok) {
      return { ok: false, usersNotified: 0, error: `HTTP ${response.status}` };
    }

    const data = (await response.json()) as { users: Array<{ id: string; email: string }> };
    const users = data.users ?? [];

    // Enqueue notification jobs for each user
    let notified = 0;
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
            type: 'weekly_digest',
            channel: 'email',
            data: { email: user.email },
          }),
          signal: AbortSignal.timeout(3000),
        });
        notified++;
      } catch {
        // Continue on individual failures
      }
    }

    return { ok: true, usersNotified: notified };
  } catch (err) {
    return {
      ok: false,
      usersNotified: 0,
      error: err instanceof Error ? err.message : 'unknown',
    };
  }
}
