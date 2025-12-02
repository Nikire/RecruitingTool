#!/bin/sh
set -eux

echo "Running Prisma migrations..."
# Removed duplicate 'npx prisma generate' - already done in Dockerfile
npx prisma migrate deploy

echo "Starting the application..."
exec "$@"
