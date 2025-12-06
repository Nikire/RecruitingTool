# Configuration Guide

This guide covers all configuration options for Recruiting Tool, including environment variables, database settings, and third-party integrations.

## Environment Variables Reference

### Root Environment Variables (`.env`)

These variables are used by Docker Compose to configure all services.

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `POSTGRES_USER` | PostgreSQL username | `postgres` | Yes |
| `POSTGRES_PASSWORD` | PostgreSQL password | - | Yes |
| `API_PORT` | Backend API port | `4000` | Yes |
| `VITE_PORT` | Frontend development port | `3000` | Yes |
| `PGADMIN_EMAIL` | pgAdmin login email | - | Yes |
| `PGADMIN_PASSWORD` | pgAdmin login password | - | Yes |
| `MINIO_ROOT_USER` | MinIO admin username | `minioadmin` | Yes |
| `MINIO_ROOT_PASSWORD` | MinIO admin password | `minioadmin` | Yes |
| `N8N_USER` | n8n login username | `admin` | No |
| `N8N_PASSWORD` | n8n login password | `admin123` | No |
| `N8N_HOST` | n8n host URL | `localhost` | No |
| `WEBHOOK_API_KEY` | Webhook authentication key | - | No |
| `STRIPE_SECRET_KEY` | Stripe API secret key | - | No |

### Backend Environment Variables (`recruiting-tool-backend/.env`)

#### Server Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Backend server port | `4000` | Yes |
| `NODE_ENV` | Environment mode | `development` | Yes |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` | Yes |

#### Database Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | - | Yes |
| `DATABASE_POOL_MIN` | Minimum connections | `2` | No |
| `DATABASE_POOL_MAX` | Maximum connections | `10` | No |
| `DATABASE_POOL_ACQUIRE_TIMEOUT` | Timeout for acquiring connection (ms) | `60000` | No |
| `DATABASE_POOL_IDLE_TIMEOUT` | Timeout before closing idle connection (ms) | `600000` | No |
| `DATABASE_POOL_MAX_LIFETIME` | Max connection lifetime (ms) | `1800000` | No |
| `DATABASE_POOL_LOGGING` | Enable pool logging | `false` | No |

**Connection Pooling Best Practices:**
- Development: `DATABASE_POOL_MAX=10`
- Production: `DATABASE_POOL_MAX=20`
- See [Database Architecture](../../.claude/docs/DATABASE.md#connection-pooling) for sizing guidelines

#### Authentication Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `JWT_EXPIRATION` | JWT token expiration | `1d` | No |
| `ADMIN_NAME` | Default admin user name | - | Yes |
| `ADMIN_EMAIL` | Default admin email | - | Yes |
| `ADMIN_PASSWORD` | Default admin password | - | Yes |

**Security Notes:**
- Use a strong random string for `JWT_SECRET` (minimum 32 characters)
- Change `ADMIN_PASSWORD` immediately after first login
- Never commit credentials to version control

#### File Storage Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `STORAGE_TYPE` | Storage backend type | `local` | Yes |
| `S3_ENDPOINT` | MinIO/S3 endpoint URL | `http://minio:9000` | Yes |
| `S3_BUCKET_NAME` | S3 bucket name | `recruiting-tool-uploads` | Yes |
| `S3_ACCESS_KEY_ID` | S3 access key | `minioadmin` | Yes |
| `S3_SECRET_ACCESS_KEY` | S3 secret key | `minioadmin` | Yes |
| `S3_REGION` | S3 region | `us-east-1` | Yes |
| `S3_FORCE_PATH_STYLE` | Use path-style URLs (MinIO) | `true` | Yes |

**Storage Types:**
- `local` - Use MinIO (S3-compatible, self-hosted)
- `s3` - Use AWS S3 (production recommended)

#### Email Configuration (SendGrid)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `SENDGRID_API_KEY` | SendGrid API key | - | No |
| `SENDGRID_FROM_EMAIL` | Sender email address | - | No |
| `SENDGRID_FROM_NAME` | Sender display name | `Recruiting Tool` | No |

**Email Features:**
- Application confirmations
- Interview notifications
- Status change alerts
- Team notifications

**To enable emails:**
1. Sign up at [SendGrid](https://sendgrid.com)
2. Create API key with "Mail Send" permissions
3. Verify sender email
4. Update `SENDGRID_API_KEY` in `.env`

#### Webhook Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `WEBHOOK_API_KEY` | API key for webhook authentication | - | No |

**Used for:**
- n8n workflow automation
- External integrations
- Custom webhooks

### Frontend Environment Variables (`recruiting-tool-frontend/.env`)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:4000/api` | Yes |
| `VITE_PORT` | Development server port | `3000` | Yes |

## Database Configuration

### Connection String Format

```
postgresql://[user]:[password]@[host]:[port]/[database]?[parameters]
```

**Example:**
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/recruiting_tool_db?schema=public&connection_limit=10&pool_timeout=60"
```

**Parameters:**
- `schema` - Database schema (default: `public`)
- `connection_limit` - Max connections in pool
- `pool_timeout` - Timeout for acquiring connection (seconds)
- `connect_timeout` - Connection establishment timeout (seconds)

### Using PgBouncer (Production)

For production deployments with high load, enable PgBouncer for advanced connection pooling:

1. Uncomment PgBouncer in `docker-compose.yml`:
```yaml
depends_on:
  pgbouncer:
    condition: service_healthy
```

2. Update `DATABASE_URL` to use PgBouncer:
```bash
DATABASE_URL="postgresql://postgres:password@pgbouncer:6432/recruiting_tool_db?schema=public"
```

3. Restart containers:
```bash
docker-compose up -d --build backend
```

**PgBouncer Configuration:**
- Pool mode: `transaction`
- Max client connections: 100
- Default pool size: 20
- Min pool size: 5
- Reserve pool: 5

## File Storage Configuration

### MinIO (Self-Hosted S3)

**Default setup for development:**

```bash
# Backend .env
STORAGE_TYPE=local
S3_ENDPOINT=http://minio:9000
S3_BUCKET_NAME=recruiting-tool-uploads
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin
S3_REGION=us-east-1
S3_FORCE_PATH_STYLE=true
```

**Access MinIO Console:**
- URL: http://localhost:9001
- Username: `minioadmin` (from `MINIO_ROOT_USER`)
- Password: `minioadmin` (from `MINIO_ROOT_PASSWORD`)

### AWS S3 (Production)

**For production deployments:**

```bash
# Backend .env
STORAGE_TYPE=s3
S3_ENDPOINT=https://s3.amazonaws.com
S3_BUCKET_NAME=your-production-bucket
S3_ACCESS_KEY_ID=your-aws-access-key
S3_SECRET_ACCESS_KEY=your-aws-secret-key
S3_REGION=us-east-1
S3_FORCE_PATH_STYLE=false
```

**AWS S3 Setup:**
1. Create S3 bucket
2. Create IAM user with S3 permissions
3. Generate access key
4. Update environment variables
5. Restart backend

**Required IAM Permissions:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket-name",
        "arn:aws:s3:::your-bucket-name/*"
      ]
    }
  ]
}
```

## Email Notification Configuration

### SendGrid Setup

1. **Create SendGrid Account**:
   - Sign up at https://sendgrid.com
   - Free tier: 100 emails/day

2. **Generate API Key**:
   - Navigate to Settings → API Keys
   - Click "Create API Key"
   - Select "Restricted Access"
   - Enable "Mail Send" permission
   - Copy API key (shown once)

3. **Verify Sender Email**:
   - Navigate to Settings → Sender Authentication
   - Click "Verify a Single Sender"
   - Fill form and verify email

4. **Update Environment Variables**:
```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@yourcompany.com
SENDGRID_FROM_NAME=Your Company Recruiting
```

5. **Restart Backend**:
```bash
docker-compose restart backend
```

### Email Templates

Email templates are managed in the application:
- Navigate to **Admin Panel** → **Email Templates**
- Create custom templates for:
  - Application confirmations
  - Interview invitations
  - Interview cancellations
  - Status change notifications

**Available Variables:**
- `{{candidateName}}` - Candidate's full name
- `{{positionTitle}}` - Job position title
- `{{companyName}}` - Company name
- `{{hrName}}` - HR contact name
- `{{interviewDate}}` - Interview date
- `{{interviewTime}}` - Interview time
- `{{meetingLink}}` - Meeting link (Zoom, Google Meet, etc.)

## Third-Party Integrations

### n8n Workflow Automation

n8n is included for workflow automation (optional).

**Access n8n:**
- URL: http://localhost:5678
- Username: `admin` (from `N8N_USER`)
- Password: `admin123` (from `N8N_PASSWORD`)

**Example Workflows:**
- Slack notifications on new applications
- Zapier-like automation
- Custom webhook integrations

**See:** [N8N Integration Guide](../../.claude/docs/N8N_INTEGRATION.md)

### Google Calendar Integration

For interview scheduling with Google Calendar:

1. Create Google Cloud Project
2. Enable Google Calendar API
3. Create OAuth 2.0 credentials
4. Update backend configuration

**See:** [Google Calendar Setup](../../.claude/docs/GOOGLE_CALENDAR_SETUP.md)

### Stripe Integration

For subscription and payment features:

```bash
# Root .env
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxx

# Backend .env
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxx
```

**Stripe CLI (Development):**
```bash
# Included in docker-compose.yml
# Webhook signing secret will be displayed in logs:
docker logs recruitingtool-stripe-cli
```

## CORS Configuration

CORS is configured in backend to allow frontend requests.

**Backend CORS Settings** (`src/main.ts`):
```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
});
```

**To allow multiple origins:**
```typescript
app.enableCors({
  origin: [
    'http://localhost:3000',
    'https://yourproductiondomain.com',
  ],
  credentials: true,
});
```

## Rate Limiting

Rate limiting is enabled by default to prevent abuse.

**Default Limits:**
- Public endpoints: 100 requests/15 minutes
- Authenticated endpoints: 1000 requests/15 minutes
- File uploads: 10 uploads/hour

**See:** [Rate Limiting Documentation](../../recruiting-tool-backend/docs/RATE_LIMITING.md)

## Logging Configuration

### Backend Logging

Logs are output to stdout and captured by Docker.

**View logs:**
```bash
# All backend logs
docker-compose logs backend

# Follow logs (tail -f)
docker-compose logs -f backend

# Filter errors only
docker-compose logs backend | grep ERROR
```

**Log Levels:**
- `error` - Critical errors
- `warn` - Warnings
- `log` - General information
- `debug` - Detailed debug info (development only)

### Slow Query Logging

Database queries slower than 100ms are automatically logged.

**Example:**
```
[WARN] Slow query detected (150ms): SELECT "Candidate"."id", ...
```

## Health Check Endpoints

Monitor application health:

| Endpoint | Purpose | Public |
|----------|---------|--------|
| `/api/health` | Overall health | Yes |
| `/api/health/liveness` | Kubernetes liveness probe | Yes |
| `/api/health/readiness` | Kubernetes readiness probe | Yes |
| `/api/health/detailed` | Detailed system info | Yes |
| `/api/health/database` | Database status | Yes |
| `/api/health/database/pool` | Connection pool stats | Yes |
| `/api/health/storage` | MinIO/S3 status | Yes |
| `/api/health/email` | Email service status | Yes |

## Production Configuration

### Security Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` to strong random string
- [ ] Change default admin password
- [ ] Update all default passwords (database, MinIO, pgAdmin)
- [ ] Enable HTTPS with valid SSL certificates
- [ ] Set `NODE_ENV=production`
- [ ] Use AWS S3 instead of MinIO (optional)
- [ ] Enable PgBouncer for connection pooling
- [ ] Set up database backups
- [ ] Configure log aggregation
- [ ] Enable monitoring and alerts
- [ ] Review and update CORS settings
- [ ] Enable rate limiting
- [ ] Set up CDN for static assets

### Performance Optimization

**Production `.env` settings:**
```bash
# Backend
NODE_ENV=production
DATABASE_POOL_MAX=20
DATABASE_POOL_MIN=5

# Use PgBouncer
DATABASE_URL="postgresql://user:pass@pgbouncer:6432/recruiting_tool_db?schema=public"

# Enable production logging
DATABASE_POOL_LOGGING=false
```

**See:** [Production Deployment Guide](../deployment/production.md)

## Troubleshooting Configuration

### Environment Variables Not Loading

**Problem**: Changes to `.env` not taking effect

**Solution**:
```bash
# Restart containers to reload environment
docker-compose down
docker-compose up -d

# For backend only
docker-compose restart backend
```

### Database Connection Errors

**Problem**: "Connection refused" or "Cannot connect to database"

**Solution**:
1. Check `DATABASE_URL` format
2. Verify database container is running: `docker-compose ps db`
3. Check database logs: `docker-compose logs db`
4. Ensure port 5432 is not in use by another service

### File Upload Errors

**Problem**: "Failed to upload file" or "Storage not configured"

**Solution**:
1. Check MinIO is running: `docker-compose ps minio`
2. Verify `S3_ENDPOINT` is accessible
3. Check bucket exists in MinIO Console
4. Verify credentials match `MINIO_ROOT_USER` and `MINIO_ROOT_PASSWORD`

### Email Not Sending

**Problem**: Emails not being sent or delivered

**Solution**:
1. Check `SENDGRID_API_KEY` is valid
2. Verify sender email is verified in SendGrid
3. Check email service health: `curl http://localhost:4000/api/health/email`
4. Review backend logs for email errors

## Next Steps

- [Quick Start Guide](./quick-start.md) - Get started with your first job
- [User Guide](../user-guide/candidates.md) - Learn how to use features
- [API Documentation](../api/authentication.md) - Integrate with the API
