#!/usr/bin/env bash
set -euo pipefail

echo "Yunicity Dev - Starting infrastructure..."

# 1. Start PostgreSQL + Redis
echo "Starting PostgreSQL + Redis..."
docker compose -f docker-compose.dev.yml up -d

# 2. Wait for PostgreSQL
echo "Waiting for PostgreSQL..."
retries=0
until docker compose -f docker-compose.dev.yml exec -T postgres pg_isready -U yunicity 2>/dev/null; do
  sleep 2
  retries=$((retries + 1))
  if [ "$retries" -ge 15 ]; then
    echo "PostgreSQL failed to start!"
    exit 1
  fi
done

# 3. Prisma migrate
echo "Running Prisma migrations..."
DATABASE_URL="postgresql://yunicity:changeme_local@localhost:5433/yunicity" \
  npx prisma migrate deploy --schema packages/database/prisma/schema.prisma

# 4. Generate Prisma client
echo "Generating Prisma client..."
pnpm --filter @yunicity/database generate

echo ""
echo "Infrastructure ready!"
echo ""
echo "Start services in separate terminals:"
echo "  pnpm --filter @yunicity/api-gateway dev"
echo "  pnpm --filter @yunicity/auth-service dev"
echo "  pnpm --filter @yunicity/user-service dev"
echo "  pnpm --filter @yunicity/web dev"
echo ""
echo "Test: curl http://localhost:3000/health"
