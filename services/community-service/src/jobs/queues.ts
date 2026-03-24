import { Queue } from 'bullmq';
import { getRedisOptions } from '../config/redis.js';

export const moderationQueue = new Queue('moderation', {
  connection: getRedisOptions(),
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 3000 },
    removeOnComplete: { count: 200 },
    removeOnFail: { count: 100 },
  },
});
