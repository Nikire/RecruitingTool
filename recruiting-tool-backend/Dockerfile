# ============================================
# Optimized Backend Dockerfile
# Using Alpine base, production dependencies only
# ============================================
FROM node:20-alpine

ARG API_PORT=4000
ENV API_PORT=${API_PORT}
ENV NODE_ENV=production

WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy dependency files first (better layer caching)
COPY package.json ./
COPY yarn.lock* ./

# Install all dependencies (ts-node requires devDependencies)
# Note: For true production, pre-compile TypeScript in a multi-stage build
RUN yarn install && \
    yarn cache clean

# Copy Prisma schema and migrations (needed for prisma generate and migrations)
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY src ./src
COPY tsconfig.json ./
COPY tsconfig.build.json ./

# Copy docker-entrypoint.sh
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

EXPOSE ${API_PORT}

# Run with ts-node (production optimized with --transpile-only)
CMD ["npx", "ts-node", "--transpile-only", "-r", "tsconfig-paths/register", "src/main.ts"]
