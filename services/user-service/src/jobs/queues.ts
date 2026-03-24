import { Queue } from 'bullmq';
import { env } from '../config/env.js';

// BullMQ gère sa propre connexion Redis — évite le conflit de types ioredis
function getRedisOptions() {
  const url = new URL(env.REDIS_URL);
  return {
    host: url.hostname || 'localhost',
    port: Number(url.port) || 6379,
    password: url.password || undefined,
    maxRetriesPerRequest: null as null,
  };
}

// Queue pour les emails transactionnels
export const emailQueue = new Queue('emails', {
  connection: getRedisOptions(),
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
});

// Queue pour les vérifications KYC async
export const kycQueue = new Queue('kyc', {
  connection: getRedisOptions(),
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
  },
});
