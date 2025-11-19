# Changelog

All notable changes to the Recruiting Tool project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## Version 0.6.0 - 2025-01-18

### 🚀 Features
- **Hierarchical Role-Based Permission System**
  - Implemented level-based access control (1=SUPER_ADMIN, 2=ADMIN, 3=HR, 4=USER)
  - Users with higher privileges can now access endpoints requiring lower privileges
  - Added type safety check to ensure all roles are included in permission mapping
  - Affected modules: Auth module
  - Files modified: `recruiting-tool-backend/src/modules/shared/modules/auth/guards/roles.guard.ts`

### ♻️ Refactoring
- **ID to UID Migration (Complete System-Wide Refactor)**
  - Migrated all external-facing relations from internal IDs to UIDs
  - Maintained Prisma internal relations using IDs for database consistency
  - Updated all DTOs to expose UIDs instead of IDs for relations
  - Modified entity mappers to translate between internal IDs and external UIDs
  - Enhanced services to handle UID-based operations
  - Frontend now works exclusively with UIDs (complete isolation from internal IDs)

  **Backend files modified:**
  - `recruiting-tool-backend/src/modules/storage/dto/file-upload.dto.ts`
  - `recruiting-tool-backend/src/modules/users/dto/users.dto.ts`
  - `recruiting-tool-backend/src/modules/hiring-process/dto/hiring-process.dto.ts`
  - `recruiting-tool-backend/src/modules/job-position/dto/job-position.dto.ts`
  - `recruiting-tool-backend/src/modules/storage/files.service.ts`
  - `recruiting-tool-backend/src/modules/users/entities/users.entities.ts`
  - `recruiting-tool-backend/src/modules/users/users.service.ts`
  - `recruiting-tool-backend/src/modules/hiring-process/entities/hiring-process.entity.ts`
  - `recruiting-tool-backend/src/modules/job-position/entities/job-position.entity.ts`
  - `recruiting-tool-backend/src/modules/hiring-process/hiring-process.service.ts`

  **Frontend files modified:**
  - `recruiting-tool-frontend/src/types/user.types.ts`
  - `recruiting-tool-frontend/src/types/jobPosition.types.ts`
  - `recruiting-tool-frontend/src/api/files.ts`
  - `recruiting-tool-frontend/src/hooks/api/useFiles.ts`

  **Benefits:**
  - Enhanced security: Internal database IDs never exposed to frontend
  - Better API design: Uniform use of opaque identifiers
  - Future-proof: Database structure changes won't affect API contracts
  - Improved maintainability: Clear separation of concerns

### 🧪 Testing
- Backend build: ✅ PASSED
- Frontend build: ✅ PASSED
- TypeScript compilation: ✅ No errors

### Breaking Changes
- **API Response Schema Changes**: All relation fields in API responses now use `*Uid` instead of `*Id`
  - `companyId` → `companyUid`
  - `uploadedById` → `uploadedByUid`
  - `candidateId` → `candidateUid`
  - `jobPositionId` → `jobPositionUid`

### Migration Notes
- Frontend applications must update their type definitions to use UID fields
- Any API consumers must update their code to use the new UID-based relation fields
- No database migration required (internal structure remains unchanged)

---

## Version 0.5.0 - 2025-01-17

### 🚀 Features
- **Profile Picture Management**
  - Upload profile pictures with automatic validation
  - Automatic cleanup of old profile pictures when updating
  - Integration with MinIO/S3 storage system
  - Profile picture removal functionality

### 🗃️ Database
- **File Storage System**
  - Added MinIO service to docker-compose.yml for local S3-compatible storage
  - Created FileUpload entity with S3 key tracking
  - Implemented automatic bucket creation on startup
  - File size validation (max 10MB)
  - File type validation (PDF, DOC, DOCX, TXT)

### 💄 UI/UX
- **User Profile Management**
  - Inline editing for profile fields
  - Change detection for update button
  - File upload with drag-and-drop support
  - File list display with download/delete actions
  - Toast notifications for all file operations

---
