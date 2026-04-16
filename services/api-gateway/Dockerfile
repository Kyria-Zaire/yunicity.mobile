FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.16.1 --activate
RUN apk add --no-cache python3 make g++

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json tsconfig.base.json ./
COPY packages/ ./packages/
COPY services/api-gateway/package.json ./services/api-gateway/

RUN pnpm install --frozen-lockfile --filter @yunicity/api-gateway...
COPY services/api-gateway/ ./services/api-gateway/

RUN pnpm --filter @yunicity/database generate
RUN pnpm --filter @yunicity/types --filter @yunicity/validators --filter @yunicity/config run build
WORKDIR /app/services/api-gateway
RUN pnpm build

FROM node:22-alpine AS runner
RUN addgroup --system --gid 1001 yunicity \
 && adduser --system --uid 1001 --ingroup yunicity yunicity
WORKDIR /app

COPY --from=builder --chown=yunicity:yunicity /app/services/api-gateway/dist ./dist
COPY --from=builder --chown=yunicity:yunicity /app/services/api-gateway/node_modules ./node_modules
COPY --from=builder --chown=yunicity:yunicity /app/services/api-gateway/package.json ./
COPY --from=builder --chown=yunicity:yunicity /app/node_modules/.pnpm ./node_modules/.pnpm
COPY --from=builder --chown=yunicity:yunicity /app/packages/database/src/generated ./packages/database/src/generated

USER yunicity
EXPOSE 3000
CMD ["node", "dist/index.js"]
