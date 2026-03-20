# Borderless ATS — Platform Overview

Borderless is a full-stack **Applicant Tracking System (ATS)** designed to help HR teams manage the complete recruiting lifecycle: from posting jobs and receiving applications to scheduling interviews and making hiring decisions.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS + TypeScript + Prisma + PostgreSQL |
| Frontend | React 19 + TypeScript + Vite + Material-UI |
| Infrastructure | Docker + MinIO (file storage) |
| Payments | Stripe |
| AI | Google Gemini |
| Email | Resend HTTP API |
| Calendar | Google Calendar OAuth |

## Application Structure

The app has three main areas:

- **Public (`/`)** — Landing page, careers portal, legal pages
- **HR Panel (`/hr/`)** — Core recruiting functionality for HR teams
- **Admin Panel (`/admin/`)** — Platform-level administration for super admins

## Environments

- **Frontend:** `http://localhost:80` (Docker) or `http://localhost:5173` (dev)
- **Backend API:** `http://localhost:4000/api`
- **Swagger Docs:** `http://localhost:4000/api/docs`
- **PgAdmin:** `http://localhost:8080`
- **MinIO Console:** `http://localhost:9001`

## Branches

| Branch | Purpose |
|--------|---------|
| `development` | Active development — push here first |
| `production` | Production-ready — merge from development |

## Default Credentials (Development)

- **Admin:** `admin@example.com` / `admin`
- **PgAdmin:** `admin@pgadmin.com` / `admin`
- **MinIO:** `minioadmin` / `minioadmin`
