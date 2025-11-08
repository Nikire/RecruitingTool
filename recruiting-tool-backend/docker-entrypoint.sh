#!/bin/sh
set -eux

echo "Running Prisma migrations..."
npx prisma generate
npx prisma migrate deploy

echo "Starting the application..."
exec "$@"