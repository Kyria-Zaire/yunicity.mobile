---
description: Patterns Fastify backend — s'applique aux services Node.js
globs: ["services/**/*.ts", "apps/api/**/*.ts"]
alwaysApply: false
---

# Backend Fastify — Patterns Yunicity

## Structure d'une route (template obligatoire)

```typescript
import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.middleware';
import { rateLimitSensitive } from '../middleware/rateLimit.middleware';
import { UserService } from '../services/user.service';
import { createUserSchema } from '@yunicity/validators';
import { auditLog } from '../utils/audit';

const usersRoute: FastifyPluginAsync = async (fastify) => {

  // GET /users/:id — endpoint protégé
  fastify.get<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: [requireAuth], // Auth obligatoire
      schema: {
        params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
        response: { 200: userResponseSchema, 404: errorSchema },
      },
    },
    async (req, reply) => {
      // Vérifier l'ownership (user ne peut voir que son profil sauf admin)
      if (req.user.id !== req.params.id && req.user.role !== 'admin') {
        return reply.status(403).send({ code: 'FORBIDDEN', message: 'Accès refusé' });
      }

      const result = await UserService.findById(req.params.id);
      if (!result.ok) {
        return reply.status(404).send({ code: 'NOT_FOUND', message: result.error.message });
      }

      return reply.send(result.data);
    }
  );

  // POST /users — création avec rate limit
  fastify.post(
    '/',
    {
      preHandler: [rateLimitSensitive], // Rate limit strict
      schema: {
        body: createUserSchema,
        response: { 201: userResponseSchema, 400: errorSchema },
      },
    },
    async (req, reply) => {
      // Validation Zod (double sécurité — Fastify valide via JSON Schema)
      const parsed = createUserSchema.safeParse(req.body);
      if (!parsed.success) {
        return reply.status(400).send({ code: 'VALIDATION_ERROR', errors: parsed.error.flatten() });
      }

      const result = await UserService.create(parsed.data);
      if (!result.ok) {
        const status = result.error.code === 'EMAIL_EXISTS' ? 409 : 400;
        return reply.status(status).send({ code: result.error.code, message: result.error.message });
      }

      // Audit log sur création
      await auditLog({ action: 'user.register', userId: result.data.id, ip: req.ip, userAgent: req.headers['user-agent'] ?? '' });

      return reply.status(201).send(result.data);
    }
  );
};

export default usersRoute;
```

## Service Layer (logique métier pure)

```typescript
// ✅ Zéro import Fastify dans les services
// ✅ Result pattern pour toutes les méthodes publiques
// ✅ Logger structuré Pino

import { logger } from '../utils/logger';
import { UserRepository } from '../repositories/user.repository';
import type { CreateUserPayload, User } from '@yunicity/types';
import type { Result } from '../types/result';
import { hashPassword } from '../utils/crypto';
import { emailQueue } from '../jobs/queues';

export class UserService {
  static async create(payload: CreateUserPayload): Promise<Result<User>> {
    // 1. Vérifier unicité email
    const existing = await UserRepository.findByEmail(payload.email);
    if (existing) {
      return { ok: false, error: new AppError('EMAIL_EXISTS', 'Email déjà utilisé', 409) };
    }

    // 2. Hasher le mot de passe (Argon2id)
    const passwordHash = await hashPassword(payload.password);

    // 3. Créer l'utilisateur
    const user = await UserRepository.create({
      ...payload,
      passwordHash,
      verificationStatus: { status: 'pending', documents: [] },
    });

    // 4. Déclencher l'email de vérification (async — BullMQ)
    await emailQueue.add('send-verification', { userId: user.id, email: user.email });

    logger.info({ userId: user.id, profileType: user.profileType }, 'User created');

    return { ok: true, data: user };
  }
}
```

## Repository Layer (accès DB uniquement)

```typescript
// ✅ Mongoose uniquement — zéro logique métier
// ✅ Projection explicite sur les champs sensibles
// ✅ lean() pour les lectures (performances)

export class UserRepository {
  static async findById(id: string): Promise<User | null> {
    return UserModel
      .findById(id)
      .select('-passwordHash -security.mfaSecret -security.backupCodes')
      .lean<User>();
  }

  static async findByEmail(email: string): Promise<User | null> {
    return UserModel
      .findOne({ email: email.toLowerCase(), deletedAt: null })
      .lean<User>();
  }

  static async create(data: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const user = await UserModel.create(data);
    return user.toObject();
  }

  // Soft delete — jamais de suppression physique immédiate
  static async softDelete(id: string): Promise<void> {
    await UserModel.findByIdAndUpdate(id, {
      deletedAt: new Date(),
      isActive: false,
    });
  }
}
```

## App Factory (app.ts)

```typescript
import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { env } from './config/env';
import { redisClient } from './config/redis';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'warn' : 'debug',
      redact: ['req.headers.authorization', 'req.body.password', 'req.body.token'],
    },
  });

  // Sécurité
  await app.register(helmet, { /* config CSP dans security.mdc */ });
  await app.register(cors, { origin: [env.WEB_URL], credentials: true });
  await app.register(rateLimit, { redis: redisClient, max: 100, timeWindow: '1 minute' });

  // Health check (pour Docker/K8s)
  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  // Error handler global
  app.setErrorHandler((error, req, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({ code: error.code, message: error.message });
    }
    req.log.error({ err: error }, 'Unhandled error');
    return reply.status(500).send({ code: 'INTERNAL_ERROR', message: 'Service unavailable' });
  });

  // Routes
  await app.register(usersRoute, { prefix: '/users' });

  return app;
}
```

## Graceful Shutdown (index.ts)

```typescript
const app = await buildApp();

const start = async () => {
  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown — critique pour Docker/K8s
const shutdown = async (signal: string) => {
  app.log.info({ signal }, 'Shutting down gracefully');
  await app.close();
  await mongoose.disconnect();
  await redisClient.quit();
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start();
```
