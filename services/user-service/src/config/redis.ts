import { Redis } from 'ioredis';
import { env } from './env.js';

let _redis: Redis | null = null;

export function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null, // Requis par BullMQ
      retryStrategy: (times) => Math.min(times * 100, 2000),
      lazyConnect: true,
    });

    _redis.on('error', (err) => {
      console.error('Redis error (user-service):', err.message);
    });
  }
  return _redis;
}

export async function disconnectRedis(): Promise<void> {
  if (_redis) {
    await _redis.quit();
    _redis = null;
  }
}
