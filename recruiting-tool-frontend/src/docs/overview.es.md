# Borderless ATS — Descripción General de la Plataforma

Borderless es un **Sistema de Seguimiento de Candidatos (ATS)** full-stack diseñado para ayudar a los equipos de RRHH a gestionar el ciclo completo de reclutamiento: desde la publicación de empleos y la recepción de solicitudes hasta la programación de entrevistas y la toma de decisiones de contratación.

## Stack Tecnológico

| Capa | Tecnología |
|-------|-----------|
| Backend | NestJS + TypeScript + Prisma + PostgreSQL |
| Frontend | React 19 + TypeScript + Vite + Material-UI |
| Infraestructura | Docker + MinIO (almacenamiento de archivos) |
| Pagos | Stripe |
| IA | Google Gemini |
| Correo electrónico | Resend HTTP API |
| Calendario | Google Calendar OAuth |

## Estructura de la Aplicación

La app tiene tres áreas principales:

- **Pública (`/`)** — Página de inicio, portal de empleo, páginas legales
- **Panel de RRHH (`/hr/`)** — Funcionalidad principal de reclutamiento para equipos de RRHH
- **Panel de Administración (`/admin/`)** — Administración a nivel de plataforma para superadministradores

## Entornos

- **Frontend:** `http://localhost:80` (Docker) o `http://localhost:5173` (dev)
- **Backend API:** `http://localhost:4000/api`
- **Swagger Docs:** `http://localhost:4000/api/docs`
- **PgAdmin:** `http://localhost:8080`
- **MinIO Console:** `http://localhost:9001`

## Ramas

| Rama | Propósito |
|--------|---------|
| `development` | Desarrollo activo — hacer push aquí primero |
| `production` | Listo para producción — fusionar desde development |

## Credenciales por Defecto (Desarrollo)

- **Admin:** `admin@example.com` / `admin`
- **PgAdmin:** `admin@pgadmin.com` / `admin`
- **MinIO:** `minioadmin` / `minioadmin`
