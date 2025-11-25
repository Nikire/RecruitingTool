---
tags: [architecture, backend, nestjs, api]
created: 2025-11-24
category: Architecture
status: current
---

# Backend Architecture

Comprehensive documentation of the NestJS backend architecture, module structure, and implementation patterns.

## Technology Stack

- **Framework**: NestJS 10.0.0
- **Language**: TypeScript 5.1.3
- **ORM**: Prisma 6.2.1
- **Database**: PostgreSQL
- **Authentication**: JWT (@nestjs/jwt 11.0.0)
- **Validation**: class-validator + class-transformer
- **Documentation**: Swagger (@nestjs/swagger 11.0.3)
- **Storage**: MinIO/S3 compatible

## Folder Structure

```
recruiting-tool-backend/
├── src/
│   ├── modules/
│   │   ├── shared/                    # Shared modules
│   │   │   └── modules/
│   │   │       ├── auth/              # Authentication & authorization
│   │   │       │   ├── guards/        # AuthGuard, RolesGuard
│   │   │       │   ├── decorators/    # @Auth, @CurrentUser
│   │   │       │   ├── dto/           # Auth DTOs
│   │   │       │   ├── constants/     # Role enums, constants
│   │   │       │   └── auth.service.ts
│   │   │       ├── database/          # PrismaClient wrapper
│   │   │       │   ├── database.service.ts
│   │   │       │   └── database.module.ts
│   │   │       └── admin-user/        # Bootstrap admin
│   │   │           └── admin-user.service.ts
│   │   ├── users/                     # User management
│   │   │   ├── dto/
│   │   │   ├── mappers/
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── users.module.ts
│   │   ├── company/                   # Company management
│   │   ├── job-position/              # Job positions
│   │   ├── hiring-process/            # Hiring workflows
│   │   │   ├── modules/
│   │   │   │   ├── candidate/         # Candidate sub-module
│   │   │   │   └── stages/            # Stages sub-module
│   │   │   ├── dto/
│   │   │   ├── hiring-process.controller.ts
│   │   │   ├── hiring-process.service.ts
│   │   │   └── hiring-process.module.ts
│   │   ├── application/               # Job applications
│   │   ├── storage/                   # File storage (MinIO/S3)
│   │   │   ├── dto/
│   │   │   ├── entities/
│   │   │   ├── storage.service.ts     # S3 operations
│   │   │   ├── files.service.ts       # Business logic
│   │   │   ├── files.controller.ts    # API endpoints
│   │   │   └── storage.module.ts
│   │   ├── interview/                 # Interview scheduling
│   │   └── dummy/                     # Seed data generation
│   ├── dto/                           # Global DTOs
│   ├── main.ts                        # Application entry point
│   └── app.module.ts                  # Root module
├── prisma/
│   ├── schema.prisma                  # Database schema
│   ├── migrations/                    # Migration history
│   └── dummy-data.json                # Seed data
├── docker-entrypoint.sh               # Docker initialization
├── Dockerfile
└── package.json
```

## Module Architecture

### Core Modules

#### Auth Module (`shared/modules/auth`)

Handles authentication and authorization across the application.

**Components**:
- `AuthService`: Login, registration, JWT token generation
- `AuthGuard`: Validates JWT tokens on protected routes
- `RolesGuard`: Checks user roles for authorization
- `@Auth([roles])` Decorator: Combines guards for easy use
- `@CurrentUser()` Decorator: Extracts user from request

**Example Usage**:
```typescript
@Controller('hiring-process')
export class HiringProcessController {
  @Get()
  @Auth([Role.HR, Role.ADMIN])  // Requires HR or ADMIN role
  findAll(@CurrentUser() user: UserResponseDto) {
    // user is automatically attached to request
    return this.service.findAll(user.companyUid);
  }
}
```

See [[Authentication-System|Authentication System]] for details.

#### Database Module (`shared/modules/database`)

Wraps Prisma Client as an injectable service.

**Why?**:
- Dependency injection throughout the app
- Easy mocking for tests
- Centralized Prisma configuration
- Lifecycle management (onModuleInit, onModuleDestroy)

**Usage**:
```typescript
export class UsersService {
  constructor(private prisma: DatabaseService) {}

  async findOne(uid: string) {
    return this.prisma.user.findUnique({ where: { uid } });
  }
}
```

#### Admin User Module (`shared/modules/admin-user`)

Automatically creates admin user on application startup.

**Process**:
1. Checks if admin user exists (by email from env)
2. If not exists, creates user with SUPER_ADMIN role
3. Logs admin credentials to console
4. Uses bcrypt for password hashing

**Environment Variables**:
- `ADMIN_NAME`: Admin user's name
- `ADMIN_EMAIL`: Admin user's email
- `ADMIN_PASSWORD`: Admin user's password

### Feature Modules

#### Users Module

Manages user CRUD operations with company isolation.

**Key Files**:
- `users.controller.ts`: HTTP endpoints
- `users.service.ts`: Business logic
- `user.mapper.ts`: Entity ↔ DTO conversion
- DTOs: `CreateUserDto`, `UpdateUserDto`, `UserResponseDto`

**Features**:
- Company-based filtering (multi-tenancy)
- Role-based access control
- Profile management
- Password hashing on creation/update

**Endpoints**:
```typescript
GET    /users              # List users (filtered by company)
GET    /users/:uid         # Get single user
POST   /users              # Create user (ADMIN only)
PUT    /users/:uid         # Update user
DELETE /users/:uid         # Delete user (SUPER_ADMIN only)
```

#### Company Module

Manages company entities for multi-tenancy.

**Key Concepts**:
- Each company is isolated
- Users belong to one company
- Resources filtered by company
- SUPER_ADMIN can manage all companies

**Endpoints**:
```typescript
GET    /company            # List companies (ADMIN)
GET    /company/:uid       # Get company (ADMIN)
POST   /company            # Create company (SUPER_ADMIN)
PUT    /company/:uid       # Update company (ADMIN)
DELETE /company/:uid       # Delete company (SUPER_ADMIN)
```

#### Job Position Module

Manages job position postings with stage templates.

**Key Features**:
- Job position CRUD
- Stage template definition
- Public access for careers page
- Company isolation

**Stage Templates**:
Job positions define stage templates that are copied to hiring processes.

```typescript
// Creating job position with stages
POST /job-position
{
  "title": "Senior Developer",
  "description": "...",
  "stages": [
    {"title": "Phone Screen", "type": "INTERVIEW", "position": 0},
    {"title": "Technical Test", "type": "TECHNICAL_INTERVIEW", "position": 1},
    {"title": "Final Interview", "type": "FINAL_INTERVIEW", "position": 2}
  ]
}
```

**Endpoints**:
```typescript
GET    /job-position                  # List positions (PUBLIC)
GET    /job-position/public/all       # Careers page (PUBLIC)
GET    /job-position/:uid             # Single position (PUBLIC)
POST   /job-position                  # Create position (HR/ADMIN)
PUT    /job-position/:uid             # Update position (HR/ADMIN)
DELETE /job-position/:uid             # Delete position (HR/ADMIN)
```

#### Hiring Process Module

Manages recruitment workflows for candidates.

**Key Features**:
- Creates hiring process for a candidate
- Copies stages from job position template
- Tracks candidate progress through stages
- Company isolation

**Sub-Modules**:
- **Candidate Module**: Candidate CRUD operations
- **Stages Module**: Stage management for hiring processes

**Creation Flow**:
1. Create or select existing candidate
2. Select job position
3. System auto-generates title: `{JobPosition.title} - {Candidate.name}`
4. System copies all stages from job position
5. First stage set to CURRENT status
6. Stages isolated (no jobPositionUid)

**Endpoints**:
```typescript
GET    /hiring-process         # List processes (HR/ADMIN)
GET    /hiring-process/:uid    # Single process (PUBLIC)
POST   /hiring-process         # Create process (HR/ADMIN)
PUT    /hiring-process/:uid    # Update process (HR/ADMIN)
DELETE /hiring-process/:uid    # Delete process (HR/ADMIN)
```

#### Candidate Sub-Module

Manages candidate information within hiring processes.

**Key Features**:
- Candidate CRUD
- One-to-one with hiring process
- File attachments (resumes, documents)
- Collaboration notes

**Candidate Notes**:
- HR team can add internal notes
- Author tracking
- Timestamps
- Cascade delete with candidate

**Endpoints**:
```typescript
GET    /candidate                       # List candidates (HR/ADMIN)
GET    /candidate/:uid                  # Single candidate (HR/ADMIN)
POST   /candidate                       # Create candidate (HR/ADMIN)
PUT    /candidate/:uid                  # Update candidate (HR/ADMIN)
DELETE /candidate/:uid                  # Delete candidate (HR/ADMIN)

POST   /candidate/:candidateUid/notes  # Add note (HR/ADMIN)
GET    /candidate/:candidateUid/notes  # List notes (HR/ADMIN)
PUT    /candidate/notes/:noteUid       # Update note (HR/ADMIN)
DELETE /candidate/notes/:noteUid       # Delete note (HR/ADMIN)
```

#### Stages Sub-Module

Manages recruitment stages with automatic position tracking.

**Key Features**:
- Stage CRUD (single and bulk)
- Automatic position management
- Database transactions for consistency
- Stage isolation (template vs instance)

**Position Management**:
Stages have a `position` field (0, 1, 2...) that's automatically managed:
- Bulk creation assigns sequential positions
- Updates adjust positions of other stages
- Deletes reorder remaining stages
- Uses transactions for atomic operations

**Stage Types**:
- `INTERVIEW`: Initial screening
- `TECHNICAL_INTERVIEW`: Technical assessment
- `FINAL_INTERVIEW`: Final decision interview
- `OFFER`: Offer extended

**Stage Status**:
- `OPEN`: Not started
- `CURRENT`: In progress
- `DONE`: Completed
- `CANCELLED`: Cancelled

**Endpoints**:
```typescript
GET    /stages/:uid         # Get stage (HR/ADMIN)
POST   /stages              # Create stage (HR/ADMIN)
POST   /stages/bulk         # Bulk create stages (HR/ADMIN)
PUT    /stages/:uid         # Update stage (HR/ADMIN)
DELETE /stages/:uid         # Delete stage (HR/ADMIN)
```

#### Application Module

Handles external job applications from careers page.

**Key Features**:
- Public application submission
- Resume upload integration
- Status tracking (PENDING → REVIEWED → ACCEPTED/REJECTED)
- Email notifications
- Internal notes for HR team

**Application Flow**:
1. External user visits `/careers`
2. Selects job position
3. Fills application form with resume
4. System validates job position is OPEN
5. Application created with PENDING status
6. Confirmation email sent to applicant
7. Notification email sent to HR team
8. HR reviews and updates status

**Endpoints**:
```typescript
POST   /applications          # Submit application (PUBLIC)
GET    /applications          # List applications (HR/ADMIN)
GET    /applications/:uid     # Single application (HR/ADMIN)
PUT    /applications/:uid     # Update application (HR/ADMIN)
DELETE /applications/:uid     # Delete application (HR/ADMIN)
```

#### Storage Module

Manages file uploads/downloads with MinIO/S3.

**Architecture**:
- `StorageService`: Low-level S3 operations
- `FilesService`: Business logic and database operations
- `FilesController`: HTTP endpoints

**File Flow**:
1. Client uploads file via multipart/form-data
2. File validated (size, type)
3. File uploaded to MinIO/S3
4. Metadata stored in database (FileUpload model)
5. Signed URL generated for access
6. Response includes file metadata + signed URL

**File Validation**:
- Max size: 10 MB
- Allowed types: PDF, DOC, DOCX, TXT
- Configurable in DTOs

**S3 Configuration**:
- Local dev: MinIO (http://minio:9000)
- Production: AWS S3 or compatible
- Signed URLs: 1-hour expiry

**Endpoints**:
```typescript
POST   /files/upload            # Upload file (USER)
GET    /files                   # List files (USER)
GET    /files/:uid              # Get file metadata (USER)
GET    /files/:uid/download     # Download file (USER)
DELETE /files/:uid              # Delete file (ADMIN)
```

See [[File-Storage-System|File Storage System]] for details.

#### Interview Module

Manages interview scheduling within recruitment stages.

**Key Features**:
- Manual scheduling by HR
- Date, time, duration tracking
- Meeting link integration (Zoom, Google Meet)
- Status tracking (PENDING, SCHEDULED, COMPLETED, CANCELLED)
- Email notifications
- Internal notes

**Interview Flow**:
1. HR selects stage for interview
2. Schedules date/time or leaves pending
3. Adds meeting link and notes
4. System sends notification email to candidate
5. Interview status updated as it progresses
6. Can reschedule or cancel with notifications

**Interview Status**:
- `PENDING`: Created but not scheduled
- `SCHEDULED`: Date/time set, notification sent
- `COMPLETED`: Interview finished
- `CANCELLED`: Interview cancelled

**Endpoints**:
```typescript
POST   /interview                    # Create interview (HR/ADMIN)
GET    /interview/:uid               # Get interview (HR/ADMIN)
GET    /interview/stage/:stageUid    # List stage interviews (HR/ADMIN)
PUT    /interview/:uid               # Update interview (HR/ADMIN)
PUT    /interview/:uid/cancel        # Cancel interview (HR/ADMIN)
DELETE /interview/:uid               # Delete interview (HR/ADMIN)
```

#### Dummy Module

Seeds database with dummy data for development.

**Purpose**:
- Consistent development environment
- Test data for all features
- Realistic data relationships

**Data Generated**:
- Companies (2)
- Users (multiple roles per company)
- Job Positions (multiple per company)
- Hiring Processes with candidates
- Stages for job positions and processes
- Applications
- Candidate notes
- Files

**Configuration**:
- Data defined in `dummy-data.json`
- Service reads and creates records
- Runs on first startup (if database empty)

## Design Patterns

### Dependency Injection

NestJS uses constructor-based dependency injection:

```typescript
@Injectable()
export class HiringProcessService {
  constructor(
    private prisma: DatabaseService,
    private candidateService: CandidateService,
    private stagesService: StagesService,
  ) {}
}
```

### DTO Pattern

Data Transfer Objects for validation and type safety:

```typescript
// Input DTO (validation)
export class CreateHiringProcessDto {
  @IsString()
  title: string;

  @IsUUID()
  jobPositionUid: string;

  @IsUUID()
  candidateUid: string;
}

// Output DTO (response)
export class HiringProcessResponseDto {
  uid: string;
  title: string;
  status: ProcessStatus;
  jobPositionUid: string;
  candidateUid: string;
  companyUid: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Mapper Pattern

Convert between database entities and DTOs:

```typescript
export class UserMapper {
  static toDto(user: User): UserResponseDto {
    return {
      uid: user.uid,
      name: user.name,
      email: user.email,
      roles: user.roles,
      companyUid: user.company?.uid,
      // ... other fields (UIDs only)
    };
  }
}
```

### Guard Pattern

Declarative route protection:

```typescript
@Controller('hiring-process')
export class HiringProcessController {
  @Get()
  @Auth([Role.HR, Role.ADMIN])  // Guard applied via decorator
  findAll(@CurrentUser() user: UserResponseDto) {
    // Only HR and ADMIN roles can access
  }
}
```

### Repository Pattern (via Prisma)

Prisma acts as a repository layer:

```typescript
// Service uses Prisma as repository
async findAll(companyUid: string) {
  return this.prisma.hiringProcess.findMany({
    where: { company: { uid: companyUid } },
    include: { jobPosition: true, candidate: true },
  });
}
```

## Error Handling

### Global Exception Filter

NestJS automatically handles common exceptions:

```typescript
// Throws HTTP exceptions
if (!user) {
  throw new NotFoundException('User not found');
}

if (!hasPermission) {
  throw new ForbiddenException('Insufficient permissions');
}
```

### Prisma Error Handling

Catches Prisma-specific errors and converts to HTTP exceptions:

```typescript
try {
  await this.prisma.user.create({ data });
} catch (error) {
  if (error.code === 'P2002') {
    throw new ConflictException('Email already exists');
  }
  throw error;
}
```

## Validation

### Class Validator

Automatic DTO validation with decorators:

```typescript
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEnum(Role, { each: true })
  roles: Role[];
}
```

### Custom Validation

Custom validators for business rules:

```typescript
@ValidatorConstraint({ name: 'isJobPositionOpen', async: true })
export class IsJobPositionOpen implements ValidatorConstraintInterface {
  async validate(uid: string) {
    const jobPosition = await prisma.jobPosition.findUnique({
      where: { uid },
    });
    return jobPosition?.status === 'OPEN';
  }
}
```

## API Documentation

### Swagger Integration

Automatic API documentation generated from decorators:

```typescript
@ApiTags('users')
@Controller('users')
export class UsersController {
  @Get()
  @ApiOperation({ summary: 'List all users' })
  @ApiResponse({ status: 200, type: [UserResponseDto] })
  @Auth([Role.USER])
  findAll() { }
}
```

**Access**: http://localhost:4000/api

## Testing Strategy

### Unit Tests

Test services in isolation:

```typescript
describe('UsersService', () => {
  let service: UsersService;
  let prisma: DatabaseService;

  beforeEach(() => {
    prisma = { user: { findUnique: jest.fn() } } as any;
    service = new UsersService(prisma);
  });

  it('should find user by UID', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);
    const result = await service.findOne('uid');
    expect(result).toEqual(mockUser);
  });
});
```

### Integration Tests

Test complete request/response cycles:

```typescript
describe('UsersController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  it('/users (GET)', () => {
    return request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });
});
```

## Performance Considerations

### Query Optimization

Use Prisma `select` and `include` wisely:

```typescript
// Good: Only fetch needed fields
await this.prisma.user.findMany({
  select: { uid: true, name: true, email: true },
});

// Avoid: Fetching all fields and relations unnecessarily
await this.prisma.user.findMany({ include: { everything: true } });
```

### Indexing

Ensure database indexes on:
- UID fields (unique index)
- Foreign key fields
- Frequently filtered fields (status, companyId)

### Caching

Future consideration: Redis for:
- Session storage
- Frequently accessed data
- Rate limiting

## Related Notes

- [[Architecture-Overview|Architecture Overview]]
- [[Database-Schema|Database Schema]]
- [[API-Overview|API Documentation]]
- [[Authentication-System|Authentication System]]
- [[File-Storage-System|File Storage System]]

## See Also

- [[Frontend-Architecture|Frontend Architecture]]
- [[Infrastructure|Infrastructure Setup]]
- [[UID-Policy|UID-Only Policy]]

---

**Last Updated**: 2025-11-24
**Review Frequency**: After module changes
