process.env['NODE_ENV'] = 'test';
process.env['REDIS_URL'] = 'redis://localhost:6379';
process.env['USER_SERVICE_URL'] = 'http://localhost:3002';
process.env['NOTIFICATION_SERVICE_URL'] = 'http://localhost:3006';
process.env['ADMIN_API_KEY'] = 'test_admin_key_yunicity';

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resetWeeklyLeaderboard } from '../crons/weekly-leaderboard.js';
import { sendKycReminders } from '../crons/kyc-reminders.js';
import { startScheduler, stopScheduler, cronJobs } from '../scheduler.js';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Worker Crons', () => {
  it('resetWeeklyLeaderboard appelle user-service pour chaque ville', async () => {
    mockFetch.mockResolvedValue({ ok: true });

    const result = await resetWeeklyLeaderboard();

    expect(result.ok).toBe(true);
    expect(result.citiesReset.length).toBeGreaterThan(0);
    expect(result.citiesReset).toContain('reims');
    expect(mockFetch).toHaveBeenCalledTimes(5);

    const firstCall = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(firstCall[0]).toContain('/internal/reset-weekly-leaderboard');
    expect(firstCall[1].headers).toHaveProperty('x-internal-service', 'worker');
  });

  it('resetWeeklyLeaderboard gere les erreurs par ville', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true })
      .mockRejectedValueOnce(new Error('timeout'))
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: false, status: 500 })
      .mockResolvedValueOnce({ ok: true });

    const result = await resetWeeklyLeaderboard();

    expect(result.ok).toBe(false);
    expect(result.citiesReset.length).toBe(3);
    expect(result.errors.length).toBe(2);
  });

  it('sendKycReminders envoie des notifications pour les users en attente', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          users: [
            { id: 'u1', email: 'a@test.fr', profileType: 'commercial' },
            { id: 'u2', email: 'b@test.fr', profileType: 'association' },
          ],
        }),
      })
      .mockResolvedValue({ ok: true });

    const result = await sendKycReminders();

    expect(result.ok).toBe(true);
    expect(result.remindersSent).toBe(2);
    // 1 fetch for users list + 2 for notifications
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it('scheduler demarre et arrete les crons correctement', () => {
    const logger = {
      info: vi.fn(),
      error: vi.fn(),
    };

    startScheduler(logger);

    for (const job of cronJobs) {
      expect(job.timer).toBeDefined();
    }

    stopScheduler();

    for (const job of cronJobs) {
      expect(job.timer).toBeUndefined();
    }
  });
});
