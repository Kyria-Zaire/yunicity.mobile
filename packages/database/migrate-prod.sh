#!/bin/sh
# Migration Prisma en production
# Usage: DATABASE_URL=<url> sh migrate-prod.sh
#
# Railway: executee automatiquement avant le demarrage de user-service
# Manuel: DATABASE_URL=<Railway PostgreSQL URL> npx prisma migrate deploy

set -e

echo "Migration Prisma production..."
npx prisma migrate deploy --schema=prisma/schema.prisma
echo "Migration terminee"
