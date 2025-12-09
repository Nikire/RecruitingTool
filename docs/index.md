# Recruiting Tool Documentation

Welcome to the Recruiting Tool documentation. This comprehensive guide will help you get started, understand the features, and integrate with the API.

## About Recruiting Tool

Recruiting Tool is a modern, full-stack recruiting and HR management application designed to streamline the entire hiring process. From posting job positions to managing candidates through multi-stage recruitment workflows, Recruiting Tool provides HR teams with powerful tools to find the best talent efficiently.

## Key Features

- **Job Position Management** - Create, publish, and manage job openings
- **Candidate Tracking** - Comprehensive candidate profiles with notes and file uploads
- **Multi-Stage Hiring Process** - Customizable recruitment workflows with stage templates
- **Interview Scheduling** - Built-in interview management with calendar integration
- **Public Careers Page** - Applicant-facing job board with online applications
- **Analytics Dashboard** - Track hiring metrics, conversion rates, and time-to-hire
- **Multi-Tenant Support** - Company-based isolation with role-based access control
- **Email Notifications** - Automated notifications for applications, interviews, and status changes
- **File Storage** - Resume uploads with S3-compatible MinIO storage
- **Scorecard Evaluations** - Structured interview feedback and consensus tracking

## Tech Stack

### Backend
- **Framework**: NestJS v10 (TypeScript)
- **Database**: PostgreSQL 15 with Prisma ORM v6
- **Authentication**: JWT with role-based authorization
- **API Documentation**: Swagger/OpenAPI
- **File Storage**: MinIO (S3-compatible)
- **Email**: SendGrid integration

### Frontend
- **Framework**: React 19 (TypeScript)
- **Build Tool**: Vite 6
- **UI Library**: Material-UI v7
- **State Management**: Jotai (atomic state)
- **Data Fetching**: TanStack React Query v5
- **Forms**: React Hook Form
- **Routing**: React Router v7

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Connection Pooling**: PgBouncer (optional)
- **Workflow Automation**: n8n integration
- **Payments**: Stripe integration

## Quick Links

### Getting Started
- [Installation Guide](./getting-started/installation.md) - Set up the application locally
- [Configuration](./getting-started/configuration.md) - Environment variables and settings
- [Quick Start](./getting-started/quick-start.md) - Get up and running in 5 minutes

### User Guide
- [Candidates](./user-guide/candidates.md) - Managing candidate profiles
- [Job Positions](./user-guide/job-positions.md) - Creating and managing job postings
- [Hiring Process](./user-guide/hiring-process.md) - Multi-stage recruitment workflows
- [Interviews](./user-guide/interviews.md) - Scheduling and managing interviews
- [Team Management](./user-guide/team-management.md) - User roles and permissions

### API Documentation
- [Authentication](./api/authentication.md) - JWT authentication and authorization
- [Candidates API](./api/candidates.md) - Candidate management endpoints
- [Job Positions API](./api/job-positions.md) - Job position endpoints
- [Hiring Process API](./api/hiring-process.md) - Hiring process workflows

### Deployment
- [Docker Deployment](./deployment/docker.md) - Production Docker setup
- [Production Guide](./deployment/production.md) - Production best practices

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  - Material-UI Components                                    │
│  - React Query (API State)                                   │
│  - Jotai (Global State)                                      │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/REST (Axios)
┌────────────────────▼────────────────────────────────────────┐
│                     Backend (NestJS)                         │
│  - Controllers (API Routes)                                  │
│  - Services (Business Logic)                                 │
│  - Guards (Auth & Authorization)                             │
│  - DTOs (Validation)                                         │
└────────────────────┬────────────────────────────────────────┘
                     │ Prisma ORM
┌────────────────────▼────────────────────────────────────────┐
│                   PostgreSQL Database                        │
│  - User, Company, JobPosition                                │
│  - Candidate, HiringProcess, Stage                           │
│  - Application, Interview, Scorecard                         │
└──────────────────────────────────────────────────────────────┘
```

## Support & Community

- **GitHub Issues**: [Report bugs or request features](https://github.com/Nikire/RecruitingTool/issues)
- **GitHub Milestones**: [View project roadmap](https://github.com/Nikire/RecruitingTool/milestones)
- **License**: See [LICENSE](../LICENSE) file

## Documentation Version

This documentation is for Recruiting Tool **v1.0.0** (current development version).

Last updated: December 6, 2025
