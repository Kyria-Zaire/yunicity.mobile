import { resetWeeklyLeaderboard } from './crons/weekly-leaderboard.js';
import { sendWeeklyDigest } from './crons/weekly-digest.js';
import { sendKycReminders } from './crons/kyc-reminders.js';

interface CronJob {
  name: string;
  intervalMs: number;
  handler: () => Promise<unknown>;
  timer?: ReturnType<typeof setInterval> | undefined;
}

const ONE_HOUR = 60 * 60 * 1000;
const ONE_DAY = 24 * ONE_HOUR;
const ONE_WEEK = 7 * ONE_DAY;

const jobs: CronJob[] = [
  {
    name: 'weekly-leaderboard-reset',
    intervalMs: ONE_WEEK,
    handler: resetWeeklyLeaderboard,
  },
  {
    name: 'weekly-digest',
    intervalMs: ONE_WEEK,
    handler: sendWeeklyDigest,
  },
  {
    name: 'kyc-reminders',
    intervalMs: ONE_DAY,
    handler: sendKycReminders,
  },
];

export function startScheduler(logger: { info: (obj: unknown, msg: string) => void; error: (obj: unknown, msg: string) => void }): void {
  for (const job of jobs) {
    logger.info({ job: job.name, intervalMs: job.intervalMs }, `Scheduling cron: ${job.name}`);

    const run = async () => {
      try {
        const result = await job.handler();
        logger.info({ job: job.name, result }, `Cron completed: ${job.name}`);
      } catch (err) {
        logger.error({ job: job.name, err }, `Cron failed: ${job.name}`);
      }
    };

    job.timer = setInterval(() => void run(), job.intervalMs);
  }
}

export function stopScheduler(): void {
  for (const job of jobs) {
    if (job.timer) {
      clearInterval(job.timer);
      job.timer = undefined;
    }
  }
}

export { jobs as cronJobs };
