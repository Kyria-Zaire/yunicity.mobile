FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
RUN apk add --no-cache python3 make g++

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json tsconfig.base.json ./
COPY packages/ ./packages/
COPY services/community-service/package.json ./services/community-service/

RUN pnpm install --frozen-lockfile --filter @yunicity/community-service...
COPY services/community-service/ ./services/community-service/

RUN pnpm --filter @yunicity/database generate
RUN pnpm --filter @yunicity/types --filter @yunicity/validators --filter @yunicity/config run build
WORKDIR /app/services/community-service
RUN pnpm build

FROM node:22-alpine AS runner
RUN addgroup --system --gid 1001 yunicity \
 && adduser --system --uid 1001 --ingroup yunicity yunicity
WORKDIR /app

COPY --from=builder --chown=yunicity:yunicity /app/services/community-service/dist ./dist
COPY --from=builder --chown=yunicity:yunicity /app/services/community-service/node_modules ./node_modules
COPY --from=builder --chown=yunicity:yunicity /app/services/community-service/package.json ./
COPY --from=builder --chown=yunicity:yunicity /app/node_modules/.pnpm ./node_modules/.pnpm
COPY --from=builder --chown=yunicity:yunicity /app/packages/database/src/generated ./packages/database/src/generated

USER yunicity
EXPOSE 3003
CMD ["node", "dist/index.js"]
