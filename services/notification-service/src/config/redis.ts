import { env } from './env.js';

// Retourner des options plain object — PAS une instance ioredis
// BullMQ crée sa propre instance en interne
export function getRedisOptions(): {
  host: string;
  port: number;
  password?: string | undefined;
  maxRetriesPerRequest: null;
} {
  const url = new URL(env.REDIS_URL.replace('redis://', 'http://'));
  return {
    host: url.hostname,
    port: Number(url.port) || 6379,
    password: url.password || undefined,
    maxRetriesPerRequest: null, // Requis par BullMQ
  };
}
