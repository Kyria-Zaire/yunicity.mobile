---
description: Docker, infrastructure et CI/CD Yunicity
globs: ["**/Dockerfile", "**/docker-compose*.yml", "**/.github/workflows/**", "**/infra/**"]
alwaysApply: false
---

# Infrastructure Yunicity — Docker & CI/CD

## Dockerfile — Template obligatoire (multi-stage, non-root)

```dockerfile
# ============================
# Stage 1 : Builder
# ============================
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances en premier (cache Docker)
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

# Copier le code source
COPY . .

# Build TypeScript
RUN pnpm build

# Nettoyer les dev dependencies
RUN pnpm prune --prod

# ============================
# Stage 2 : Runner (image finale)
# ============================
FROM node:20-alpine AS runner

# Sécurité : pas de root
RUN addgroup --system --gid 1001 yunicity && \
    adduser --system --uid 1001 --ingroup yunicity yunicity

WORKDIR /app

# Copier seulement le nécessaire depuis le builder
COPY --from=builder --chown=yunicity:yunicity /app/dist ./dist
COPY --from=builder --chown=yunicity:yunicity /app/node_modules ./node_modules
COPY --from=builder --chown=yunicity:yunicity /app/package.json ./

# Utiliser l'user non-root
USER yunicity

# Variables d'environnement (valeurs par défaut non sensibles)
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Health check pour Docker/K8s
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]
```

## docker-compose.yml — Développement local

```yaml
version: '3.9'

# Réseau isolé : les services internes ne sont pas exposés sur le host
networks:
  internal:
    driver: bridge
  external:
    driver: bridge

volumes:
  mongo_data:
  redis_data:

services:
  # ── API Gateway ─────────────────────────────────────────────
  api-gateway:
    build:
      context: ./services/api-gateway
      target: builder   # Mode dev avec hot reload
    ports:
      - "3000:3000"     # Seul service exposé sur le host
    environment:
      - NODE_ENV=development
    env_file: ./services/api-gateway/.env.local
    volumes:
      - ./services/api-gateway/src:/app/src   # Hot reload
    depends_on:
      - auth-service
      - user-service
      - redis
    networks:
      - external
      - internal
    restart: unless-stopped

  # ── Auth Service ─────────────────────────────────────────────
  auth-service:
    build:
      context: ./services/auth-service
      target: builder
    env_file: ./services/auth-service/.env.local
    volumes:
      - ./services/auth-service/src:/app/src
    depends_on:
      - redis
    networks:
      - internal    # Pas exposé — accessible uniquement via api-gateway
    restart: unless-stopped

  # ── User Service ─────────────────────────────────────────────
  user-service:
    build:
      context: ./services/user-service
      target: builder
    env_file: ./services/user-service/.env.local
    volumes:
      - ./services/user-service/src:/app/src
    depends_on:
      - redis
    networks:
      - internal
    restart: unless-stopped

  # ── Redis ────────────────────────────────────────────────────
  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD} --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - internal
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "--pass", "${REDIS_PASSWORD}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ── ClamAV (Antivirus) ───────────────────────────────────────
  clamav:
    image: clamav/clamav:latest
    networks:
      - internal
    volumes:
      - /tmp/clamav:/tmp/scan  # Répertoire de scan temporaire
    restart: unless-stopped

  # ── Worker BullMQ ────────────────────────────────────────────
  worker:
    build:
      context: ./services/worker
      target: builder
    env_file: ./services/worker/.env.local
    depends_on:
      - redis
    networks:
      - internal
    restart: unless-stopped
```

## Variables d'environnement — .env.example obligatoire

```bash
# services/user-service/.env.example
# COPIER EN .env.local et remplir avec les vraies valeurs
# Ne JAMAIS committer .env.local

# App
NODE_ENV=development
PORT=3002
SERVICE_NAME=user-service

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/yunicity?retryWrites=true

# Redis
REDIS_URL=redis://:password@redis:6379

# Auth (shared secret avec auth-service)
AUTH_SECRET=minimum-32-caracteres-aleatoires-ici

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=yunicity-kyc-docs
R2_PUBLIC_URL=  # Ne pas mettre — bucket privé

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxx
TWILIO_AUTH_TOKEN=
TWILIO_VERIFY_SERVICE_SID=VAxxxxxxx

# Services internes (Docker network)
AUTH_SERVICE_URL=http://auth-service:3001

# Web & App URLs (CORS whitelist)
WEB_URL=http://localhost:3000
APP_URL=exp://localhost:8081
```

## GitHub Actions — CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI — Yunicity

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  quality:
    name: Qualité & Sécurité
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 9

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      # TypeScript strict check
      - name: Type check
        run: pnpm typecheck

      # Lint
      - name: Lint (ESLint + Prettier)
        run: pnpm lint

      # Audit des dépendances — bloque si vulnérabilité HIGH ou CRITICAL
      - name: Security audit
        run: pnpm audit --audit-level=high

      # Tests avec couverture
      - name: Tests
        run: pnpm test --coverage
        env:
          NODE_ENV: test

      # Vérifier la couverture minimale (80% sur services critiques)
      - name: Coverage check
        run: pnpm coverage:check

  build:
    name: Build Docker
    runs-on: ubuntu-latest
    needs: quality
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4

      - name: Build & Push images
        run: |
          docker build -t yunicity/api-gateway:${{ github.sha }} ./services/api-gateway
          docker build -t yunicity/user-service:${{ github.sha }} ./services/user-service
          # etc.
```

## .dockerignore — Obligatoire dans chaque service

```
node_modules
dist
.env*
.git
*.md
tests
coverage
.eslintrc*
.prettierrc*
tsconfig.json
vitest.config.ts
```
