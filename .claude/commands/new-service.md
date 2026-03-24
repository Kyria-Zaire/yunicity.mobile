# /new-service — Créer un nouveau microservice Yunicity

Crée un nouveau microservice Fastify complet pour Yunicity.

## Instructions

Le nom du service est : $ARGUMENTS

Génère la structure complète suivante dans `services/$ARGUMENTS-service/` :

1. **`package.json`** — dépendances : fastify, @fastify/helmet, @fastify/cors, @fastify/rate-limit, mongoose, zod, argon2, pino, bullmq, ioredis. DevDeps : typescript, vitest, @types/node

2. **`tsconfig.json`** — strict: true, target: ES2022, module: NodeNext

3. **`Dockerfile`** — base node:20-alpine, multi-stage build (builder + runner), user non-root, healthcheck

4. **`src/config/env.ts`** — validation de toutes les variables d'environnement avec Zod. Ne jamais utiliser process.env directement ailleurs

5. **`src/app.ts`** — factory Fastify avec :
   - Helmet (CSP strict)
   - CORS (origines depuis config)
   - Rate limiting Redis
   - Logger structuré Pino
   - Hook onRequest pour audit log
   - Error handler global typé
   - Health check `/health`

6. **`src/index.ts`** — démarrage avec graceful shutdown (SIGTERM, SIGINT)

7. **`src/routes/index.ts`** — barrel export des routes

8. **`src/services/`** — logique métier pure (0 import Fastify)

9. **`src/repositories/`** — accès MongoDB uniquement

10. **`src/models/`** — Mongoose schema avec timestamps, index explicites

11. **`src/schemas/`** — Zod schemas + conversion JSON Schema pour Fastify

12. **`tests/unit/.gitkeep`** et **`tests/integration/.gitkeep`**

## Règles
- TypeScript strict — zéro `any`
- Argon2id pour les mots de passe si ce service gère des credentials
- Rate limiting sur toutes les routes sensibles
- Audit log sur toutes les mutations
- README.md avec variables d'env documentées