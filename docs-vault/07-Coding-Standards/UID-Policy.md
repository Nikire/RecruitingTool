---
tags: [coding-standards, security, api-design, best-practices]
created: 2025-11-24
category: Coding Standards
status: critical
---

# UID-Only External API Policy

**CRITICAL STANDARD**: All external-facing APIs, DTOs, and frontend code MUST use UIDs (UUIDs) instead of numeric IDs.

## Overview

The Recruiting Tool enforces a strict UID-only policy for all external interfaces. This means:
- All API route parameters use `:uid` not `:id`
- All DTOs use `uid` and `*Uid` for identifiers
- All frontend types and components use UIDs
- Numeric IDs are ONLY used internally in the database

## Why This Matters

### Security Benefits

**Prevents Enumeration Attacks**:
```bash
# ❌ BAD: Numeric IDs allow enumeration
GET /users/1
GET /users/2
GET /users/3  # Attacker can guess all IDs

# ✅ GOOD: UIDs prevent enumeration
GET /users/a7f8c3d2-4e9b-4f1c-8d3a-9e7f6c5b4a3d
GET /users/f3e8d9c2-5a4b-4c3d-9e8f-7a6b5c4d3e2f
# Impossible to guess next UID
```

**Privacy Protection**:
- Numeric IDs reveal creation order
- UIDs hide record count and sequence
- Prevents leaking business metrics

**Prevents ID Conflicts**:
- UIDs unique across distributed systems
- No conflicts during database migrations
- Safe for multi-region deployments

### Scalability Benefits

- **Distributed Systems**: UIDs generated client-side or at any node
- **Database Sharding**: No ID collision across shards
- **Microservices**: Safe to generate IDs in any service
- **Data Migration**: No ID conflicts when merging databases

## Implementation Layers

### 1. Database Layer (Prisma)

Keep numeric `id` fields for internal performance, add `uid` fields for external use.

**Schema Example**:
```prisma
model User {
  // Internal identifier (never exposed)
  id        Int      @id @default(autoincrement())

  // External identifier (always exposed)
  uid       String   @unique @default(uuid())

  // Other fields
  name      String
  email     String   @unique

  // Relations use numeric IDs internally
  companyId Int
  company   Company  @relation(fields: [companyId], references: [id])
}
```

**Why Keep Numeric IDs?**:
- Database join performance (integers faster than UUIDs)
- Smaller indexes and foreign keys
- Prisma handles ID relations efficiently
- Internal-only, never exposed externally

### 2. Service Layer

Accept UIDs as parameters, convert to numeric IDs for database queries.

**Example - Find Operation**:
```typescript
export class UsersService {
  constructor(private prisma: DatabaseService) {}

  async findOne(uid: string): Promise<User> {
    // Query by UID (external identifier)
    return this.prisma.user.findUnique({
      where: { uid },  // ✅ Use UID
      include: { company: true },
    });
  }
}
```

**Example - Create Operation**:
```typescript
async create(dto: CreateUserDto): Promise<UserResponseDto {
  // Convert company UID to ID for database
  const company = await this.prisma.company.findUnique({
    where: { uid: dto.companyUid },
  });

  if (!company) {
    throw new NotFoundException('Company not found');
  }

  // Create with numeric ID internally
  const user = await this.prisma.user.create({
    data: {
      name: dto.name,
      email: dto.email,
      companyId: company.id,  // ✅ Use numeric ID for relation
    },
  });

  // Return DTO with UID
  return this.mapToDto(user);
}
```

### 3. Controller Layer

ALL route parameters use `:uid`, never `:id`.

**Example Controller**:
```typescript
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get(':uid')  // ✅ Route uses :uid
  @Auth([Role.USER])
  async findOne(@Param('uid') uid: string) {  // ✅ Parameter is uid
    return this.usersService.findOne(uid);
  }

  @Put(':uid')  // ✅ Route uses :uid
  @Auth([Role.USER])
  async update(
    @Param('uid') uid: string,  // ✅ Parameter is uid
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(uid, dto);
  }

  @Delete(':uid')  // ✅ Route uses :uid
  @Auth([Role.SUPER_ADMIN])
  async remove(@Param('uid') uid: string) {  // ✅ Parameter is uid
    return this.usersService.remove(uid);
  }
}
```

**❌ WRONG - Using Numeric IDs**:
```typescript
@Get(':id')  // ❌ NEVER use :id
async findOne(@Param('id') id: number) {  // ❌ NEVER numeric ID
  return this.usersService.findOne(id);
}
```

### 4. DTOs (Data Transfer Objects)

NEVER include numeric `id` fields, ALWAYS use `uid` for identifiers.

**Create DTO Example**:
```typescript
export class CreateHiringProcessDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsUUID()
  jobPositionUid: string;  // ✅ UID for relation

  @IsUUID()
  candidateUid: string;    // ✅ UID for relation

  @IsUUID()
  companyUid: string;      // ✅ UID for relation
}
```

**Response DTO Example**:
```typescript
export class HiringProcessResponseDto {
  uid: string;             // ✅ UID identifier
  title: string;
  status: ProcessStatus;

  // Relations use UIDs
  jobPositionUid: string;  // ✅ UID for relation
  candidateUid: string;    // ✅ UID for relation
  companyUid: string;      // ✅ UID for relation

  createdAt: Date;
  updatedAt: Date;
}
```

**❌ WRONG - Exposing Numeric IDs**:
```typescript
export class UserResponseDto {
  id: number;              // ❌ NEVER expose numeric ID
  companyId: number;       // ❌ NEVER expose numeric ID

  uid: string;             // ✅ Use this instead
  companyUid: string;      // ✅ Use this instead
}
```

### 5. Mapper Pattern

Convert between database entities and DTOs, mapping numeric IDs to UIDs.

**Mapper Example**:
```typescript
export class HiringProcessMapper {
  static toDto(process: HiringProcess): HiringProcessResponseDto {
    return {
      uid: process.uid,                    // ✅ Use UID
      title: process.title,
      status: process.status,
      jobPositionUid: process.jobPosition?.uid,  // ✅ Map relation to UID
      candidateUid: process.candidate?.uid,      // ✅ Map relation to UID
      companyUid: process.company?.uid,          // ✅ Map relation to UID
      createdAt: process.createdAt,
      updatedAt: process.updatedAt,
    };
  }
}
```

**Service Usage**:
```typescript
async findAll(companyUid: string): Promise<HiringProcessResponseDto[]> {
  const processes = await this.prisma.hiringProcess.findMany({
    where: { company: { uid: companyUid } },
    include: { jobPosition: true, candidate: true, company: true },
  });

  // Map all entities to DTOs
  return processes.map(HiringProcessMapper.toDto);
}
```

### 6. Frontend Layer

NEVER use or display numeric IDs in the frontend.

**TypeScript Interface Example**:
```typescript
// ✅ CORRECT: Frontend types use UIDs
export interface HiringProcess {
  uid: string;
  title: string;
  status: ProcessStatus;
  jobPositionUid: string;
  candidateUid: string;
  companyUid: string;
  createdAt: string;
  updatedAt: string;
}
```

**API Call Example**:
```typescript
// ✅ CORRECT: API calls use UIDs
export const getHiringProcess = async (uid: string) => {
  const response = await axios.get(`/hiring-process/${uid}`);
  return response.data;
};

// React Query hook
export const useHiringProcess = (uid: string) => {
  return useQuery(['hiringProcess', uid], () => getHiringProcess(uid));
};
```

**Component Example**:
```typescript
const HiringProcessDetail = () => {
  const { uid } = useParams();  // ✅ UID from URL
  const { data: process } = useHiringProcess(uid);

  return (
    <div>
      <h1>{process.title}</h1>
      <p>UID: {process.uid}</p>  {/* ✅ Display UID if needed */}
      {/* ❌ NEVER display numeric ID */}
    </div>
  );
};
```

**React Router Example**:
```typescript
// ✅ CORRECT: Routes use :uid
<Route path="/hiring-process/:uid" element={<HiringProcessDetail />} />
<Route path="/candidates/:uid" element={<CandidateDetail />} />

// ❌ WRONG: Using numeric :id
<Route path="/hiring-process/:id" element={<HiringProcessDetail />} />
```

## Complete Example: End-to-End Flow

### Backend: Create Hiring Process

**1. DTO (Request)**:
```typescript
export class CreateHiringProcessDto {
  @IsString()
  title: string;

  @IsUUID()
  jobPositionUid: string;  // ✅ UID

  @IsUUID()
  candidateUid: string;    // ✅ UID
}
```

**2. Service (Business Logic)**:
```typescript
async create(dto: CreateHiringProcessDto, user: UserResponseDto) {
  // Convert UIDs to IDs for database
  const jobPosition = await this.prisma.jobPosition.findUnique({
    where: { uid: dto.jobPositionUid },
  });

  const candidate = await this.prisma.candidate.findUnique({
    where: { uid: dto.candidateUid },
  });

  // Create with numeric IDs internally
  const process = await this.prisma.hiringProcess.create({
    data: {
      title: dto.title,
      jobPositionId: jobPosition.id,  // Internal ID
      candidateId: candidate.id,       // Internal ID
      companyId: user.company.id,      // Internal ID
    },
    include: { jobPosition: true, candidate: true, company: true },
  });

  // Return DTO with UIDs
  return HiringProcessMapper.toDto(process);
}
```

**3. Controller (HTTP Endpoint)**:
```typescript
@Post()
@Auth([Role.HR, Role.ADMIN])
async create(
  @Body() dto: CreateHiringProcessDto,
  @CurrentUser() user: UserResponseDto,
) {
  return this.service.create(dto, user);
}
```

**4. Response DTO**:
```typescript
{
  "uid": "a7f8c3d2-4e9b-4f1c-8d3a-9e7f6c5b4a3d",  // ✅ UID
  "title": "Senior Developer - John Doe",
  "status": "OPEN",
  "jobPositionUid": "f3e8d9c2-5a4b-4c3d-9e8f-7a6b5c4d3e2f",  // ✅ UID
  "candidateUid": "c2d3e4f5-6a7b-8c9d-0e1f-2a3b4c5d6e7f",   // ✅ UID
  "companyUid": "b1c2d3e4-5f6a-7b8c-9d0e-1f2a3b4c5d6e",     // ✅ UID
  "createdAt": "2025-11-24T10:00:00Z",
  "updatedAt": "2025-11-24T10:00:00Z"
}
```

### Frontend: Display Hiring Process

**1. API Service**:
```typescript
export const createHiringProcess = async (data: CreateHiringProcessDto) => {
  const response = await axios.post('/hiring-process', {
    title: data.title,
    jobPositionUid: data.jobPositionUid,  // ✅ UID
    candidateUid: data.candidateUid,      // ✅ UID
  });
  return response.data;
};
```

**2. React Hook**:
```typescript
export const useCreateHiringProcess = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createHiringProcess,
    onSuccess: () => {
      queryClient.invalidateQueries(['hiringProcesses']);
    },
  });
};
```

**3. Component**:
```typescript
const CreateHiringProcessForm = () => {
  const { mutate, isLoading } = useCreateHiringProcess();

  const handleSubmit = (data) => {
    mutate({
      title: data.title,
      jobPositionUid: data.jobPositionUid,  // ✅ UID from select
      candidateUid: data.candidateUid,      // ✅ UID from select
    });
  };

  return <form onSubmit={handleSubmit}>...</form>;
};
```

## Migration Checklist

When creating new features or updating existing ones:

- [ ] All route parameters use `:uid` not `:id`
- [ ] All DTOs use `uid` and `*Uid` for identifiers
- [ ] No numeric IDs in DTOs (CreateDto, UpdateDto, ResponseDto)
- [ ] Services accept UIDs as parameters
- [ ] Services convert UIDs to IDs internally
- [ ] Mappers convert entities to DTOs with UIDs
- [ ] Frontend types use UIDs
- [ ] Frontend API calls use UIDs
- [ ] React Router routes use `:uid`
- [ ] No numeric IDs in API responses
- [ ] Database queries convert UID → ID internally

## Common Mistakes to Avoid

### ❌ Mistake 1: Exposing Numeric IDs in DTOs

```typescript
// ❌ WRONG
export class UserResponseDto {
  id: number;        // Exposes numeric ID
  companyId: number; // Exposes numeric ID
}

// ✅ CORRECT
export class UserResponseDto {
  uid: string;       // Uses UID
  companyUid: string;// Uses UID for relation
}
```

### ❌ Mistake 2: Using :id in Routes

```typescript
// ❌ WRONG
@Get(':id')
async findOne(@Param('id') id: number) { }

// ✅ CORRECT
@Get(':uid')
async findOne(@Param('uid') uid: string) { }
```

### ❌ Mistake 3: Querying by Numeric ID

```typescript
// ❌ WRONG
async findOne(id: number) {
  return this.prisma.user.findUnique({ where: { id } });
}

// ✅ CORRECT
async findOne(uid: string) {
  return this.prisma.user.findUnique({ where: { uid } });
}
```

### ❌ Mistake 4: Frontend Using Numeric IDs

```typescript
// ❌ WRONG
interface User {
  id: number;
  companyId: number;
}

// ✅ CORRECT
interface User {
  uid: string;
  companyUid: string;
}
```

## Verification

### Backend Verification

```bash
# Search for :id in routes (should return nothing in controllers)
grep -r "@Get(':id')" src/modules/

# Search for numeric ID in DTOs (should return nothing in dto files)
grep -r "id: number" src/modules/*/dto/

# Verify all routes use :uid
grep -r "@Get(':uid')" src/modules/
grep -r "@Put(':uid')" src/modules/
grep -r "@Delete(':uid')" src/modules/
```

### Frontend Verification

```bash
# Search for numeric ID in types (should return nothing)
grep -r "id: number" src/types/

# Search for numeric ID in routes (should return nothing)
grep -r "/:id" src/

# Verify all routes use :uid
grep -r "/:uid" src/
```

## Related Notes

- [[Architecture-Overview|Architecture Overview]]
- [[Backend-Architecture|Backend Architecture]]
- [[API-Overview|API Documentation]]
- [[Database-Schema|Database Schema]]

## See Also

- [[Security-Architecture|Security Architecture]]
- [[Coding-Standards-Overview|Coding Standards Overview]]

---

**Status**: CRITICAL - Must be followed at all times
**Last Updated**: 2025-11-24
**Review Frequency**: Before every feature implementation
