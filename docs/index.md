# BorderLess Documentation

Welcome to the BorderLess documentation. This comprehensive guide will help you get started, understand the features, and integrate with the API.

## About BorderLess

BorderLess is a modern, full-stack recruiting and HR management application designed to streamline the entire hiring process. From posting job positions to managing candidates through multi-stage recruitment workflows, BorderLess provides HR teams with powerful tools to find the best talent efficiently.

## Key Features

- **Job Position Management** - Create, publish, and manage job openings
- **Candidate Tracking** - Comprehensive candidate profiles with notes and file uploads
- **Multi-Stage Hiring Process** - Customizable recruitment workflows with stage templates
- **Async Stages** - Take-home style stages candidates complete on their own time
- **Interview Scheduling** - Built-in interview management with Google Calendar integration
- **Public Careers Page** - Applicant-facing job board with online applications
- **Analytics Dashboard** - Track hiring metrics, conversion rates, and time-to-hire
- **AI Resume Parsing and Scoring** - Google Gemini parses resumes and scores candidates against a position
- **Multi-Tenant Support** - Company-based isolation with role-based access control
- **Email Notifications** - Automated notifications for applications, interviews, and status changes
- **File Storage** - Resume uploads with S3-compatible MinIO storage
- **Subscriptions and Plan Limits** - Dodo Payments checkout with per-plan quotas and feature flags
- **Developer Public API** - Versioned `/api/v1` endpoints authenticated with API keys, plus outbound webhooks
- **Outreach Campaigns and Prospect Tracking** - Email campaigns with open/click tracking and unsubscribe handling
- **Real-Time Updates** - Server-sent events (`/api/sse`) push notifications to the browser

> **Note:** `Scorecard*` tables, a backend scorecard module and React scorecard components exist in the
> codebase, but no page or route currently renders them, so structured interview scorecards are **not
> reachable in the product**.

## Tech Stack

### Backend
- **Framework**: NestJS v11 (TypeScript)
- **Database**: PostgreSQL 17 with Prisma ORM v6
- **Authentication**: JWT with role-based authorization (optional Auth0 social login)
- **API Documentation**: Swagger/OpenAPI at `/api/docs` (public API) and `/api/internal-docs` (internal API)
- **File Storage**: MinIO (S3-compatible) via the AWS S3 SDK
- **Email**: nodemailer transport plus the Resend HTTP API (`https://api.resend.com/emails`)
- **AI**: Google Gemini (`@google/generative-ai`)
- **Error Monitoring**: Sentry (optional, disabled when `SENTRY_DSN` is unset)

### Frontend
- **Framework**: React 19 (TypeScript)
- **Build Tool**: Vite 6
- **UI Library**: Material-UI v7
- **State Management**: Jotai (atomic state)
- **Data Fetching**: TanStack React Query v5
- **Forms**: React Hook Form
- **Routing**: React Router v7
- **Telemetry**: PostHog and Sentry (both optional, disabled when their keys are unset)

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Connection Pooling**: PgBouncer (optional, `tools` compose profile)
- **Workflow Automation**: n8n integration
- **Payments**: Dodo Payments (`/api/billing`)

> **Note:** the `stripe` npm package is still a backend dependency and a `stripe-cli` service exists
> behind the `stripe` compose profile, but there is no Stripe controller - the registered billing
> module is `DodoPaymentsModule`. The `stripe-cli` service forwards to `/api/stripe/webhook`, a route
> that does not exist.

## Quick Links

### Getting Started
- [Installation Guide](./getting-started/installation.md) - Set up the application locally
- [Configuration](./getting-started/configuration.md) - Environment variables and settings
- [Quick Start](./getting-started/quick-start.md) - Get up and running in 5 minutes

### User Guide
- [Candidates](./user-guide/candidates.md) - Managing candidate profiles
- [Job Positions](./user-guide/job-positions.md) - Creating and managing job postings
- [Hiring Process](./user-guide/hiring-process.md) - Multi-stage recruitment workflows
- [Async Stages](./user-guide/async-stages.md) - Stages candidates complete on their own time
- [Interviews](./user-guide/interviews.md) - Scheduling and managing interviews
- [Analytics](./user-guide/analytics.md) - Hiring metrics and pipeline health
- [Email Templates](./user-guide/email-templates.md) - Customizing outgoing emails
- [File Manager](./user-guide/file-manager.md) - Resumes and other uploaded files
- [Subscription and Limits](./user-guide/subscription-and-limits.md) - Plans, quotas and feature flags
- [Team Management](./user-guide/team-management.md) - User roles and permissions

### API Documentation
- [Authentication](./api/authentication.md) - JWT authentication and authorization
- [Candidates API](./api/candidates.md) - Candidate management endpoints
- [Job Positions API](./api/job-positions.md) - Job position endpoints
- [Hiring Process API](./api/hiring-process.md) - Hiring process workflows

### Deployment & Operations
- [Docker Deployment](./deployment/docker.md) - Compose services, profiles and commands
- [Production Guide](./deployment/production.md) - Production overlay, CI/CD pipeline and checklist
- [External APIs - Production Activation](./EXTERNAL_APIS_PRODUCTION.md) - Per-service setup for Resend, Google, Gemini, Auth0, MinIO, n8n and the internal API key

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
│  - Controllers (API Routes, global prefix /api)              │
│  - Services (Business Logic)                                 │
│  - Guards (Auth, Roles, API Keys, Throttling)                │
│  - DTOs (Validation)                                         │
└────────────────────┬────────────────────────────────────────┘
                     │ Prisma ORM
┌────────────────────▼────────────────────────────────────────┐
│                   PostgreSQL Database                        │
│  - User, Company, JobPosition                                │
│  - Candidate, HiringProcess, Stage                           │
│  - Application, Interview, Subscription                      │
└──────────────────────────────────────────────────────────────┘
```

## Support & Community

- **GitHub Issues**: [Report bugs or request features](https://github.com/Nikire/RecruitingTool/issues)
- **GitHub Milestones**: [View project roadmap](https://github.com/Nikire/RecruitingTool/milestones)
- **License**: See [LICENSE](../LICENSE) file

## Documentation Version

This documentation tracks BorderLess **v1.1.0**, the latest entry in [CHANGELOG.md](../CHANGELOG.md).

Last updated: September 12, 2026

## Next Steps

- [Installation Guide](./getting-started/installation.md) - Run the stack locally
- [Configuration](./getting-started/configuration.md) - Every environment variable the app reads
- [Production Guide](./deployment/production.md) - Ship it
