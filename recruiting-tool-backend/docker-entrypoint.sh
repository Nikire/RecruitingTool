#!/bin/sh

echo "Running Prisma migrations..."
yarn run prisma generate
yarn run prisma migrate deploy

echo "Starting the application..."
exec "$@"