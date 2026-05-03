# Monorepo : contexte = racine du dépôt. Service figé : ai-service (pas de variable SERVICE_DIR).
FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
RUN apk add --no-cache python3 make g++

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json tsconfig.base.json ./
COPY apps ./apps
COPY packages ./packages
COPY services ./services

RUN pnpm install --frozen-lockfile
RUN pnpm --filter "@yunicity/database" generate
RUN pnpm --filter "@yunicity/types" --filter "@yunicity/validators" --filter "@yunicity/config" run build

WORKDIR /app/services/ai-service
EXPOSE 3009
CMD ["pnpm", "dev"]

FROM node:22-alpine AS runner
RUN addgroup --system --gid 1001 yunicity && adduser --system --uid 1001 --ingroup yunicity yunicity
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
RUN apk add --no-cache python3 make g++ wget

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json tsconfig.base.json ./
COPY apps ./apps
COPY packages ./packages
COPY services ./services
RUN pnpm install --frozen-lockfile
RUN pnpm --filter "@yunicity/database" generate
RUN pnpm --filter "@yunicity/types" --filter "@yunicity/validators" --filter "@yunicity/config" run build
RUN pnpm --filter "@yunicity/ai-service" run build

RUN echo '#!/bin/sh' > /tmp/hc.sh && \
    echo "wget -qO- http://127.0.0.1:3009/health || exit 1" >> /tmp/hc.sh && \
    chmod +x /tmp/hc.sh && mv /tmp/hc.sh /usr/local/bin/service-healthcheck.sh

WORKDIR /app/services/ai-service
USER yunicity
EXPOSE 3009

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD /usr/local/bin/service-healthcheck.sh

CMD ["node", "dist/index.js"]
