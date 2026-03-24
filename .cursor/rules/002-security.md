---
description: Règles de sécurité obligatoires — cybersécurité Yunicity
globs: ["**/*.ts", "**/*.tsx", "**/*.js"]
alwaysApply: false
---

# Sécurité Yunicity — Règles Obligatoires

> Yunicity traite des données personnelles sensibles (SIRET, RNA, géolocalisation, documents officiels).
> Toute faille = perte de confiance = fermeture. Chaque règle est non négociable.

## 🔐 Authentification

```typescript
// ✅ Argon2id OBLIGATOIRE — bcrypt INTERDIT
import argon2 from 'argon2';

const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 65536, // 64 MB
  timeCost: 3,
  parallelism: 4,
};

async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, ARGON2_OPTIONS);
}

async function verifyPassword(hash: string, password: string): Promise<boolean> {
  return argon2.verify(hash, password, ARGON2_OPTIONS);
}

// ✅ JWT en httpOnly cookie UNIQUEMENT
reply.setCookie('session', token, {
  httpOnly: true,      // Inaccessible au JS
  secure: true,        // HTTPS uniquement
  sameSite: 'strict',  // Protection CSRF
  path: '/',
  maxAge: 15 * 60,     // 15 minutes — access token
});

// ❌ JAMAIS de JWT dans localStorage / sessionStorage
localStorage.setItem('token', jwt); // INTERDIT — XSS trivial
```

## 🛡️ Validation des inputs — Zero Trust

```typescript
// ✅ Valider TOUT ce qui vient de l'extérieur
// Body, query params, path params, headers, webhooks

// Mongoose — jamais d'injection NoSQL
// ✅ OK — Mongoose échappe les strings
const user = await User.findOne({ email: body.email });

// ❌ JAMAIS — injection possible
const user = await User.findOne(JSON.parse(req.body)); // INTERDIT
const filter = req.query; // INTERDIT sans validation Zod

// ✅ Limite toujours les résultats
const users = await User.find(filter).limit(50).lean(); // Pas de .find({}) nu

// ✅ Projection explicite — jamais exposer les champs sensibles
const user = await User.findById(id)
  .select('-passwordHash -security.mfaSecret -security.backupCodes')
  .lean();
```

## 🔑 Secrets & Configuration

```typescript
// ✅ Validation des env vars au démarrage avec Zod
// src/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  MONGODB_URI: z.string().url(),
  REDIS_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  TWILIO_AUTH_TOKEN: z.string().min(32),
  // ...
});

export const env = envSchema.parse(process.env);
// Utiliser env.MONGODB_URI partout — jamais process.env.MONGODB_URI direct

// ❌ JAMAIS dans le code
const secret = 'sk_live_xxxxx'; // INTERDIT
const mongoUri = 'mongodb+srv://user:pass@cluster...'; // INTERDIT
```

## 🚦 Rate Limiting

```typescript
// ✅ Rate limiting Redis (sliding window) sur TOUS les endpoints sensibles
import { FastifyRateLimit } from '@fastify/rate-limit';

// Auth endpoints — très strict
const authRateLimit = {
  max: 10,          // 10 tentatives
  timeWindow: '15 minutes',
  redis: redisClient,
  keyGenerator: (req) => req.ip, // Par IP
  errorResponseBuilder: () => ({
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Trop de tentatives. Réessayez dans 15 minutes.',
    retryAfter: 900,
  }),
};

// Upload KYC — limite stricte
const uploadRateLimit = {
  max: 5,
  timeWindow: '1 hour',
  keyGenerator: (req) => req.user?.id ?? req.ip,
};

// API publique — plus souple mais présent
const publicRateLimit = {
  max: 100,
  timeWindow: '1 minute',
};
```

## 📁 Fichiers & Uploads

```typescript
// ✅ Workflow obligatoire pour TOUT upload
async function handleFileUpload(file: MultipartFile): Promise<string> {
  // 1. Valider le type MIME côté serveur (pas seulement l'extension)
  const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new AppError('INVALID_FILE_TYPE', 'Type de fichier non autorisé', 400);
  }

  // 2. Valider la taille (10 MB max pour KYC)
  const MAX_SIZE = 10 * 1024 * 1024;
  if (file.file.bytesRead > MAX_SIZE) {
    throw new AppError('FILE_TOO_LARGE', 'Fichier trop volumineux (max 10 MB)', 400);
  }

  // 3. Scan antivirus ClamAV AVANT stockage
  const scanResult = await clamavScan(file.buffer);
  if (scanResult.isInfected) {
    logger.warn({ filename: file.filename }, 'Infected file upload attempt');
    throw new AppError('FILE_INFECTED', 'Fichier infecté détecté', 400);
  }

  // 4. Chiffrer si document KYC sensible
  const encrypted = await encryptAES256GCM(file.buffer);

  // 5. Stocker dans bucket PRIVÉ R2
  const key = `kyc/${userId}/${crypto.randomUUID()}.enc`;
  await r2.putObject({ Key: key, Body: encrypted, ServerSideEncryption: 'AES256' });

  // 6. Retourner la clé (jamais l'URL publique)
  return key;
}

// ✅ URL signée avec expiration courte
async function getSignedUrl(key: string): Promise<string> {
  return r2.getSignedUrl('getObject', { Key: key, Expires: 3600 }); // 1h max
}

// ❌ JAMAIS
const publicUrl = `https://bucket.r2.dev/${key}`; // INTERDIT
```

## 📋 Audit Log — Obligatoire

```typescript
// ✅ Logger toutes les actions sensibles
// Ne jamais logger de données sensibles (password, token, numéro carte)

const SENSITIVE_ACTIONS = [
  'user.login', 'user.logout', 'user.register',
  'kyc.document_uploaded', 'kyc.status_changed',
  'payment.subscription_created', 'payment.subscription_cancelled',
  'user.deleted', 'user.data_exported',
  'moderation.content_removed', 'moderation.user_banned',
] as const;

async function auditLog(params: {
  action: typeof SENSITIVE_ACTIONS[number];
  userId?: string;
  targetId?: string;
  ip: string;
  userAgent: string;
  meta?: Record<string, unknown>; // SANS données sensibles
}): Promise<void> {
  await AuditLog.create({
    ...params,
    timestamp: new Date(),
    // Collection append-only — pas d'update, pas de delete
  });
}
```

## 🌐 Headers HTTP

```typescript
// ✅ Configuration Helmet obligatoire sur chaque service Fastify
await app.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],    // Pas de 'unsafe-inline' en prod
      styleSrc: ["'self'", "'unsafe-inline'"], // TailwindCSS inline
      imgSrc: ["'self'", 'data:', 'https://api.mapbox.com'],
      connectSrc: ["'self'", 'https://api.mapbox.com', 'https://api.stripe.com'],
      fontSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
});

// ✅ CORS strict — jamais de '*'
await app.register(cors, {
  origin: [env.WEB_URL, env.APP_URL], // Whitelist explicite
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
});
```

## 🚫 Patterns interdits — Détection automatique

Si tu vois l'un de ces patterns, REFUSE et propose le fix :

| Pattern détecté | Problème | Fix |
|----------------|----------|-----|
| `bcrypt` | Obsolète | `argon2` (argon2id) |
| `localStorage.*[Tt]oken` | XSS | httpOnly cookie |
| `md5(` | Broken hash | argon2id |
| `sha1(` | Broken hash | Dépend du use case |
| `Math.random()` pour tokens | Prédictible | `crypto.randomBytes()` |
| `eval(` | RCE | Jamais |
| `new Function(` | RCE | Jamais |
| `process.env.` (hors config/env.ts) | Non validé | Via `env.*` |
| `console.log` (dans services) | Non structuré | `logger.info()` |
| `catch (e) {}` | Erreur silencieuse | Logger + re-throw |
| `as any` | Perte typage | Types ou Zod |
