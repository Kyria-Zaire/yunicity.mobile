import { env } from '../config/env.js';

const CITIES = ['reims', 'paris', 'lyon', 'marseille', 'toulouse'];

export async function resetWeeklyLeaderboard(): Promise<{
  ok: boolean;
  citiesReset: string[];
  errors: string[];
}> {
  const citiesReset: string[] = [];
  const errors: string[] = [];

  for (const city of CITIES) {
    try {
      const response = await fetch(
        `${env.USER_SERVICE_URL}/internal/reset-weekly-leaderboard`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-internal-service': 'worker',
          },
          body: JSON.stringify({ city }),
          signal: AbortSignal.timeout(5000),
        },
      );

      if (response.ok) {
        citiesReset.push(city);
      } else {
        errors.push(`${city}: HTTP ${response.status}`);
      }
    } catch (err) {
      errors.push(`${city}: ${err instanceof Error ? err.message : 'unknown'}`);
    }
  }

  return { ok: errors.length === 0, citiesReset, errors };
}
