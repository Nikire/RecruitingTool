# Production Deployment Guide

Complete checklist and best practices for deploying Recruiting Tool to production.

## Pre-Deployment Checklist

### Security

- [ ] Change `JWT_SECRET` to strong random string (32+ characters)
- [ ] Change default admin password
- [ ] Update all database passwords
- [ ] Change MinIO credentials (or use AWS S3)
- [ ] Enable HTTPS with valid SSL certificates
- [ ] Set `NODE_ENV=production`
- [ ] Review and update CORS settings
- [ ] Enable rate limiting
- [ ] Disable pgAdmin in production (remove from docker-compose.yml)
- [ ] Disable Swagger documentation (or protect with auth)

### Configuration

- [ ] Configure SendGrid for email notifications
- [ ] Set up AWS S3 for file storage (instead of MinIO)
- [ ] Enable PgBouncer for connection pooling
- [ ] Configure database backups
- [ ] Set up log aggregation
- [ ] Configure monitoring and alerts
- [ ] Set up CDN for static assets (optional)

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

```bash
# PostgreSQL Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<STRONG_PASSWORD_HERE>

# API Configuration
API_PORT=4000

# Frontend Configuration
VITE_PORT=3000

# MinIO (or skip if using AWS S3)
MINIO_ROOT_USER=<STRONG_USERNAME>
MINIO_ROOT_PASSWORD=<STRONG_PASSWORD>

# Stripe
STRIPE_SECRET_KEY=sk_live_<your_live_key>
```

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

# File Storage (AWS S3)
STORAGE_TYPE=s3
S3_ENDPOINT=https://s3.amazonaws.com
S3_BUCKET_NAME=your-production-bucket
S3_ACCESS_KEY_ID=<AWS_ACCESS_KEY>
S3_SECRET_ACCESS_KEY=<AWS_SECRET_KEY>
S3_REGION=us-east-1
S3_FORCE_PATH_STYLE=false

# Email Configuration (SendGrid)
SENDGRID_API_KEY=<SENDGRID_LIVE_KEY>
SENDGRID_FROM_EMAIL=noreply@yourcompany.com
SENDGRID_FROM_NAME=Your Company Recruiting

# Frontend URL (for CORS and emails)
FRONTEND_URL=https://recruiting.yourcompany.com

# Webhook API Key
WEBHOOK_API_KEY=<SECURE_RANDOM_STRING>
```

### Frontend `.env`

```bash
# API Base URL
VITE_API_URL=https://recruiting.yourcompany.com/api

# Frontend Port
VITE_PORT=3000
```

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
        proxy_pass http://localhost:3000;
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

Remove from `docker-compose.yml`:
- pgAdmin (use SSH tunnel for database access)
- n8n (if not used)
- stripe-cli (development only)

### Rate Limiting

Already enabled by default:
- Public endpoints: 100 req/15min
- Auth endpoints: 1000 req/15min

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
- [ ] Swagger docs accessible (or disabled)
- [ ] Database migrations applied
- [ ] Admin user can login
- [ ] Email notifications working
- [ ] File uploads working
- [ ] Health checks passing

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

- [Docker Deployment](./docker.md) - Docker setup details
- [Configuration Guide](../getting-started/configuration.md) - All environment variables
- [Monitoring Best Practices](../../recruiting-tool-backend/docs/BACKUP_RESTORE.md) - Database backups
