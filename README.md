# BorderLess

**EMP Employment Solutions**

BorderLess is a modern, AI-powered applicant tracking system (ATS) designed for small and medium businesses. It provides a comprehensive solution to manage the entire hiring process - from posting job positions to onboarding new hires - helping HR teams find the best talent efficiently.

## Why BorderLess?

The name "BorderLess" represents our vision of breaking down barriers in recruitment:
- **No Geographic Borders** - Hire talent from anywhere in the world
- **No Budget Barriers** - Enterprise features at SMB-friendly pricing
- **No Technical Limits** - Self-hosted or cloud, your choice
- **No Process Constraints** - Fully customizable hiring workflows

## Features

- **User Management**: Role-based access control (USER, HR, ADMIN, SUPER_ADMIN)
- **Company Management**: Multi-company support with user associations
- **Job Positions**: Create and manage job positions with customizable stages
- **Hiring Processes**: Track candidates through customized hiring workflows
- **Candidate Management**: Full CRUD operations with profile management
- **AI-Powered Screening**: Intelligent resume parsing and candidate scoring
- **Interview Scheduling**: Automated scheduling with calendar integration
- **File Storage**: Upload and manage candidate documents (resumes, cover letters, etc.)
  - Drag-and-drop file upload with visual feedback
  - Support for PDF, DOC, DOCX, and TXT files (max 10MB)
  - MinIO (S3-compatible) storage for local development
  - AWS S3 support for production environments
  - Secure file downloads with signed URLs
- **User Profiles**: Customizable user profiles with profile pictures
- **Authentication**: JWT-based authentication with secure token management
- **Real-time Notifications**: In-app and email notifications for key events
- **Multi-language Support**: English and Spanish out of the box

## Installation (Docker)

1. Setup `.env` files on the root of the project and in every module that requires a `.env` file setup (see `.env.example` files for reference)

2. Run the following command to build the docker image:

```bash
docker-compose build
```

3. Run the following command to start the docker container:

```bash
docker-compose up
```

## Services

The application consists of the following Docker services:

- **Frontend**: React + TypeScript + Material-UI (port 3000)
- **Backend**: NestJS + Prisma ORM (port 4000)
- **Database**: PostgreSQL (port 5432)
- **MinIO**: S3-compatible object storage (port 9000, web UI: 9001)

## File Storage Configuration

The application uses MinIO for local development and can be configured to use AWS S3 for production.

**MinIO Web UI**: Access at `http://localhost:9001`
- Username: `minioadmin`
- Password: `minioadmin`

**Environment Variables** (see `.env.example` files):
- `STORAGE_TYPE`: `local` (MinIO) or `s3` (AWS)
- `S3_ENDPOINT`: MinIO URL for local, AWS URL for production
- `S3_BUCKET_NAME`: Bucket name for file storage
- `S3_ACCESS_KEY_ID`: Access key
- `S3_SECRET_ACCESS_KEY`: Secret key
- `S3_REGION`: AWS region (for production)

## Package Manager

**IMPORTANT**: This project uses Yarn exclusively for package management.

- ✅ Always use `yarn add <package>` (NOT `npm install`)
- ✅ Always use `yarn remove <package>` (NOT `npm uninstall`)
- ✅ Always use `yarn install` (NOT `npm install`)
- ❌ Never create `package-lock.json` - only `yarn.lock` should exist

## API Documentation

You can see the API documentation by visiting the following URL once you got the app running: `http://localhost:{YOUR-SELECTED-BACKEND-PORT}/api`

## Tech Stack

**Backend:**
- NestJS + TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication

**Frontend:**
- React 19 + TypeScript
- Vite
- Material-UI (MUI)
- React Query + Jotai
- react-i18next

**Infrastructure:**
- Docker + Docker Compose
- MinIO (S3-compatible storage)
- Stripe (payments)

## License

Copyright © 2024-2025 EMP Employment Solutions. All rights reserved.

---

**BorderLess** - *Breaking down barriers in recruitment*
