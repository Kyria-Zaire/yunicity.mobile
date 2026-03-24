---
description: Standards TypeScript stricts pour Yunicity
globs: ["**/*.ts", "**/*.tsx"]
alwaysApply: false
---

# TypeScript — Standards Yunicity

## Configuration (tsconfig.json obligatoire)
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true,
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  }
}
```

## Règles absolues

### ❌ INTERDIT
```typescript
// any — jamais
const user: any = {};
function process(data: any) {}

// @ts-ignore / @ts-nocheck — jamais
// @ts-ignore
const x = badType;

// Type assertion non sécurisé
const user = data as User; // Préférer un parse Zod

// Non-null assertion sans raison
const name = user!.name; // Seulement si VRAIMENT impossible d'être null
```

### ✅ OBLIGATOIRE

```typescript
// Types explicites sur les fonctions publiques
async function createUser(payload: CreateUserPayload): Promise<Result<User, UserError>> {}

// Unknown pour les données externes
function parseWebhook(body: unknown): StripeEvent {
  return stripeEventSchema.parse(body); // Zod valide et type
}

// Discriminated unions pour les états
type VerificationStatus =
  | { status: 'pending' }
  | { status: 'under_review'; submittedAt: Date }
  | { status: 'verified'; verifiedAt: Date; verifiedBy: string }
  | { status: 'rejected'; rejectedAt: Date; reason: string };

// Result pattern pour les erreurs métier
type Result<T, E = AppError> =
  | { ok: true; data: T }
  | { ok: false; error: E };

// Const assertions pour les enums
const PROFILE_TYPES = ['yunicitizen', 'commercial', 'association', 'freelance', 'ecole'] as const;
type ProfileType = typeof PROFILE_TYPES[number];
```

## Validation avec Zod (obligatoire sur tout input externe)
```typescript
import { z } from 'zod';

// Schema = source de vérité
const createUserSchema = z.object({
  email: z.string().email().max(255).toLowerCase(),
  phone: z.string().regex(/^\+[1-9]\d{7,14}$/, 'Format E.164 requis'),
  profileType: z.enum(PROFILE_TYPES),
  password: z.string().min(12).max(128),
});

// Type inféré depuis le schema — pas de duplication
type CreateUserPayload = z.infer<typeof createUserSchema>;

// Parse sécurisé
const result = createUserSchema.safeParse(req.body);
if (!result.success) {
  return reply.status(400).send({
    code: 'VALIDATION_ERROR',
    errors: result.error.flatten(),
  });
}
// result.data est maintenant typé ✅
```

## Gestion des erreurs typée
```typescript
// Classe d'erreur métier
class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 400,
    public readonly meta?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Erreurs spécifiques
class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super('NOT_FOUND', `${resource} ${id} not found`, 404);
  }
}

class UnauthorizedError extends AppError {
  constructor(reason = 'Authentication required') {
    super('UNAUTHORIZED', reason, 401);
  }
}

// Pas de try/catch vide
try {
  await riskyOperation();
} catch (err) {
  // Toujours logger et re-throw ou gérer
  logger.error({ err }, 'Operation failed');
  throw new AppError('OPERATION_FAILED', 'Service unavailable', 503);
}
```

## Imports — ordre et organisation
```typescript
// 1. Node built-ins
import { randomBytes } from 'crypto';

// 2. Packages externes
import { z } from 'zod';
import mongoose from 'mongoose';

// 3. Packages internes (@yunicity/*)
import { type ProfileType } from '@yunicity/types';
import { createUserSchema } from '@yunicity/validators';

// 4. Imports locaux (relatifs)
import { UserRepository } from '../repositories/user.repository';
import { hashPassword } from '../utils/crypto';

// Pas de barrel imports circulaires
```
