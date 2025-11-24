# Recruiting Tool Documentation Vault

Welcome to the comprehensive Obsidian.md documentation vault for the Recruiting Tool project.

## What is This Vault?

This is an interconnected knowledge base that documents the entire Recruiting Tool application - a full-stack HR management system built with modern technologies. The vault uses Obsidian.md's linking and organization features to create a navigable, searchable documentation system.

## Quick Navigation

### Getting Started
- [[Quick-Start|Quick Start Guide]] - Get up and running quickly
- [[Technology-Stack|Technology Stack]] - Overview of all technologies used
- [[Architecture-Overview|Architecture Overview]] - High-level system design

### Core Documentation
- **Architecture**: [[01-Architecture/Backend-Architecture|Backend]] | [[01-Architecture/Frontend-Architecture|Frontend]] | [[01-Architecture/Database-Schema|Database]] | [[01-Architecture/Infrastructure|Infrastructure]]
- **Development**: [[06-Workflows/Development-Workflow|Development]] | [[06-Workflows/Docker-Workflow|Docker]] | [[06-Workflows/Git-Workflow|Git]]
- **API Documentation**: [[03-API/API-Overview|API Overview]] | [[03-API/Authentication|Authentication]]
- **Features**: [[02-Features/Feature-Overview|Current Features]] | [[02-Features/Feature-Roadmap|Roadmap]]

### For Developers
- [[06-Workflows/Getting-Started-Development|Developer Onboarding]]
- [[07-Coding-Standards/UID-Policy|UID-Only Policy]] - CRITICAL standard
- [[07-Coding-Standards/i18n-Requirements|i18n Requirements]] - Frontend text requirements
- [[08-Agents/Agent-Overview|Specialized Agents]] - Development automation

### Reference
- [[09-Reference/File-Structure|File Structure Reference]]
- [[09-Reference/Environment-Variables|Environment Variables]]
- [[09-Reference/Key-Files|Key Files and Entry Points]]

## How to Use This Vault

### Navigation Methods

1. **Follow Links**: Click on any [[WikiLink]] to jump to related documentation
2. **Search**: Use Obsidian's search (Ctrl/Cmd + O) to find any topic
3. **Graph View**: Visualize connections between documents (Ctrl/Cmd + G)
4. **Backlinks**: See what pages link to the current page
5. **Tags**: Filter by tags like `#backend`, `#frontend`, `#api`, `#database`

### Document Structure

Each documentation page follows a consistent structure:
- **Overview**: What this page covers
- **Content**: Detailed information with code examples
- **Related Notes**: Links to related documentation
- **Tags**: Categorization for filtering

### Color-Coded Categories

Documents use consistent categorization:
- **Architecture** (Green): System design and structure
- **Development** (Blue): Workflows and processes
- **API** (Purple): API endpoints and integration
- **Features** (Orange): Application functionality
- **Reference** (Gray): Quick lookup information

## Project Overview

**Recruiting Tool** is a comprehensive HR management application that helps companies:
- Manage job positions and hiring workflows
- Track candidates through multi-stage processes
- Handle job applications from external applicants
- Schedule and manage interviews
- Collaborate with notes and file sharing
- Maintain company and user management

**Tech Stack:**
- Backend: NestJS + TypeScript + Prisma + PostgreSQL
- Frontend: React 19 + TypeScript + Vite + Material-UI + React Query
- Infrastructure: Docker + MinIO (S3-compatible storage)

## Vault Organization

```
docs-vault/
├── 00-Index/              # High-level overview pages
├── 01-Architecture/       # System architecture documentation
├── 02-Features/           # Feature-specific documentation
├── 03-API/                # API endpoint documentation
├── 04-Database/           # Database models and schema
├── 05-Components/         # Frontend components documentation
├── 06-Workflows/          # Development workflows
├── 07-Coding-Standards/   # Coding conventions and standards
├── 08-Agents/             # Specialized agent documentation
├── 09-Reference/          # Quick reference materials
└── 99-Templates/          # Reusable documentation templates
```

## Key Features Documented

- Multi-tenant company system
- Role-based access control (USER, HR, ADMIN, SUPER_ADMIN)
- Complete hiring process management
- Multi-stage recruitment workflows
- Interview scheduling system
- File upload/download with MinIO
- Job application system
- Candidate notes and collaboration
- JWT authentication
- Docker containerization

## Maintenance

This vault should be updated whenever:
- New features are implemented
- Architecture changes
- APIs are added or modified
- Database schema changes
- Development workflows evolve

Keep documentation synchronized with `.claude/docs/` folder for consistency.

## Version Information

- **Vault Created**: 2025-11-24
- **Project Version**: See CHANGELOG.md
- **Last Updated**: 2025-11-24

## Getting Help

- Review the [[Quick-Start|Quick Start Guide]] for immediate guidance
- Check [[08-Agents/Agent-Overview|Specialized Agents]] for development assistance
- Explore the [[Architecture-Overview|Architecture Overview]] for system understanding
- Use Obsidian's search to find specific topics

---

**Ready to explore?** Start with the [[Quick-Start|Quick Start Guide]] or jump to [[Architecture-Overview|Architecture Overview]].
