import { Worker } from 'bullmq';
import { getRedisOptions } from '../config/redis.js';
import {
  sendVerificationEmail,
  sendWelcomeEmail,
} from '../providers/email.provider.js';

export function startEmailWorker(): Worker {
  const worker = new Worker(
    'emails',
    async (job) => {
      switch (job.name) {
        case 'send-verification-email':
          await sendVerificationEmail({
            to: job.data.email as string,
            code: job.data.code as string,
            profileType: job.data.profileType as string,
          });
          break;

        case 'send-welcome-email':
          await sendWelcomeEmail({
            to: job.data.email as string,
            displayName: job.data.displayName as string,
            profileType: job.data.profileType as string,
          });
          break;

        default:
          console.warn(`Email worker: job inconnu "${job.name}"`);
      }
    },
    {
      connection: getRedisOptions(),
      concurrency: 5,
    },
  );

  worker.on('completed', (job) =>
    console.log(`✅ Email job "${job.name}" [${job.id}] terminé`),
  );
  worker.on('failed', (job, err) =>
    console.error(
      `❌ Email job "${job?.name}" [${job?.id}] échoué:`,
      err.message,
    ),
  );

  return worker;
}
