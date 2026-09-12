# Docker Deployment Guide

Complete guide to deploying BorderLess using Docker and Docker Compose.

## Overview

BorderLess is fully containerized and can be deployed using Docker Compose with minimal configuration.

**Included Services:**

| Service | Container name | Image | Host port | Profile |
|---------|----------------|-------|-----------|---------|
| `db` | auto-generated | `postgres:17` | 5432 | default |
| `backend` | auto-generated | built from `recruiting-tool-backend/Dockerfile` | `${API_PORT:-4000}` | default |
| `frontend` | auto-generated | `ghcr.io/nikire/borderless-frontend:latest` (or built locally) | `${VITE_PORT:-5137}` → 80 | default |
| `minio` | `recruiting_minio` | `minio/minio:latest` | 9000 (API), 9001 (console) | default |
| `n8n` | `borderless-n8n` | `n8nio/n8n:latest` | 5678 | default |
| `pgadmin` | `recruiting_pgadmin` | `dpage/pgadmin4:8` | 8080 | `tools` |
| `pgbouncer` | `recruiting_pgbouncer` | `pgbouncer/pgbouncer:latest` | 6432 | `tools` |
| `stripe-cli` | `borderless-stripe-cli` | `stripe/stripe-cli:latest` | - | `stripe` |

**Profiles matter.** `docker-compose up -d` starts `db`, `backend`, `frontend`, `minio` and `n8n`
only. Services behind a profile need it named explicitly:

```bash
docker-compose --profile tools up -d      # adds pgadmin and pgbouncer
docker-compose --profile stripe up -d     # adds stripe-cli
```

`db`, `backend` and `frontend` declare no `container_name`, so Docker Compose names them from the
project directory (for example `borderless-backend-1`). Use `docker-compose ps` to see the real
names rather than guessing.

## Prerequisites

- Docker (v20.10 or higher)
- Docker Compose (v2.0 or higher)
- 4GB RAM minimum (8GB recommended)
- 2GB free disk space

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/Nikire/RecruitingTool.git
cd RecruitingTool
```

### 2. Configure Environment

```bash
# Copy example environment files
cp .env.example .env
cp recruiting-tool-backend/.env.example recruiting-tool-backend/.env
cp recruiting-tool-frontend/.env.example recruiting-tool-frontend/.env
```

### 3. Update Environment Variables

Edit the files and configure:
- Database passwords (`POSTGRES_USER`, `POSTGRES_PASSWORD` in the root `.env`)
- JWT secret and admin credentials (`JWT_SECRET`, `ADMIN_*` in the backend `.env`)
- Resend API key for emails (`SMTP_ENABLED`, `SMTP_PASSWORD` in the backend `.env`)
- Frontend build arguments (`VITE_API_URL` and any `VITE_*` telemetry keys in the **root** `.env` -
  Vite inlines them at build time, so they have no effect anywhere else)

See [Configuration Guide](../getting-started/configuration.md) for complete reference.

### 4. Start All Services

```bash
docker-compose up -d --build
```

### 5. Verify Deployment

```bash
# Check all containers are running
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

**Access the application:**
- Frontend: http://localhost:5137 (the `VITE_PORT` default)
- Backend API: http://localhost:4000/api
- Public API Swagger docs: http://localhost:4000/api/docs
- Internal Swagger docs: http://localhost:4000/api/internal-docs
- MinIO Console: http://localhost:9001
- n8n: http://localhost:5678
- pgAdmin: http://localhost:8080 (only with `--profile tools`)

## Docker Services

### Backend Service

**Container:** auto-named (no `container_name` is set)
**Port:** `${API_PORT:-4000}`
**Image:** Built from `recruiting-tool-backend/Dockerfile`

**Features:**
- `docker-entrypoint.sh` runs `npx prisma generate` then `npx prisma migrate deploy` on every start
- Creates the admin user on boot when `ADMIN_EMAIL`, `ADMIN_NAME` and `ADMIN_PASSWORD` are all set
- Seeds default plan limits and feature flags on boot
- Health check endpoint: `/api/health/liveness`

**Environment:**
- `DATABASE_URL` is set in `docker-compose.yml` (direct to `db`, `connection_limit=20`,
  `pool_timeout=15`) and therefore **overrides** any value in the backend `.env`
- The rest comes from `env_file: ./recruiting-tool-backend/.env`

**Restart Policy:** `unless-stopped`

> **This service is a development runtime.** The base compose file pins `NODE_ENV=development` and
> boots through `ts-node`, which makes the exception filters attach raw messages and stack traces to
> API responses. For production you must add the overlay - see
> [Production Guide](./production.md).

> **Dummy data:** `DummyModule` is registered only when `DUMMY_DATA_ENABLED=true`. With the variable
> unset or `false`, no demo data is seeded.

### Frontend Service

**Container:** auto-named (no `container_name` is set)
**Port:** `${VITE_PORT:-5137}` on the host, mapped to 80 in the container
**Image:** `ghcr.io/nikire/borderless-frontend:latest`, with a local build definition as the
alternative (`docker-compose build frontend` or `up --build`)

**Features:**
- Vite production build served by Nginx
- Health check on port 80

**Build arguments:** `VITE_API_URL`, `VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID`,
`VITE_AUTH0_AUDIENCE`, `VITE_POSTHOG_KEY`, `VITE_POSTHOG_HOST`, `VITE_SENTRY_DSN`,
`VITE_SENTRY_ENVIRONMENT`, `VITE_SENTRY_TRACES_SAMPLE_RATE`, `VITE_APP_VERSION` - all read from the
root `.env`, all defaulting to an empty string. Vite inlines them into the bundle at build time, so
the `env_file` on this service reaches only the nginx runtime and changes nothing about the
compiled assets.

### Database Service

**Container:** auto-named (no `container_name` is set)
**Port:** 5432
**Image:** `postgres:17`

**Volumes:**
- `pgdata:/var/lib/postgresql/data` (persistent storage)

**Health Check:**
- `pg_isready` every 10 seconds

**Timezone:** America/Argentina/Buenos_Aires

### MinIO Service

**Container:** `recruiting_minio`
**Ports:** 9000 (API), 9001 (Console)
**Image:** `minio/minio:latest`

**Volumes:**
- `minio_data:/data` (persistent storage)

**Environment:**
- `MINIO_ROOT_USER` and `MINIO_ROOT_PASSWORD` from .env

**Access Console:** http://localhost:9001

### PgAdmin Service (`tools` profile)

**Container:** `recruiting_pgadmin`
**Port:** 8080
**Image:** `dpage/pgadmin4:8`

**Volumes:**
- `pgadmin_data:/var/lib/pgadmin` (persistent storage)

**Start it:** `docker-compose --profile tools up -d pgadmin`

**Access:** http://localhost:8080
- Email: From `PGADMIN_EMAIL`
- Password: From `PGADMIN_PASSWORD`

### PgBouncer Service (`tools` profile)

**Container:** `recruiting_pgbouncer`
**Port:** 6432
**Image:** `pgbouncer/pgbouncer:latest`

**Configuration set in `docker-compose.yml`:**
- `PGBOUNCER_POOL_MODE=transaction`
- `PGBOUNCER_MAX_CLIENT_CONN=100`
- `PGBOUNCER_DEFAULT_POOL_SIZE=20`
- `PGBOUNCER_MIN_POOL_SIZE=5`
- `PGBOUNCER_RESERVE_POOL_SIZE=5`
- `PGBOUNCER_MAX_DB_CONNECTIONS=20`

**Enable for Production:**
1. `docker-compose --profile tools up -d pgbouncer`
2. Change the backend's `DATABASE_URL` in `docker-compose.yml` to point at `pgbouncer:6432` (a
   commented `OPTION 2` line is already there)
3. Optionally uncomment the `pgbouncer` entry under the backend's `depends_on`
4. Recreate: `docker-compose --profile tools up -d --build backend`

### n8n Service

**Container:** `borderless-n8n`
**Port:** 5678
**Image:** `n8nio/n8n:latest`

Basic auth is on by default, using `N8N_USER` / `N8N_PASSWORD`. Workflows persist in the `n8n_data`
volume.

### Stripe CLI Service (`stripe` profile)

**Container:** `borderless-stripe-cli`
**Image:** `stripe/stripe-cli:latest`

Started only with `--profile stripe`. It forwards events to
`http://backend:4000/api/stripe/webhook`, **a route the backend does not serve** - billing is
handled by `/api/billing`. Treat this service as dormant unless a Stripe controller is added.

## Docker Commands

### Start Services

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d backend

# Build and start (after code changes)
docker-compose up -d --build
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop specific service
docker-compose stop backend

# Stop and remove volumes (WARNING: Deletes all data)
docker-compose down -v
```

### View Logs

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend

# Follow logs (tail -f)
docker-compose logs -f backend

# Last N lines
docker-compose logs --tail=100 backend
```

### Service Status

```bash
# View running containers
docker-compose ps

# View health status
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Execute Commands in Container

```bash
# Enter backend container shell
docker-compose exec backend sh

# Enter database container
docker-compose exec db psql -U postgres -d recruiting_tool_db

# Run backend commands
docker-compose exec backend npx prisma migrate status
```

## Volumes

**Persistent Data Volumes:**
- `pgdata` - PostgreSQL database
- `pgadmin_data` - PgAdmin configuration
- `minio_data` - File storage
- `n8n_data` - n8n workflows
- `backup_data` - Database backups
- `backend_node_modules` - Backend dependencies (performance)

**View Volumes:**
```bash
docker volume ls
```

**Backup Volume:**
```bash
# Backup database volume
docker run --rm -v pgdata:/data -v $(pwd):/backup ubuntu tar cvf /backup/pgdata-backup.tar /data
```

**Restore Volume:**
```bash
# Restore database volume
docker run --rm -v pgdata:/data -v $(pwd):/backup ubuntu tar xvf /backup/pgdata-backup.tar -C /
```

## Database Migrations

### Run Migrations

```bash
# Migrations run automatically on backend startup

# Manual migration
docker-compose exec backend npx prisma migrate deploy

# Check migration status
docker-compose exec backend npx prisma migrate status

# Create new migration (development)
docker-compose exec backend npx prisma migrate dev --name migration_name
```

### Reset Database (Development Only)

```bash
# WARNING: Deletes all data!
docker-compose exec backend npx prisma migrate reset
```

## Production Deployment

> **Start with the production overlay.** `docker-compose.yml` alone is the local development
> configuration. Production runs as
> `docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d`. See
> [Production Guide](./production.md#starting-the-production-stack) before using anything below.

### 1. Environment Variables

**Critical Changes:**
- Start with the production overlay so `NODE_ENV=production` and the backend runs `node dist/main.js`
- Use strong `JWT_SECRET` (32+ characters)
- Change all default passwords
- Configure Resend for emails (`SMTP_ENABLED=true`, `SMTP_PASSWORD=<resend key>`, `EMAIL_FROM`)
- Set `INTERNAL_API_KEY` and `METRICS_TOKEN` - both fail closed when unset
- Set `DUMMY_DATA_ENABLED=false`
- Use AWS S3 instead of MinIO (recommended)

### 2. Enable HTTPS

**Option A: Use Nginx Reverse Proxy**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:5137;  # ${VITE_PORT:-5137}
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Option B: Use Traefik or Caddy**

### 3. Enable PgBouncer

PgBouncer sits behind the `tools` profile, so it must be requested explicitly:

```bash
docker-compose --profile tools up -d pgbouncer
```

Then point the backend at it in `docker-compose.yml` and uncomment the dependency:

```yaml
# docker-compose.yml
backend:
  depends_on:
    pgbouncer:
      condition: service_healthy
  environment:
    - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@pgbouncer:6432/recruiting_tool_db?schema=public
```

### 4. Resource Limits

Add resource limits to prevent overconsumption:

```yaml
backend:
  deploy:
    resources:
      limits:
        cpus: '1.0'
        memory: 1G
      reservations:
        cpus: '0.5'
        memory: 512M
```

### 5. Database Backups

**Automated Backup Script:**
```bash
#!/bin/bash
# backup-db.sh

docker-compose exec -T db pg_dump -U postgres recruiting_tool_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

**Setup Cron Job:**
```bash
# Backup daily at 2 AM
0 2 * * * /path/to/backup-db.sh
```

### 6. Monitoring

**Health Checks:**
- Backend: `http://your-domain.com/api/health`
- Database pool: `http://your-domain.com/api/health/database/pool`
- Storage: `http://your-domain.com/api/health/storage`

**Setup Monitoring:**
- Use tools like Prometheus, Grafana
- Monitor Docker container metrics
- Set up alerts for service failures

See [Production Guide](./production.md) for complete checklist.

## Troubleshooting

### Backend Won't Start

```bash
# View backend logs
docker-compose logs backend

# Common issues:
# - Database not ready: Wait for healthcheck
# - Migration failed: Check DATABASE_URL
# - Port in use: Change API_PORT in .env

# Restart backend
docker-compose restart backend
```

### Frontend Shows "API Connection Error"

`VITE_API_URL` is compiled into the bundle, so it must be set in the **root** `.env` (where
`docker-compose.yml` reads it as a build arg) and the image must be rebuilt. Editing
`recruiting-tool-frontend/.env` or restarting the container changes nothing.

```bash
# Check the build arg source
grep VITE_API_URL .env

# Rebuild the image so the new value is inlined
docker-compose up -d --build frontend
```

The `frontend` service defaults to `ghcr.io/nikire/borderless-frontend:latest`. If you want your
local edits, pass `--build`; otherwise Compose will use the registry image.

### Database Connection Failed

```bash
# Check database is running
docker-compose ps db

# View database logs
docker-compose logs db

# Enter database
docker-compose exec db psql -U postgres -d recruiting_tool_db

# Reset database (WARNING: Deletes data!)
docker-compose down -v
docker-compose up -d
```

### Out of Disk Space

```bash
# Clean up unused images
docker system prune -a

# Remove stopped containers
docker container prune

# Remove unused volumes
docker volume prune
```

## Next Steps

- [Production Deployment](./production.md) - Production overlay, CI/CD and hardening
- [Configuration Guide](../getting-started/configuration.md) - Environment variables
- [Installation Guide](../getting-started/installation.md) - Initial setup
- [External APIs - Production Activation](../EXTERNAL_APIS_PRODUCTION.md) - Per-service setup steps
