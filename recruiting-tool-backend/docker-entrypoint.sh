#!/bin/sh
set -eux

# Check if node_modules is missing critical dependencies (volume mount may override image's node_modules)
if [ ! -d "/app/node_modules/ts-node" ]; then
  echo "node_modules appears empty or incomplete, installing dependencies..."
  # Force install to ensure all dependencies are populated in the mounted volume
  yarn install --force
  echo "Dependencies installed successfully"
fi

# Ensure Prisma client is generated
echo "Generating Prisma client..."
npx prisma generate

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Starting the application..."
exec "$@"
