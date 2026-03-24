import { env } from './env.js';

export function getRedisOptions() {
  const url = new URL(env.REDIS_URL.replace(/^redis:\/\//, 'http://'));
  return {
    host: url.hostname || 'localhost',
    port: Number(url.port) || 6379,
    password: url.password || undefined,
    maxRetriesPerRequest: null as null,
  };
}
