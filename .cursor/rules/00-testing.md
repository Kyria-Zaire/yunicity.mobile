---
description: Standards de tests Yunicity — Vitest, Supertest, Playwright
globs: ["**/*.test.ts", "**/*.spec.ts", "**/*.test.tsx", "**/tests/**"]
alwaysApply: false
---

# Tests — Standards Yunicity

## Couverture minimale obligatoire
- **Services critiques** (auth, user, payment, kyc) : **80% minimum**
- **Routes** : tests d'integration sur tous les endpoints
- **Composants UI** critiques : tests de rendu basiques
- **CI bloque le merge** si couverture < 80% sur les services critiques

## Unit Tests — Vitest

```typescript
// services/user-service/tests/unit/user.service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from '../../src/services/user.service';
import { UserRepository } from '../../src/repositories/user.repository';
import { emailQueue } from '../../src/jobs/queues';

// Mock des dépendances externes
vi.mock('../../src/repositories/user.repository');
vi.mock('../../src/jobs/queues');

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should return error if email already exists', async () => {
      // Arrange
      vi.mocked(UserRepository.findByEmail).mockResolvedValue({
        _id: '123', email: 'existing@test.com',
      } as any);

      // Act
      const result = await UserService.create({
        email: 'existing@test.com',
        password: 'ValidPassword123!',
        profileType: 'yunicitizen',
        phone: '+33612345678',
      });

      // Assert
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('EMAIL_EXISTS');
        expect(result.error.statusCode).toBe(409);
      }
    });

    it('should hash password with Argon2id before saving', async () => {
      // Arrange
      vi.mocked(UserRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(UserRepository.create).mockResolvedValue({ _id: '456', email: 'new@test.com' } as any);
      vi.mocked(emailQueue.add).mockResolvedValue(undefined as any);

      const payload = { email: 'new@test.com', password: 'ValidPassword123!', profileType: 'yunicitizen' as const, phone: '+33612345678' };

      // Act
      const result = await UserService.create(payload);

      // Assert
      expect(result.ok).toBe(true);
      // Vérifier que le password n'est pas stocké en clair
      const createCall = vi.mocked(UserRepository.create).mock.calls[0]?.[0];
      expect(createCall?.passwordHash).not.toBe(payload.password);
      expect(createCall?.passwordHash).toMatch(/^\$argon2id/); // Format Argon2id
    });

    it('should set verificationStatus to pending on creation', async () => {
      vi.mocked(UserRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(UserRepository.create).mockResolvedValue({ _id: '789' } as any);
      vi.mocked(emailQueue.add).mockResolvedValue(undefined as any);

      await UserService.create({ email: 'new@test.com', password: 'ValidPassword123!', profileType: 'commercial', phone: '+33612345678' });

      const createCall = vi.mocked(UserRepository.create).mock.calls[0]?.[0];
      expect(createCall?.verificationStatus.status).toBe('pending');
    });

    it('should enqueue verification email after creation', async () => {
      vi.mocked(UserRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(UserRepository.create).mockResolvedValue({ _id: 'abc', email: 'test@test.com' } as any);
      vi.mocked(emailQueue.add).mockResolvedValue(undefined as any);

      await UserService.create({ email: 'test@test.com', password: 'ValidPassword123!', profileType: 'yunicitizen', phone: '+33612345678' });

      expect(emailQueue.add).toHaveBeenCalledWith('send-verification', { userId: 'abc', email: 'test@test.com' });
    });
  });
});
```

## Integration Tests — Supertest + MongoDB Memory Server

```typescript
// services/user-service/tests/integration/users.route.test.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { buildApp } from '../../src/app';

describe('POST /users', () => {
  let mongod: MongoMemoryServer;
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
    await mongoose.disconnect();
    await mongod.stop();
  });

  beforeEach(async () => {
    // Nettoyer la DB entre les tests
    await mongoose.connection.db.dropDatabase();
  });

  it('should return 201 and create a yunicitizen', async () => {
    const response = await request(app.server)
      .post('/users')
      .send({
        email: 'test@yunicity.fr',
        password: 'ValidPassword123!',
        phone: '+33612345678',
        profileType: 'yunicitizen',
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      email: 'test@yunicity.fr',
      profileType: 'yunicitizen',
    });
    // Vérifier que le hash ne leake pas
    expect(response.body.passwordHash).toBeUndefined();
    expect(response.body.security).toBeUndefined();
  });

  it('should return 400 if email is invalid', async () => {
    const response = await request(app.server)
      .post('/users')
      .send({ email: 'not-an-email', password: 'ValidPassword123!', profileType: 'yunicitizen', phone: '+33612345678' });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 if password is too short (< 12 chars)', async () => {
    const response = await request(app.server)
      .post('/users')
      .send({ email: 'test@yunicity.fr', password: 'short', profileType: 'yunicitizen', phone: '+33612345678' });

    expect(response.status).toBe(400);
  });

  it('should return 409 if email already exists', async () => {
    const payload = { email: 'dup@yunicity.fr', password: 'ValidPassword123!', profileType: 'yunicitizen', phone: '+33612345678' };

    await request(app.server).post('/users').send(payload);
    const response = await request(app.server).post('/users').send(payload);

    expect(response.status).toBe(409);
    expect(response.body.code).toBe('EMAIL_EXISTS');
  });

  it('should not expose sensitive data (passwordHash, security)', async () => {
    const response = await request(app.server)
      .post('/users')
      .send({ email: 'safe@yunicity.fr', password: 'ValidPassword123!', profileType: 'yunicitizen', phone: '+33612345678' });

    expect(response.body.passwordHash).toBeUndefined();
    expect(response.body.security).toBeUndefined();
    expect(response.body['security.mfaSecret']).toBeUndefined();
  });
});
```

## Convention de nommage des tests

```typescript
// Pattern : "should [action] when [condition]"
it('should return 404 when user does not exist', ...);
it('should reject login after 10 failed attempts', ...);
it('should not expose passwordHash in response', ...);
it('should enqueue KYC review job after document upload', ...);
it('should apply rate limit after 10 auth attempts', ...);

// Toujours tester le happy path ET les cas d'erreur
describe('KYC upload', () => {
  it('should accept valid PDF document', ...);      // Happy path
  it('should reject infected files', ...);           // Sécurité
  it('should reject files > 10 MB', ...);            // Validation
  it('should reject invalid MIME types', ...);       // Validation
  it('should rate limit after 5 uploads/hour', ...); // Rate limit
});
```
