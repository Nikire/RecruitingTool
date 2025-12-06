# Installation Guide

This guide will walk you through setting up Recruiting Tool on your local machine for development or testing.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Docker** (v20.10 or higher) and **Docker Compose** (v2.0 or higher)
- **Git** (for cloning the repository)
- **Node.js** (v18 or higher) - Optional, for running without Docker
- **Yarn** (v1.22 or higher) - Package manager (use yarn, not npm)

### System Requirements

- **OS**: Windows, macOS, or Linux
- **RAM**: Minimum 4GB (8GB recommended)
- **Disk Space**: 2GB free space
- **Network**: Internet connection for downloading dependencies

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/Nikire/RecruitingTool.git
cd RecruitingTool
```

### 2. Set Up Environment Variables

Copy the example environment files and configure them:

```bash
# Root .env file (Docker configuration)
cp .env.example .env

# Backend .env file
cp recruiting-tool-backend/.env.example recruiting-tool-backend/.env

# Frontend .env file
cp recruiting-tool-frontend/.env.example recruiting-tool-frontend/.env
```

#### Root `.env` Configuration

Edit `.env` in the root directory:

```bash
# PostgreSQL Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password_here

# API Configuration
API_PORT=4000

# Frontend Configuration
VITE_PORT=3000

# pgAdmin (Database Management UI)
PGADMIN_EMAIL=admin@example.com
PGADMIN_PASSWORD=admin_password_here

# MinIO (File Storage)
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin

# n8n Workflow Automation (Optional)
N8N_USER=admin
N8N_PASSWORD=admin123
N8N_HOST=localhost

# Webhook API Key
WEBHOOK_API_KEY=your-secure-webhook-api-key-change-in-production

# Stripe (Optional - for subscription features)
STRIPE_SECRET_KEY=sk_test_your_stripe_key_here
```

#### Backend `.env` Configuration

Edit `recruiting-tool-backend/.env`:

```bash
# Server Configuration
PORT=4000
NODE_ENV=development

# Database URL (constructed by Docker Compose)
DATABASE_URL="postgresql://postgres:password@db:5432/recruiting_tool_db?schema=public"

# Database Connection Pooling
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
DATABASE_POOL_ACQUIRE_TIMEOUT=60000
DATABASE_POOL_IDLE_TIMEOUT=600000
DATABASE_POOL_MAX_LIFETIME=1800000
DATABASE_POOL_LOGGING=false

# JWT Secret (IMPORTANT: Change in production!)
JWT_SECRET=your-very-secure-jwt-secret-change-in-production

# Admin User (created on first startup)
ADMIN_NAME=Admin User
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123

# File Storage (MinIO/S3)
STORAGE_TYPE=local
S3_ENDPOINT=http://minio:9000
S3_BUCKET_NAME=recruiting-tool-uploads
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin
S3_REGION=us-east-1
S3_FORCE_PATH_STYLE=true

# Email Configuration (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=noreply@yourcompany.com
SENDGRID_FROM_NAME=Recruiting Tool

# Frontend URL (for CORS and emails)
FRONTEND_URL=http://localhost:3000

# n8n Webhook (Optional)
WEBHOOK_API_KEY=your-secure-webhook-api-key-change-in-production
```

#### Frontend `.env` Configuration

Edit `recruiting-tool-frontend/.env`:

```bash
# API Base URL
VITE_API_URL=http://localhost:4000/api

# Frontend Port
VITE_PORT=3000
```

### 3. Start the Application with Docker

The easiest way to run Recruiting Tool is using Docker Compose:

```bash
docker-compose up -d --build
```

This command will:
1. Build the backend and frontend Docker images
2. Start PostgreSQL database
3. Start MinIO file storage
4. Run database migrations
5. Seed initial admin user
6. Start the backend API server
7. Start the frontend development server
8. Start pgAdmin (database management UI)
9. Start n8n (workflow automation - optional)
10. Start PgBouncer (connection pooling - optional)

### 4. Verify Installation

Check that all containers are running:

```bash
docker-compose ps
```

You should see the following services running:
- `recruiting_backend` - Backend API (port 4000)
- `recruiting_frontend` - Frontend app (port 3000)
- `recruiting_db` - PostgreSQL database (port 5432)
- `recruiting_minio` - File storage (ports 9000, 9001)
- `recruiting_pgadmin` - Database admin UI (port 8080)
- `recruiting_n8n` - Workflow automation (port 5678)
- `recruiting_pgbouncer` - Connection pooling (port 6432)

### 5. Access the Application

Open your browser and navigate to:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **API Documentation (Swagger)**: http://localhost:4000/api
- **pgAdmin**: http://localhost:8080
- **MinIO Console**: http://localhost:9001
- **n8n**: http://localhost:5678

### 6. Login to the Application

Use the default admin credentials (configured in `.env`):

- **Email**: admin@example.com
- **Password**: admin123

**IMPORTANT**: Change these credentials immediately after first login!

## Manual Installation (Without Docker)

If you prefer to run the application without Docker:

### Backend Setup

```bash
cd recruiting-tool-backend

# Install dependencies
yarn install

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed database with initial admin user
npx prisma db seed

# Start development server
yarn start:dev
```

### Frontend Setup

```bash
cd recruiting-tool-frontend

# Install dependencies
yarn install

# Start development server
yarn dev
```

### Database Setup

You'll need to manually install and configure PostgreSQL:

1. Install PostgreSQL 15+
2. Create database: `recruiting_tool_db`
3. Update `DATABASE_URL` in `recruiting-tool-backend/.env`
4. Run migrations: `npx prisma migrate dev`

### File Storage Setup

You'll need to manually install and configure MinIO or use AWS S3:

1. Install MinIO locally or use S3
2. Create bucket: `recruiting-tool-uploads`
3. Update S3 configuration in `recruiting-tool-backend/.env`

## Post-Installation Steps

### 1. Create Your First Company

After logging in as admin:
1. Navigate to **Admin Panel** → **Companies**
2. Click **Create Company**
3. Fill in company details
4. Save

### 2. Invite Team Members

1. Navigate to **Admin Panel** → **Users**
2. Click **Create User**
3. Assign appropriate role (USER, HR, ADMIN)
4. Send credentials to the user

### 3. Configure Email Settings

For email notifications to work:
1. Sign up for SendGrid account
2. Obtain API key
3. Update `SENDGRID_API_KEY` in backend `.env`
4. Restart backend: `docker-compose restart backend`

### 4. Set Up File Storage

MinIO is pre-configured in Docker setup. To verify:
1. Access MinIO Console: http://localhost:9001
2. Login with credentials from `.env`
3. Verify bucket `recruiting-tool-uploads` exists

## Troubleshooting

### Backend Won't Start

**Problem**: Backend container exits immediately

**Solution**:
```bash
# Check backend logs
docker-compose logs backend

# Common issues:
# - Database not ready: Wait for db healthcheck
# - Migration failed: Check DATABASE_URL
# - Missing dependencies: Rebuild image
docker-compose up -d --build backend
```

### Database Connection Errors

**Problem**: "Connection refused" or "Database does not exist"

**Solution**:
```bash
# Check database is running
docker-compose ps db

# Check database logs
docker-compose logs db

# Restart database
docker-compose restart db

# Reset database (WARNING: Deletes all data)
docker-compose down -v
docker-compose up -d
```

### Frontend Can't Connect to Backend

**Problem**: API calls fail with CORS errors

**Solution**:
1. Verify `FRONTEND_URL` in backend `.env` matches frontend URL
2. Verify `VITE_API_URL` in frontend `.env` is correct
3. Restart backend: `docker-compose restart backend`

### Port Already in Use

**Problem**: "Port 4000 is already in use"

**Solution**:
```bash
# Find process using port
# Windows:
netstat -ano | findstr :4000

# Linux/Mac:
lsof -i :4000

# Kill process or change port in .env
API_PORT=5000
```

### Migration Errors

**Problem**: "Migration failed" during startup

**Solution**:
```bash
# Enter backend container
docker-compose exec backend sh

# Run migrations manually
npx prisma migrate deploy

# Check migration status
npx prisma migrate status

# Reset migrations (WARNING: Deletes all data)
npx prisma migrate reset
```

## Next Steps

Now that you have Recruiting Tool installed, check out:

- [Configuration Guide](./configuration.md) - Detailed configuration options
- [Quick Start](./quick-start.md) - Create your first job and hiring process
- [User Guide](../user-guide/job-positions.md) - Learn how to use the features

## Getting Help

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section above
2. Review Docker logs: `docker-compose logs [service-name]`
3. Search [GitHub Issues](https://github.com/Nikire/RecruitingTool/issues)
4. Create a new issue with detailed error messages and logs

## Security Notes

**CRITICAL**: Before deploying to production:

1. Change `JWT_SECRET` to a strong random string
2. Change default admin password
3. Update database passwords
4. Use strong MinIO credentials
5. Enable HTTPS for all endpoints
6. Review and update CORS settings
7. Enable rate limiting
8. Set up database backups

See [Production Guide](../deployment/production.md) for complete security checklist.
