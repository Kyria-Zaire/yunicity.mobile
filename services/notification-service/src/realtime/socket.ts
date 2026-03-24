import { Server as SocketServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';
import type { FastifyInstance } from 'fastify';
import { env } from '../config/env.js';

export type YunicityEvent =
  | 'new_post'
  | 'new_member'
  | 'new_event'
  | 'profile_verified'
  | 'new_reaction';

let _io: SocketServer | null = null;

function parseRedisUrl(url: string): {
  host: string;
  port: number;
  password?: string | undefined;
} {
  const parsed = new URL(url.replace(/^redis:\/\//, 'http://'));
  return {
    host: parsed.hostname || 'localhost',
    port: Number(parsed.port) || 6379,
    password: parsed.password || undefined,
  };
}

export function initSocketServer(app: FastifyInstance): SocketServer {
  const io = new SocketServer(app.server, {
    cors: {
      origin: (env.CORS_ORIGINS ?? 'http://localhost:3010')
        .split(',')
        .map((o) => o.trim()),
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Adapter Redis pour le scaling horizontal
  const redisOpts = parseRedisUrl(env.REDIS_URL);
  const pubClient = new Redis(redisOpts);
  const subClient = pubClient.duplicate();

  io.adapter(createAdapter(pubClient, subClient));

  // Rooms : une par ville, une par tribu
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('join:city', (city: string) => {
      void socket.join(`city:${city.toLowerCase()}`);
    });

    socket.on('join:tribe', (tribeId: string) => {
      void socket.join(`tribe:${tribeId}`);
    });

    socket.on('leave:tribe', (tribeId: string) => {
      void socket.leave(`tribe:${tribeId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  _io = io;
  return io;
}

export function emitToCity(
  city: string,
  event: YunicityEvent,
  data: Record<string, unknown>,
): void {
  if (!_io) return;
  _io.to(`city:${city.toLowerCase()}`).emit(event, data);
}

export function emitToTribe(
  tribeId: string,
  event: YunicityEvent,
  data: Record<string, unknown>,
): void {
  if (!_io) return;
  _io.to(`tribe:${tribeId}`).emit(event, data);
}
