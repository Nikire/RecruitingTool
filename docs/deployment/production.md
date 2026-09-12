# Production Deployment Guide

Complete checklist and best practices for deploying BorderLess to production.

## Starting the Production Stack

**`docker-compose.yml` on its own is the local development configuration.** It pins
`NODE_ENV=development` and boots the backend through `ts-node` from a bind mount. Under
`NODE_ENV=development`, `HttpExceptionFilter` and `PrismaExceptionFilter` attach raw exception
messages and full stack traces to API error responses - on a public host that leaks internals to
anyone who can trigger an error.

Production therefore always runs **both** files, base first:

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

`docker-compose.prod.yml` overrides only the backend service:

| Setting | Base (`docker-compose.yml`) | Overlay (`docker-compose.prod.yml`) |
|---------|-----------------------------|-------------------------------------|
| `NODE_ENV` | `development` | `production` |
| `command` | `node -r ts-node/register -r tsconfig-paths/register src/main.ts` | `node dist/main.js` |

Export the file list once so every later command targets the same stack:

```bash
COMPOSE_FILES="-f docker-compose.yml -f docker-compose.prod.yml"
docker-compose $COMPOSE_FILES up -d
docker-compose $COMPOSE_FILES ps
docker-compose $COMPOSE_FILES logs -f backend
```

### Prerequisite: `dist/` must exist

`recruiting-tool-backend/Dockerfile` does **not** compile the project. It ships `src` plus `ts-node`
and its `CMD` is `npx ts-node --transpile-only`. The overlay's `node dist/main.js` therefore needs a
`dist/` directory, which the deploy pipeline produces into the `./recruiting-tool-backend` bind
mount before containers are swapped.

Bringing the stack up by hand means compiling first:

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml \
  run --rm --no-deps -e NODE_ENV=development --entrypoint sh backend \
  -c "yarn install && yarn build"
```

`NODE_ENV=development` is forced for that one-off container because Yarn 1 skips devDependencies
(`@nestjs/cli`, `typescript`) under `NODE_ENV=production`, and `nest build` needs them. On a small
host, `nest build` can exhaust the default V8 heap; the pipeline raises it with
`-e NODE_OPTIONS=--max-old-space-size=3072`.

The container entrypoint still runs `npx prisma generate` and `npx prisma migrate deploy` before
exec'ing the command, so migrations apply on every start under the overlay too.

## CI/CD: Automated Deployment to EC2

Pushing to the `production` branch triggers `.github/workflows/deploy-prod.yml`, which runs three
jobs in order.

| Job | What it does |
|-----|--------------|
| `quality-gates` | Calls `.github/workflows/code-quality.yml` as a reusable workflow. Backend: install, `db:generate`, `lint:check`, `typecheck`, `format:check`, `build`. Frontend: install, `lint:check`, `typecheck`, `format:check`, `build`, unit tests (five spec files run non-blocking in a quarantine step). A failure here stops the deploy. |
| `build-frontend` | Builds `recruiting-tool-frontend` and pushes `ghcr.io/nikire/borderless-frontend:latest`, supplying every `VITE_*` value as a Docker build arg from repository secrets. |
| `deploy` | SSHes to EC2, `git reset --hard origin/production` in `~/borderless`, builds the backend image, compiles `dist/`, pulls the GHCR frontend image, brings the stack up with both compose files, reloads nginx and smoke-tests the public endpoints. |

The `frontend` service in `docker-compose.yml` declares
`image: ghcr.io/nikire/borderless-frontend:latest`, so the EC2 host pulls the image CI built rather
than compiling the bundle on the server.

### Why the `VITE_*` values live in CI

Vite inlines `import.meta.env.VITE_*` when the bundle is compiled. Setting those variables on the
EC2 host, in an `env_file`, or on a running container has no effect - the assets are already built.
They must be build args, which is why the workflow passes them and why unset secrets simply expand
to an empty string (the "telemetry disabled" path the frontend degrades into).

### Required repository secrets

| Secret | Used for |
|--------|----------|
| `EC2_HOST`, `EC2_USERNAME`, `EC2_KEY` | SSH connection to the deploy host |
| `INTERNAL_API_KEY` | Deployment-notification call to `POST /api/internal/deployment-notification` |
| `VITE_API_URL` | Frontend build arg - the API base URL |
| `VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID`, `VITE_AUTH0_AUDIENCE` | Frontend build args for Auth0 |
| `VITE_POSTHOG_KEY`, `VITE_POSTHOG_HOST` | Frontend build args for PostHog |
| `VITE_SENTRY_DSN`, `VITE_SENTRY_TRACES_SAMPLE_RATE` | Frontend build args for Sentry |

`VITE_SENTRY_ENVIRONMENT` is hardcoded to `production` and `VITE_APP_VERSION` to the commit SHA;
neither needs a secret. `GITHUB_TOKEN` is provided by Actions and is used to push and pull the GHCR
image.

### Branch model

| Branch | What happens on push |
|--------|----------------------|
| `production` | `deploy-prod.yml` runs the quality gates, builds the frontend image and deploys to EC2 |
| `development` | `code-quality.yml` runs its checks. There is **no** deploy workflow for this branch in the repository |

Pull requests into either branch also run `code-quality.yml`.

The deploy job fails loudly: after bringing containers up it curls the public frontend,
`/api/health/liveness` and `/api/health/readiness`, and a non-2xx response exits the job non-zero.

## Pre-Deployment Checklist

### Security

- [ ] Bring the stack up with `-f docker-compose.yml -f docker-compose.prod.yml` so `NODE_ENV=production` and stack traces stay out of API responses
- [ ] Change `JWT_SECRET` to strong random string (32+ characters)
- [ ] Change default admin password
- [ ] Update all database passwords
- [ ] Change MinIO credentials (or use AWS S3)
- [ ] Enable HTTPS with valid SSL certificates
- [ ] Set `FRONTEND_URL` to the real front-end origin - it is the single allowed CORS origin, with no fallback
- [ ] Set `INTERNAL_API_KEY` (`getOrThrow`: `/api/internal/*` throws on every request while unset)
- [ ] Set `METRICS_TOKEN` (`GET /api/metrics` rejects everything while unset)
- [ ] Set `DUMMY_DATA_ENABLED=false` so `DummyModule` is not registered
- [ ] Leave `THROTTLE_DISABLED` unset and budget `THROTTLE_TTL` / `THROTTLE_LIMIT` against real traffic
- [ ] Leave pgAdmin and PgBouncer out of the default start - they are behind `profiles: [tools]` already
- [ ] Decide what to do about Swagger: `/api/docs` (public API) and `/api/internal-docs` (all routes) are both served unauthenticated

### Configuration

- [ ] Configure Resend for email notifications (`SMTP_ENABLED=true`, `SMTP_PASSWORD`, `EMAIL_FROM`)
- [ ] Point `S3_PUBLIC_ENDPOINT` at the browser-reachable object-store address
- [ ] Set up AWS S3 for file storage (instead of MinIO)
- [ ] Enable PgBouncer for connection pooling
- [ ] Configure database backups (`BACKUP_ENABLED=true`, `BACKUP_CRON`)
- [ ] Set up log aggregation
- [ ] Configure monitoring and alerts (`SENTRY_DSN`)
- [ ] Set up CDN for static assets (optional)

**See:** [External APIs - Production Activation](../EXTERNAL_APIS_PRODUCTION.md) for the
per-service activation steps behind each of these (Resend, Google Calendar, Gemini, Auth0, MinIO,
n8n and the internal API key).

### Database

- [ ] Run all migrations
- [ ] Verify database indexes
- [ ] Configure connection pooling (`DATABASE_POOL_MAX=20`)
- [ ] Set up automated backups
- [ ] Test backup restoration
- [ ] Configure database monitoring

### Infrastructure

- [ ] Set up reverse proxy (Nginx, Traefik, Caddy)
- [ ] Configure load balancing (if needed)
- [ ] Set up Docker resource limits
- [ ] Configure Docker restart policies
- [ ] Set up health check monitoring
- [ ] Configure log rotation

## Production Environment Variables

### Root `.env`

Docker Compose interpolates this file. Besides the service credentials, it holds the **frontend
build arguments** - Vite inlines those at build time, so this is the only place they take effect
for a locally built image.

```bash
# PostgreSQL Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<STRONG_PASSWORD_HERE>

# API and frontend host ports
API_PORT=4000
VITE_PORT=5137

# MinIO (or skip if using AWS S3)
MINIO_ROOT_USER=<STRONG_USERNAME>
MINIO_ROOT_PASSWORD=<STRONG_PASSWORD>

# Frontend build args - compiled into the bundle, NOT read at runtime
VITE_API_URL=https://api.yourcompany.com/api
VITE_AUTH0_DOMAIN=
VITE_AUTH0_CLIENT_ID=
VITE_POSTHOG_KEY=
VITE_POSTHOG_HOST=https://eu.i.posthog.com
VITE_SENTRY_DSN=
VITE_SENTRY_ENVIRONMENT=production
VITE_SENTRY_TRACES_SAMPLE_RATE=0
VITE_APP_VERSION=<release id>
```

When the frontend image comes from GHCR (the CI path), these values are supplied as repository
secrets instead - see [Required repository secrets](#required-repository-secrets).

### Backend `.env`

```bash
# Server Configuration
PORT=4000
NODE_ENV=production

# Database URL (with connection pooling)
DATABASE_URL="postgresql://postgres:<PASSWORD>@pgbouncer:6432/recruiting_tool_db?schema=public"

# Database Connection Pooling (Production Settings)
DATABASE_POOL_MIN=5
DATABASE_POOL_MAX=20
DATABASE_POOL_ACQUIRE_TIMEOUT=60000
DATABASE_POOL_IDLE_TIMEOUT=600000
DATABASE_POOL_MAX_LIFETIME=1800000
DATABASE_POOL_LOGGING=false

# JWT Secret (CRITICAL - CHANGE THIS!)
JWT_SECRET=<RANDOM_32_CHAR_STRING>
JWT_EXPIRATION=1d

# Admin User
ADMIN_NAME=Admin User
ADMIN_EMAIL=admin@yourcompany.com
ADMIN_PASSWORD=<STRONG_PASSWORD>

# File Storage (AWS S3 or MinIO)
S3_ENDPOINT=https://s3.amazonaws.com
S3_PUBLIC_ENDPOINT=https://s3.amazonaws.com
S3_BUCKET_NAME=your-production-bucket
S3_ACCESS_KEY_ID=<AWS_ACCESS_KEY>
S3_SECRET_ACCESS_KEY=<AWS_SECRET_KEY>
S3_REGION=us-east-1
S3_FORCE_PATH_STYLE=false

# Email (Resend HTTP API - SMTP_PASSWORD is the Resend API key)
SMTP_ENABLED=true
SMTP_PASSWORD=re_<RESEND_LIVE_KEY>
EMAIL_FROM=noreply@yourcompany.com
EMAIL_ADMIN_BCC=admin@yourcompany.com
ENABLE_APPLICATION_EMAILS=true
HR_NOTIFICATION_EMAIL=hr@yourcompany.com

# Frontend URL (the only allowed CORS origin, and the base URL in email links)
FRONTEND_URL=https://recruiting.yourcompany.com
APP_BASE_URL=https://api.yourcompany.com

# Machine-to-machine access - both fail closed when unset
INTERNAL_API_KEY=<openssl rand -hex 32>
METRICS_TOKEN=<openssl rand -hex 32>
WEBHOOK_API_KEY=<SECURE_RANDOM_STRING>

# Error monitoring (optional but strongly recommended)
SENTRY_DSN=https://<key>@o000000.ingest.sentry.io/0000000

# AI (Google Gemini)
GEMINI_API_KEY=<GEMINI_KEY>
GEMINI_MODEL=gemini-1.5-flash
GEMINI_TIER=paid

# Billing (Dodo Payments - there is no Stripe controller in the backend)
DODO_PAYMENTS_API_KEY=<DODO_LIVE_KEY>
DODO_PAYMENTS_WEBHOOK_KEY=whsec_<DODO_WEBHOOK_SECRET>
DODO_PAYMENTS_ENVIRONMENT=live_mode
DODO_PAYMENTS_PROFESSIONAL_PRODUCT_ID=pdt_...
DODO_PAYMENTS_PROFESSIONAL_ANNUAL_PRODUCT_ID=pdt_...
DODO_PAYMENTS_ENTERPRISE_PRODUCT_ID=pdt_...
DODO_PAYMENTS_ENTERPRISE_ANNUAL_PRODUCT_ID=pdt_...

# Auth0 social login (optional - omit all three to disable)
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=<AUTH0_CLIENT_ID>

# Rate limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=300

# Backups
BACKUP_ENABLED=true
BACKUP_CRON=0 2 * * *
BACKUP_RETENTION_DAYS=30
BACKUP_PATH=/backups

# Never seed demo data in production
DUMMY_DATA_ENABLED=false
```

`NODE_ENV=production` is shown above for completeness, but the production overlay sets it on the
backend service, which wins over the `env_file`. Bringing the stack up without the overlay leaves
the container on `NODE_ENV=development` whatever this file says.

### Frontend configuration

The frontend has no runtime environment. Every `VITE_*` value is compiled into the bundle - set
them in the root `.env` (local builds) or as repository secrets (the GHCR build). See
[Configuration Guide](../getting-started/configuration.md#frontend-environment-variables-build-time).

## HTTPS Setup

### Option 1: Nginx Reverse Proxy

**Install Certbot:**
```bash
sudo apt-get install certbot python3-certbot-nginx
```

**Nginx Configuration:**
```nginx
# /etc/nginx/sites-available/recruiting-tool

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name recruiting.yourcompany.com;
    return 301 https://$host$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name recruiting.yourcompany.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/recruiting.yourcompany.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/recruiting.yourcompany.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Frontend
    location / {
        proxy_pass http://localhost:5137;  # ${VITE_PORT:-5137}
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

**Enable Site:**
```bash
sudo ln -s /etc/nginx/sites-available/recruiting-tool /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**Obtain SSL Certificate:**
```bash
sudo certbot --nginx -d recruiting.yourcompany.com
```

### Option 2: Traefik (Docker-Native)

**Add Traefik to docker-compose.yml:**
```yaml
services:
  traefik:
    image: traefik:v2.10
    command:
      - --providers.docker=true
      - --entrypoints.web.address=:80
      - --entrypoints.websecure.address=:443
      - --certificatesresolvers.letsencrypt.acme.email=admin@yourcompany.com
      - --certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json
      - --certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - letsencrypt:/letsencrypt
    networks:
      - app-network

  frontend:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.frontend.rule=Host(`recruiting.yourcompany.com`)"
      - "traefik.http.routers.frontend.entrypoints=websecure"
      - "traefik.http.routers.frontend.tls.certresolver=letsencrypt"

  backend:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.backend.rule=Host(`recruiting.yourcompany.com`) && PathPrefix(`/api`)"
      - "traefik.http.routers.backend.entrypoints=websecure"
      - "traefik.http.routers.backend.tls.certresolver=letsencrypt"

volumes:
  letsencrypt:
```

## Database Backups

### Automated Backup Script

**Create backup script:**
```bash
#!/bin/bash
# /opt/recruiting-tool/backup-db.sh

BACKUP_DIR="/opt/recruiting-tool/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/recruiting_tool_db_$TIMESTAMP.sql"

# Create backup directory
mkdir -p $BACKUP_DIR

# Run backup
docker-compose exec -T db pg_dump -U postgres recruiting_tool_db > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Delete backups older than 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: ${BACKUP_FILE}.gz"
```

**Make executable:**
```bash
chmod +x /opt/recruiting-tool/backup-db.sh
```

**Setup Cron Job:**
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /opt/recruiting-tool/backup-db.sh >> /var/log/recruiting-tool-backup.log 2>&1
```

### Backup Restoration

```bash
# Stop backend
docker-compose stop backend

# Restore from backup
gunzip -c backup_20250115_020000.sql.gz | docker-compose exec -T db psql -U postgres -d recruiting_tool_db

# Restart backend
docker-compose start backend
```

## Monitoring & Alerts

### Health Check Endpoints

Monitor these endpoints:
- **Overall Health:** `https://yourcompany.com/api/health`
- **Liveness:** `https://yourcompany.com/api/health/liveness`
- **Readiness:** `https://yourcompany.com/api/health/readiness`
- **Database Pool:** `https://yourcompany.com/api/health/database/pool`

### Uptime Monitoring

Use services like:
- UptimeRobot
- Pingdom
- Datadog
- New Relic

**Setup:**
1. Monitor `/api/health/liveness` endpoint
2. Check interval: 1-5 minutes
3. Alert on HTTP status != 200
4. Alert on response time > 5 seconds

### Log Aggregation

**Option 1: Docker Logging Driver**
```yaml
# docker-compose.yml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

**Option 2: Centralized Logging (ELK Stack)**
- Elasticsearch for log storage
- Logstash for log processing
- Kibana for visualization

## Performance Optimization

### Enable PgBouncer

```yaml
# docker-compose.yml
backend:
  depends_on:
    pgbouncer:
      condition: service_healthy
  environment:
    - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@pgbouncer:6432/recruiting_tool_db?schema=public
```

### Resource Limits

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M

  frontend:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

### CDN for Static Assets (Optional)

Use CloudFlare, AWS CloudFront, or similar for frontend static assets.

## Scaling

### Horizontal Scaling

**Option 1: Multiple Backend Instances**
```yaml
backend:
  deploy:
    replicas: 3
```

**Option 2: Load Balancer**
- Use Nginx, HAProxy, or AWS ALB
- Distribute traffic across multiple backend containers
- Session affinity not required (stateless JWT)

### Database Scaling

**Read Replicas:**
- PostgreSQL read replicas for read-heavy workloads
- Route read queries to replicas

**Connection Pooling:**
- PgBouncer for connection management
- Pool size: `(max_connections - 30) / number_of_app_instances`

## Security Hardening

### Disable Unused Services

- **pgAdmin** and **PgBouncer** already sit behind `profiles: [tools]` - simply do not pass
  `--profile tools`. Use an SSH tunnel for ad-hoc database access.
- **stripe-cli** sits behind `profiles: [stripe]` and forwards to a route the backend does not
  serve. Leave it off.
- **n8n** starts by default. Remove the service, or firewall port 5678, if you do not use it.

### Rate Limiting

A single global throttler is installed as an `APP_GUARD`. Its defaults in code are
`THROTTLE_TTL=60000` ms and `THROTTLE_LIMIT=100`, tracked per (client IP, route path) using the
first entry of `X-Forwarded-For`. Per-route limits (login, register, AI, public application
submission) are hardcoded in their controllers, not configured by environment variables.

Budget the global values against real traffic before launch: everyone behind one office NAT shares
a bucket per route. Never set `THROTTLE_DISABLED=true` in production.

**See:** [Rate Limiting](../getting-started/configuration.md#rate-limiting) for the full table of
per-route limits, exempt prefixes and response headers.

### Firewall Rules

```bash
# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow SSH
sudo ufw allow 22/tcp

# Block direct access to services
sudo ufw deny 4000/tcp  # Backend
sudo ufw deny 5432/tcp  # PostgreSQL
sudo ufw deny 9000/tcp  # MinIO
sudo ufw deny 9001/tcp  # MinIO Console

# Enable firewall
sudo ufw enable
```

## Disaster Recovery

### Backup Strategy

**What to Backup:**
- PostgreSQL database (daily)
- MinIO data (if not using AWS S3)
- Environment files (securely stored)
- Docker compose configuration

**Retention:**
- Daily backups: 30 days
- Weekly backups: 90 days
- Monthly backups: 1 year

### Recovery Plan

1. Restore database from latest backup
2. Restore file storage from backup
3. Redeploy Docker containers
4. Verify application health
5. Notify users of downtime

## Post-Deployment

### Verify Deployment

- [ ] Frontend accessible via HTTPS
- [ ] Backend API responding
- [ ] `docker-compose $COMPOSE_FILES ps` shows the backend running `node dist/main.js`
- [ ] A deliberate 500 returns a generic message with **no** `stack` field (proves `NODE_ENV=production`)
- [ ] Swagger docs reachable at `/api/docs` and `/api/internal-docs`, or blocked at the proxy
- [ ] Database migrations applied
- [ ] Admin user can login
- [ ] Email notifications working
- [ ] File uploads working, and their URLs use `S3_PUBLIC_ENDPOINT`
- [ ] `/api/health/liveness` and `/api/health/readiness` return 200
- [ ] `GET /api/metrics` returns data with the `METRICS_TOKEN` bearer and 401 without it

### Monitor First 24 Hours

- Check error logs every 2 hours
- Monitor resource usage (CPU, RAM, disk)
- Watch for unusual traffic patterns
- Verify backup jobs ran successfully

### Update Documentation

- Document production URLs
- Update team access credentials
- Document backup procedures
- Create runbook for common issues

## Troubleshooting

### High CPU Usage

```bash
# Check container resource usage
docker stats

# Check slow queries
docker-compose exec db psql -U postgres -d recruiting_tool_db

# View query statistics
SELECT * FROM pg_stat_activity WHERE state = 'active';
```

### High Memory Usage

```bash
# Check memory usage
free -h

# Restart containers if needed
docker-compose restart backend
```

### Database Connection Pool Exhausted

```bash
# Check pool stats
curl https://yourcompany.com/api/health/database/pool

# If utilization > 90%, increase pool size
# Update .env:
DATABASE_POOL_MAX=30
```

## Next Steps

- [Docker Deployment](./docker.md) - Compose services, profiles and commands
- [Configuration Guide](../getting-started/configuration.md) - All environment variables
- [External APIs - Production Activation](../EXTERNAL_APIS_PRODUCTION.md) - Per-service activation steps
- [Backup and Restore](../../recruiting-tool-backend/docs/BACKUP_RESTORE.md) - Database backups
- [Rate Limiting](../../recruiting-tool-backend/docs/RATE_LIMITING.md) - Throttler internals
