import { Test, TestingModule } from '@nestjs/testing';
import { CandidateService } from './candidate.service';
import { DatabaseService } from 'src/modules/shared/modules/database/database.service';
import { EmailService } from 'src/modules/email/email.service';
import { StorageService } from 'src/modules/storage/storage.service';
import { AuditLogService } from 'src/modules/audit-log/audit-log.service';
import { CandidateActivityService } from './services/candidate-activity.service';
import { NotificationsService } from 'src/modules/notifications/notifications.service';
import { ActivationEventsService } from 'src/modules/tracking/activation-events.service';
import { CreateCandidateDto, UpdateCandidateDto, CreateManualCandidateDto } from './dto/candidate.dto';
import { ApplicationSource, RolesType, User } from '@prisma/client';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { EntityNotFoundException } from 'src/common/exceptions';

describe('CandidateService', () => {
  let service: CandidateService;
  let databaseService: DatabaseService;
  let candidateActivityService: CandidateActivityService;

  const mockCandidate = {
    id: 1,
    uid: 'cand-uid-123',
    name: 'John Doe',
    email: 'john@example.com',
    source: ApplicationSource.LINKEDIN,
    sourceDetails: 'LinkedIn profile',
    sourceUrl: 'https://linkedin.com/in/johndoe',
    utmSource: 'linkedin',
    utmMedium: 'social',
    utmCampaign: 'summer_hiring',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    // Candidates are tenant-scoped since @@unique([email, companyId]); every
    // write path sets companyId. The fixture models a candidate owned by the
    // same company as `mockUser` (companyId 1).
    companyId: 1,
  };

  const mockUser = {
    id: 1,
    uid: 'user-uid-123',
    email: 'hr@example.com',
    name: 'HR Manager',
    password: 'hashed_password',
    roles: [RolesType.HR],
    companyId: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    lastLogin: null,
  } as unknown as User;

  const mockJobPosition = {
    id: 1,
    uid: 'job-uid-123',
    title: 'Software Engineer',
    description: 'Senior Software Engineer position',
    companyId: 1,
    company: {
      id: 1,
      uid: 'company-uid-123',
      name: 'Test Company',
      description: 'Test company description',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    },
    stages: [
      {
        id: 1,
        uid: 'stage-uid-123',
        title: 'Application Review',
        type: 'REVIEW',
        position: 0,
        jobPositionId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockDatabaseService = {
    candidate: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    hiringProcess: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    jobPosition: {
      findUnique: jest.fn(),
    },
    stage: {
      createMany: jest.fn(),
    },
    candidateStageHistory: {
      createMany: jest.fn(),
    },
    candidateNote: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockCandidateActivityService = {
    logActivity: jest.fn(),
  };

  const mockEmailService = {
    sendWelcomeEmail: jest.fn(),
    sendEmail: jest.fn(),
  };

  const mockStorageService = {
    deleteFile: jest.fn(),
  };

  const mockAuditLogService = {
    createLog: jest.fn(),
    logAction: jest.fn(),
  };

  const mockNotificationsService = {
    create: jest.fn(),
  };

  const mockActivationEventsService = {
    candidateCreated: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CandidateService,
        { provide: DatabaseService, useValue: mockDatabaseService },
        { provide: CandidateActivityService, useValue: mockCandidateActivityService },
        { provide: EmailService, useValue: mockEmailService },
        { provide: StorageService, useValue: mockStorageService },
        { provide: AuditLogService, useValue: mockAuditLogService },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: ActivationEventsService, useValue: mockActivationEventsService },
      ],
    }).compile();

    service = module.get<CandidateService>(CandidateService);
    databaseService = module.get<DatabaseService>(DatabaseService);
    candidateActivityService = module.get<CandidateActivityService>(CandidateActivityService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a candidate successfully', async () => {
      const createDto: CreateCandidateDto = {
        name: 'John Doe',
        email: 'john@example.com',
        source: ApplicationSource.LINKEDIN,
        sourceDetails: 'LinkedIn profile',
        sourceUrl: 'https://linkedin.com/in/johndoe',
        utmSource: 'linkedin',
        utmMedium: 'social',
        utmCampaign: 'summer_hiring',
      };

      mockDatabaseService.candidate.create.mockResolvedValue(mockCandidate);
      mockCandidateActivityService.logActivity.mockResolvedValue(undefined);

      const result = await service.create(createDto);

      expect(result).toHaveProperty('uid', mockCandidate.uid);
      expect(result).toHaveProperty('name', mockCandidate.name);
      expect(result).toHaveProperty('email', mockCandidate.email);
      expect(databaseService.candidate.create).toHaveBeenCalledWith({
        data: {
          name: createDto.name,
          email: createDto.email,
          source: createDto.source,
          sourceDetails: createDto.sourceDetails,
          sourceUrl: createDto.sourceUrl,
          utmSource: createDto.utmSource,
          utmMedium: createDto.utmMedium,
          utmCampaign: createDto.utmCampaign,
        },
        // The service now hydrates the createdByUser relation so the mapper can expose it.
        include: { createdByUser: true },
      });
    });

    it('should log candidate creation activity', async () => {
      const createDto: CreateCandidateDto = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      mockDatabaseService.candidate.create.mockResolvedValue(mockCandidate);
      mockCandidateActivityService.logActivity.mockResolvedValue(undefined);

      await service.create(createDto);

      expect(candidateActivityService.logActivity).toHaveBeenCalledWith(
        mockCandidate.id,
        expect.any(String), // CandidateActivityType.CREATED
        expect.stringContaining('Candidate profile created'),
        null,
        expect.objectContaining({ source: mockCandidate.source, email: mockCandidate.email }),
      );
    });

    it('should handle activity logging errors gracefully', async () => {
      const createDto: CreateCandidateDto = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      mockDatabaseService.candidate.create.mockResolvedValue(mockCandidate);
      mockCandidateActivityService.logActivity.mockRejectedValue(new Error('Activity logging failed'));

      // Should not throw even if activity logging fails
      const result = await service.create(createDto);
      expect(result).toHaveProperty('uid', mockCandidate.uid);
    });
  });

  describe('createManual', () => {
    it('should create manual candidate and hiring process successfully', async () => {
      const createManualDto: CreateManualCandidateDto = {
        name: 'John Doe',
        email: 'john@example.com',
        phoneNumber: '+1234567890',
        jobPositionUid: 'job-uid-123',
        sourceDetails: 'Phone call',
      };

      const mockHiringProcess = {
        id: 1,
        uid: 'hp-uid-123',
        title: 'Software Engineer - John Doe',
        candidateId: 1,
        jobPositionId: 1,
        companyId: 1,
        candidate: mockCandidate,
        jobPosition: mockJobPosition,
        company: mockJobPosition.company,
        stages: [
          {
            id: 1,
            uid: 'stage-uid-123',
            title: 'Application Review',
            type: 'REVIEW',
            position: 0,
            hiringProcessId: 1,
          },
        ],
      };

      mockDatabaseService.jobPosition.findUnique.mockResolvedValue(mockJobPosition);
      mockDatabaseService.candidate.findUnique.mockResolvedValue(null); // No existing candidate
      mockDatabaseService.candidate.create.mockResolvedValue(mockCandidate);
      mockDatabaseService.hiringProcess.create.mockResolvedValue(mockHiringProcess);
      mockDatabaseService.hiringProcess.findUnique.mockResolvedValue(mockHiringProcess);
      mockDatabaseService.stage.createMany.mockResolvedValue({ count: 1 });
      mockDatabaseService.candidateStageHistory.createMany.mockResolvedValue({ count: 1 });
      mockEmailService.sendWelcomeEmail.mockResolvedValue(undefined);

      const result = await service.createManual(createManualDto, mockUser);

      expect(result).toHaveProperty('uid');
      expect(databaseService.jobPosition.findUnique).toHaveBeenCalledWith({
        where: { uid: createManualDto.jobPositionUid },
        include: expect.any(Object),
      });
      // The existing-candidate lookup must be scoped to the hiring company: Candidate.email
      // is unique per tenant, so an unscoped lookup would read another company's record.
      expect(databaseService.candidate.findUnique).toHaveBeenCalledWith({
        where: {
          email_companyId: { email: createManualDto.email, companyId: mockJobPosition.companyId },
        },
      });
      expect(databaseService.candidate.create).toHaveBeenCalledWith({
        data: {
          name: createManualDto.name,
          email: createManualDto.email,
          source: ApplicationSource.MANUAL,
          sourceDetails: createManualDto.sourceDetails,
          companyId: mockJobPosition.companyId,
          createdByUserId: mockUser.id,
        },
        include: { createdByUser: true },
      });
    });

    it('should throw EntityNotFoundException if job position not found', async () => {
      const createManualDto: CreateManualCandidateDto = {
        name: 'John Doe',
        email: 'john@example.com',
        jobPositionUid: 'invalid-uid',
      };

      mockDatabaseService.jobPosition.findUnique.mockResolvedValue(null);

      await expect(service.createManual(createManualDto, mockUser)).rejects.toThrow(EntityNotFoundException);
    });

    it('should throw NotFoundException if job position has no stages', async () => {
      const createManualDto: CreateManualCandidateDto = {
        name: 'John Doe',
        email: 'john@example.com',
        jobPositionUid: 'job-uid-123',
      };

      mockDatabaseService.jobPosition.findUnique.mockResolvedValue({
        ...mockJobPosition,
        stages: [], // No stages
      });

      await expect(service.createManual(createManualDto, mockUser)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if candidate email already exists for company', async () => {
      const createManualDto: CreateManualCandidateDto = {
        name: 'John Doe',
        email: 'john@example.com',
        jobPositionUid: 'job-uid-123',
      };

      mockDatabaseService.jobPosition.findUnique.mockResolvedValue(mockJobPosition);
      // A candidate row already scoped to this company is itself the conflict now -
      // the per-tenant unique index would reject the insert.
      mockDatabaseService.candidate.findUnique.mockResolvedValue({
        ...mockCandidate,
        companyId: 1,
      });

      await expect(service.createManual(createManualDto, mockUser)).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('should return a candidate by UID', async () => {
      mockDatabaseService.candidate.findFirst.mockResolvedValue({
        ...mockCandidate,
        hiringProcesses: [{ id: 1, companyId: 1 }],
      });

      const result = await service.findOne('cand-uid-123', mockUser);

      expect(result).toHaveProperty('uid', mockCandidate.uid);
      expect(databaseService.candidate.findFirst).toHaveBeenCalledWith({
        where: { uid: 'cand-uid-123', deletedAt: null },
        include: expect.any(Object),
      });
    });

    it('should throw EntityNotFoundException if candidate not found', async () => {
      mockDatabaseService.candidate.findFirst.mockResolvedValue(null);

      await expect(service.findOne('invalid-uid', mockUser)).rejects.toThrow(EntityNotFoundException);
    });

    it('should hide a candidate owned by another company', async () => {
      mockDatabaseService.candidate.findFirst.mockResolvedValue({
        ...mockCandidate,
        companyId: 99,
        hiringProcesses: [{ id: 1, companyId: 99 }],
      });

      await expect(service.findOne('cand-uid-123', mockUser)).rejects.toThrow(EntityNotFoundException);
    });

    it('should hide another company candidate that has no hiring process yet', async () => {
      // Regression guard: the old check only ran when hiringProcesses.length > 0,
      // so a freshly created / imported candidate was visible to every tenant.
      mockDatabaseService.candidate.findFirst.mockResolvedValue({
        ...mockCandidate,
        companyId: 99,
        hiringProcesses: [],
      });

      await expect(service.findOne('cand-uid-123', mockUser)).rejects.toThrow(EntityNotFoundException);
    });
  });

  describe('update', () => {
    it('should update a candidate successfully', async () => {
      const updateDto: UpdateCandidateDto = {
        name: 'Jane Doe',
        email: 'jane@example.com',
      };

      const updatedCandidate = {
        ...mockCandidate,
        name: updateDto.name,
        email: updateDto.email,
      };

      mockDatabaseService.candidate.findUnique.mockResolvedValue(mockCandidate);
      mockDatabaseService.candidate.update.mockResolvedValue(updatedCandidate);

      const result = await service.update('cand-uid-123', updateDto, mockUser);

      expect(result).toHaveProperty('name', updateDto.name);
      expect(result).toHaveProperty('email', updateDto.email);
      expect(databaseService.candidate.update).toHaveBeenCalledWith({
        where: { uid: 'cand-uid-123' },
        data: updateDto,
      });
    });

    it('should throw EntityNotFoundException if candidate not found during update', async () => {
      mockDatabaseService.candidate.findUnique.mockResolvedValue(null);

      await expect(service.update('invalid-uid', { name: 'Test' }, mockUser)).rejects.toThrow(EntityNotFoundException);
    });

    it('should refuse to update a candidate owned by another company', async () => {
      mockDatabaseService.candidate.findUnique.mockResolvedValue({
        ...mockCandidate,
        companyId: 99,
        hiringProcesses: [],
      });

      await expect(service.update('cand-uid-123', { name: 'Test' }, mockUser)).rejects.toThrow(EntityNotFoundException);
      expect(databaseService.candidate.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should soft delete a candidate successfully', async () => {
      mockDatabaseService.candidate.findUnique.mockResolvedValue(mockCandidate);
      mockDatabaseService.candidate.update.mockResolvedValue({
        ...mockCandidate,
        deletedAt: new Date(),
      });
      mockAuditLogService.logAction.mockResolvedValue(undefined);

      const result = await service.remove('cand-uid-123', mockUser);

      expect(result).toHaveProperty('message');
      expect(databaseService.candidate.update).toHaveBeenCalledWith({
        where: { uid: 'cand-uid-123' },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should throw EntityNotFoundException if candidate not found during removal', async () => {
      mockDatabaseService.candidate.findUnique.mockResolvedValue(null);

      await expect(service.remove('invalid-uid', mockUser)).rejects.toThrow(EntityNotFoundException);
    });

    it('should refuse to soft delete a candidate owned by another company', async () => {
      mockDatabaseService.candidate.findUnique.mockResolvedValue({
        ...mockCandidate,
        companyId: 99,
        hiringProcesses: [],
      });

      await expect(service.remove('cand-uid-123', mockUser)).rejects.toThrow(EntityNotFoundException);
      expect(databaseService.candidate.update).not.toHaveBeenCalled();
    });
  });

  describe('findNotesByCandidateUid', () => {
    it("should refuse to read another company's candidate notes", async () => {
      // This endpoint previously took no user at all and performed no tenancy
      // check, so any authenticated caller could read private recruiter notes.
      mockDatabaseService.candidate.findFirst.mockResolvedValue({
        ...mockCandidate,
        companyId: 99,
        hiringProcesses: [],
      });

      await expect(service.findNotesByCandidateUid('cand-uid-123', mockUser)).rejects.toThrow(EntityNotFoundException);
      expect(databaseService.candidateNote.findMany).not.toHaveBeenCalled();
    });
  });
});
