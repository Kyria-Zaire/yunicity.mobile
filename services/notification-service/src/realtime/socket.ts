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

// Max length for room identifiers to prevent abuse
const MAX_ROOM_ID_LENGTH = 64;
const ROOM_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

function isValidRoomId(id: string): boolean {
  return (
    typeof id === 'string' &&
    id.length > 0 &&
    id.length <= MAX_ROOM_ID_LENGTH &&
    ROOM_ID_PATTERN.test(id)
  );
}

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

async function verifySessionFromCookie(
  cookie: string | undefined,
): Promise<{ userId: string } | null> {
  if (!cookie || !cookie.includes('yunicity')) return null;

  try {
    const res = await fetch(
      `${env.AUTH_SERVICE_URL}/auth/session/verify`,
      {
        method: 'GET',
        headers: { cookie },
        signal: AbortSignal.timeout(3000),
      },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { user?: { id: string } };
    return data.user?.id ? { userId: data.user.id } : null;
  } catch {
    return null;
  }
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

  // Authentication middleware — validate session cookie before allowing connection
  io.use(async (socket, next) => {
    const cookie = socket.handshake.headers.cookie;
    const session = await verifySessionFromCookie(cookie);

    if (!session) {
      next(new Error('AUTH_REQUIRED'));
      return;
    }

    socket.data.userId = session.userId;
    next();
  });

  // Rooms : une par ville, une par tribu
  io.on('connection', (socket) => {
    app.log.info({ socketId: socket.id, userId: socket.data.userId }, 'Socket connected');

    socket.on('join:city', (city: string) => {
      if (!isValidRoomId(city)) return;
      void socket.join(`city:${city.toLowerCase()}`);
    });

    socket.on('join:tribe', (tribeId: string) => {
      if (!isValidRoomId(tribeId)) return;
      void socket.join(`tribe:${tribeId}`);
    });

    socket.on('leave:tribe', (tribeId: string) => {
      if (!isValidRoomId(tribeId)) return;
      void socket.leave(`tribe:${tribeId}`);
    });

    socket.on('disconnect', () => {
      app.log.info({ socketId: socket.id }, 'Socket disconnected');
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
