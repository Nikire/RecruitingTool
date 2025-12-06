# Docker Deployment Guide

Complete guide to deploying Recruiting Tool using Docker and Docker Compose.

## Overview

Recruiting Tool is fully containerized and can be deployed using Docker Compose with minimal configuration.

**Included Services:**
- **backend** - NestJS API server
- **frontend** - React application (Nginx)
- **db** - PostgreSQL 15 database
- **pgadmin** - Database management UI
- **minio** - S3-compatible file storage
- **pgbouncer** - Connection pooling (optional)
- **n8n** - Workflow automation (optional)
- **stripe-cli** - Stripe webhook forwarding (optional)

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

Edit `.env` and configure:
- Database passwords
- JWT secret
- Admin credentials
- SendGrid API key (for emails)

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
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Swagger Docs: http://localhost:4000/api
- pgAdmin: http://localhost:8080
- MinIO Console: http://localhost:9001

## Docker Services

### Backend Service

**Container:** `recruiting_backend`
**Port:** 4000
**Image:** Built from `recruiting-tool-backend/Dockerfile`

**Features:**
- Auto-runs database migrations on startup
- Creates admin user if doesn't exist
- Seeds dummy data on first run
- Health check endpoint: `/api/health/liveness`

**Environment:**
- Uses `DATABASE_URL` from docker-compose
- Connection pooling configured (20 connections max)

**Restart Policy:** `unless-stopped`

### Frontend Service

**Container:** `recruiting_frontend`
**Port:** 3000 (mapped to 80 inside container)
**Image:** Built from `recruiting-tool-frontend/Dockerfile`

**Features:**
- Vite production build
- Served by Nginx
- Optimized static assets
- Health check on port 80

**Environment:**
- `VITE_API_URL` points to backend

### Database Service

**Container:** `recruiting_db`
**Port:** 5432
**Image:** `postgres:latest`

**Volumes:**
- `pgdata:/var/lib/postgresql/data` (persistent storage)

**Health Check:**
- PostgreSQL ready check every 10 seconds

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

### PgAdmin Service

**Container:** `recruiting_pgadmin`
**Port:** 8080
**Image:** `dpage/pgadmin4:8`

**Volumes:**
- `pgadmin_data:/var/lib/pgadmin` (persistent storage)

**Access:** http://localhost:8080
- Email: From `PGADMIN_EMAIL`
- Password: From `PGADMIN_PASSWORD`

### PgBouncer Service (Optional)

**Container:** `recruiting_pgbouncer`
**Port:** 6432

**Configuration:**
- Pool mode: Transaction
- Max client connections: 100
- Default pool size: 20
- Min pool size: 5

**Enable for Production:**
1. Uncomment PgBouncer in `docker-compose.yml` dependencies
2. Update `DATABASE_URL` to use `pgbouncer:6432`
3. Restart: `docker-compose up -d --build backend`

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

### 1. Environment Variables

**Critical Changes:**
- Set `NODE_ENV=production`
- Use strong `JWT_SECRET` (32+ characters)
- Change all default passwords
- Configure SendGrid for emails
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
        proxy_pass http://localhost:3000;
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

For production, enable connection pooling:

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

```bash
# Check VITE_API_URL in frontend .env
cat recruiting-tool-frontend/.env

# Rebuild frontend
docker-compose up -d --build frontend
```

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

- [Production Deployment](./production.md) - Production best practices
- [Configuration Guide](../getting-started/configuration.md) - Environment variables
- [Installation Guide](../getting-started/installation.md) - Initial setup
