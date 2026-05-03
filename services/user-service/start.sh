#!/bin/sh
set -eu

echo "Waiting for database..."

RETRIES=10
while [ "$RETRIES" -gt 0 ]; do
  if npx prisma@5.22.0 migrate deploy --schema=../../packages/database/prisma/schema.prisma 2>/dev/null; then
    break
  fi

  RETRIES=$((RETRIES - 1))
  if [ "$RETRIES" -eq 0 ]; then
    echo "Migration failed after retries."
    exit 1
  fi

  echo "Migration failed, retrying in 5s... ($RETRIES attempts left)"
  sleep 5
done

echo "Starting server..."
exec node dist/index.js

