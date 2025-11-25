---
tags: [index, getting-started, quick-reference]
created: 2025-11-24
category: Index
status: current
---

# Quick Start Guide

Get up and running with the Recruiting Tool development environment in minutes.

## Prerequisites

Before you begin, ensure you have:
- **Docker Desktop** installed and running
- **Git** for version control
- **Node.js** (v18+) and **Yarn** package manager
- **IDE** (VS Code recommended)
- **Obsidian** (for viewing this documentation vault)

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Nikire/RecruitingTool.git
cd RecruitingTool
```

### 2. Set Up Environment Variables

Create `.env` files in the root and both backend/frontend directories:

**Root `.env`:**
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
API_PORT=4000
VITE_PORT=5137
PGADMIN_EMAIL=admin@example.com
PGADMIN_PASSWORD=admin_password
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
```

**Backend `.env`** (recruiting-tool-backend/.env):
```env
PORT=4000
DATABASE_URL=postgresql://postgres:your_password@db:5432/recruiting_tool_db
STORAGE_TYPE=local
S3_ENDPOINT=http://minio:9000
S3_BUCKET_NAME=recruiting-files
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin
S3_REGION=us-east-1
S3_FORCE_PATH_STYLE=true
JWT_SECRET=your_jwt_secret_here
ADMIN_NAME=Admin User
ADMIN_PASSWORD=admin123
ADMIN_EMAIL=admin@example.com
FRONTEND_URL=http://localhost:5137
```

**Frontend `.env`** (recruiting-tool-frontend/.env):
```env
VITE_API_URL=http://localhost:4000
VITE_PORT=5137
```

### 3. Start Docker Services

```bash
docker-compose up -d --build
```

This will start:
- PostgreSQL database (port 5432)
- PgAdmin (port 8080)
- NestJS backend (port 4000)
- React frontend (port 5137)
- MinIO storage (ports 9000, 9001)

### 4. Access the Application

- **Frontend**: http://localhost:5137
- **Backend API**: http://localhost:4000
- **API Documentation**: http://localhost:4000/api
- **PgAdmin**: http://localhost:8080
- **MinIO Console**: http://localhost:9001

### 5. Login with Admin Account

Use the credentials from your backend `.env`:
- **Email**: admin@example.com
- **Password**: admin123

## Quick Development Commands

### Docker Operations

```bash
# Rebuild after backend changes
docker-compose up -d --build backend

# Rebuild after frontend changes
docker-compose up -d --build frontend

# Rebuild everything
docker-compose up -d --build

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop all services
docker-compose down

# Stop and remove volumes (fresh start)
docker-compose down -v
```

### Package Management (Use Yarn Only!)

```bash
# Add dependency (backend)
cd recruiting-tool-backend
yarn add package-name

# Add dependency (frontend)
cd recruiting-tool-frontend
yarn add package-name

# Install dependencies
yarn install
```

### Database Operations

```bash
# Create a migration
cd recruiting-tool-backend
npx prisma migrate dev --name descriptive_name

# View database in Prisma Studio
npx prisma studio

# Reset database (WARNING: destroys data)
npx prisma migrate reset
```

### Type Checking

```bash
# Frontend type check
cd recruiting-tool-frontend
yarn typecheck

# Backend type check
cd recruiting-tool-backend
yarn typecheck
```

## Project Structure Overview

```
RecruitingTool/
├── recruiting-tool-backend/     # NestJS backend
│   ├── src/
│   │   ├── modules/            # Feature modules
│   │   └── main.ts            # Entry point
│   └── prisma/
│       └── schema.prisma      # Database schema
├── recruiting-tool-frontend/    # React frontend
│   ├── src/
│   │   ├── api/               # API services
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── hooks/             # React Query hooks
│   │   └── main.tsx          # Entry point
├── .claude/                    # Agent configurations & docs
│   ├── agents/                # Specialized agent configs
│   └── docs/                  # Detailed documentation
├── docs-vault/                 # This Obsidian vault
└── docker-compose.yml         # Docker configuration
```

## Development Workflow

### Making Changes

1. **Identify the task**: Check [[Agent-Overview|specialized agents]] for the right tool
2. **Make changes**: Edit code in your IDE
3. **Rebuild Docker**: `docker-compose up -d --build [service]`
4. **Test changes**: Verify in browser and check logs
5. **Type check**: Run `yarn typecheck` before committing
6. **Get approval**: Wait for testing confirmation
7. **Commit**: Create meaningful commit messages

### Using Specialized Agents

The project uses specialized AI agents for development tasks:

- **fullstack-feature**: Complete features (database → backend → frontend)
- **ui-component-specialist**: React UI/UX work
- **database-specialist**: Schema changes and migrations
- **api-integration-architect**: API design and integrations
- **git-workflow-manager**: Git operations and GitHub workflow

See [[Agent-Overview|Agent Overview]] for complete details.

## Common Tasks

### Create a New Feature

1. Use the **fullstack-feature** agent
2. Describe the feature requirements
3. Agent will handle database, backend, and frontend changes
4. Review and test the implementation
5. Approve for commit

### Fix a UI Issue

1. Use the **ui-component-specialist** agent
2. Describe the UI problem
3. Agent will update components with proper i18n
4. Review visual changes
5. Approve for commit

### Add API Endpoint

1. Use the **api-integration-architect** agent
2. Specify endpoint requirements
3. Agent creates controller, service, and DTOs
4. Test with API documentation at /api
5. Update frontend hooks if needed

### Change Database Schema

1. Use the **database-specialist** agent
2. Describe schema changes
3. Agent updates schema.prisma and creates migration
4. Agent updates dummy data
5. Docker rebuild happens automatically

## Critical Rules

### DO:
- ✅ Use **Yarn** for package management (NEVER npm)
- ✅ Use **UIDs** in all external APIs (never numeric IDs)
- ✅ Use **i18n** for ALL user-facing text (useTranslation hook)
- ✅ **Rebuild Docker** after code changes
- ✅ **Wait for approval** before committing
- ✅ **Run type check** before commits
- ✅ **Update documentation** after features

### DON'T:
- ❌ Mix npm and yarn (creates conflicting lock files)
- ❌ Expose numeric IDs in APIs, DTOs, or Frontend
- ❌ Hardcode user-facing text (must use i18n)
- ❌ Commit without user approval
- ❌ Skip Docker rebuild
- ❌ Include AI attribution in commits

## Troubleshooting

### Docker Issues

**Containers won't start:**
```bash
# Check Docker Desktop is running
docker ps

# View error logs
docker-compose logs backend
docker-compose logs frontend

# Fresh restart
docker-compose down -v
docker-compose up -d --build
```

**Database connection errors:**
- Check `.env` DATABASE_URL matches docker-compose.yml
- Ensure PostgreSQL container is healthy: `docker-compose ps`
- Try database reset: `cd recruiting-tool-backend && npx prisma migrate reset`

### Package Issues

**Conflicting lock files:**
```bash
# Remove package-lock.json if it exists
rm package-lock.json
rm -rf node_modules
yarn install
```

### Type Errors

**TypeScript errors after changes:**
```bash
cd recruiting-tool-frontend
yarn typecheck

cd recruiting-tool-backend
yarn typecheck
```

## Next Steps

Now that you're set up:

1. Read [[Architecture-Overview|Architecture Overview]] to understand the system
2. Explore [[API-Overview|API Documentation]] to see available endpoints
3. Review [[Database-Schema|Database Schema]] to understand data models
4. Check [[Feature-Overview|Current Features]] to see what's implemented
5. Learn about [[Agent-Overview|Specialized Agents]] for efficient development

## Related Notes

- [[Technology-Stack|Technology Stack]]
- [[Architecture-Overview|Architecture Overview]]
- [[Development-Workflow|Development Workflow]]
- [[Docker-Workflow|Docker Workflow]]
- [[Agent-Overview|Agent Overview]]

## Additional Resources

- **GitHub Repository**: https://github.com/Nikire/RecruitingTool
- **GitHub Issues**: https://github.com/Nikire/RecruitingTool/issues
- **API Documentation**: http://localhost:4000/api (when running)
- **Project Documentation**: `.claude/docs/` folder

---

**Questions?** Check the [[Architecture-Overview|Architecture Overview]] or explore specific topics in the vault navigation.
