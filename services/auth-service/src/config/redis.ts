import { Redis } from 'ioredis';
import { env } from './env.js';

let _redis: Redis | null = null;

export function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 100, 2000),
      lazyConnect: true,
    });

    _redis.on('error', (err) => {
      // Ne pas crasher sur erreur Redis — logger seulement
      console.error('Redis error (auth-service):', err.message);
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
