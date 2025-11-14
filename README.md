# RecruitingTool

Recruiting tool is a modern app based on HR tools. This app provides a simple way to keep track of recruitments, helping HR teams manage candidates, streamline the hiring process, and make data-driven decisions. It offers features such as applicant tracking, interview scheduling, collaborative feedback, and customizable dashboards to monitor progress. The tool also supports technical interview applications, allowing companies to assess candidates' skills through coding tests, project submissions, and live technical challenges. Additionally, it provides a fully customizable hiring process, enabling HR teams to tailor workflows, evaluation criteria, and interview stages to meet specific organizational needs. With seamless integration to popular job boards, it ensures all recruitment acticvities are centralized for maximum efficiency.

## Features

- **User Management**: Role-based access control (USER, HR, ADMIN, SUPER_ADMIN)
- **Company Management**: Multi-company support with user associations
- **Job Positions**: Create and manage job positions with customizable stages
- **Hiring Processes**: Track candidates through customized hiring workflows
- **Candidate Management**: Full CRUD operations with profile management
- **File Storage**: Upload and manage candidate documents (resumes, cover letters, etc.)
  - Drag-and-drop file upload with visual feedback
  - Support for PDF, DOC, DOCX, and TXT files (max 10MB)
  - MinIO (S3-compatible) storage for local development
  - AWS S3 support for production environments
  - Secure file downloads with signed URLs
- **User Profiles**: Customizable user profiles with profile pictures and additional fields
- **Authentication**: JWT-based authentication with secure token management
- **Toast Notifications**: Real-time feedback for all operations

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

## Swagger

You can see the API documentation by visiting the following URL once you got the app running: `http://localhost:{YOUR-SELECTED-BACKEND-PORT}/api`
