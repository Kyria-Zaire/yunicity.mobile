# Monorepo : contexte = racine. Args : SERVICE_DIR, EXPOSE_PORT, PNPM_FILTER (runner), RUNNER_HEALTH (1|0).
FROM node:22-alpine AS builder
ARG SERVICE_DIR
ARG EXPOSE_PORT=3000

WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.16.1 --activate
RUN apk add --no-cache python3 make g++

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json tsconfig.base.json ./
COPY apps ./apps
COPY packages ./packages
COPY services ./services

RUN pnpm install --frozen-lockfile
RUN pnpm --filter "@yunicity/types" --filter "@yunicity/validators" --filter "@yunicity/config" run build

WORKDIR /app/services/${SERVICE_DIR}
EXPOSE ${EXPOSE_PORT}
CMD ["pnpm", "dev"]

FROM node:22-alpine AS runner
ARG SERVICE_DIR
ARG PNPM_FILTER
ARG EXPOSE_PORT=3000
ARG RUNNER_HEALTH=1

RUN addgroup --system --gid 1001 yunicity && adduser --system --uid 1001 --ingroup yunicity yunicity
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.16.1 --activate
RUN apk add --no-cache python3 make g++ wget

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json tsconfig.base.json ./
COPY apps ./apps
COPY packages ./packages
COPY services ./services
RUN pnpm install --frozen-lockfile
RUN pnpm --filter "@yunicity/types" --filter "@yunicity/validators" --filter "@yunicity/config" run build
RUN pnpm --filter "${PNPM_FILTER}" run build

RUN echo '#!/bin/sh' > /tmp/hc.sh && \
    if [ "$RUNNER_HEALTH" = "1" ]; then \
      echo "wget -qO- http://127.0.0.1:${EXPOSE_PORT}/health || exit 1" >> /tmp/hc.sh; \
    else \
      echo "exit 0" >> /tmp/hc.sh; \
    fi && chmod +x /tmp/hc.sh && mv /tmp/hc.sh /usr/local/bin/service-healthcheck.sh

WORKDIR /app/services/${SERVICE_DIR}
USER yunicity
EXPOSE ${EXPOSE_PORT}

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD /usr/local/bin/service-healthcheck.sh

CMD ["node", "dist/index.js"]
