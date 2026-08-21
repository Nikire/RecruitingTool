import { Test, TestingModule } from '@nestjs/testing';
import { CandidateController } from './candidate.controller';
import { CandidateService } from './candidate.service';
import { CandidateActivityService } from './services/candidate-activity.service';
import { CandidateImportService } from './candidate-import.service';
import { DatabaseService } from 'src/modules/shared/modules/database/database.service';
import { CreateCandidateDto, UpdateCandidateDto, CreateManualCandidateDto } from './dto/candidate.dto';
import { ApplicationSource, RolesType, User } from '@prisma/client';
import { AuthGuard } from 'src/modules/shared/modules/auth/guards/auth.guard';
import { RolesGuard } from 'src/modules/shared/modules/auth/guards/roles.guard';
import { StageNotesService } from 'src/modules/stage-notes/stage-notes.service';

describe('CandidateController', () => {
  let controller: CandidateController;
  let candidateService: CandidateService;

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

  const mockCandidateResponse = {
    uid: 'cand-uid-123',
    name: 'John Doe',
    email: 'john@example.com',
    source: ApplicationSource.LINKEDIN,
    sourceDetails: 'LinkedIn profile',
    sourceUrl: 'https://linkedin.com/in/johndoe',
    utmSource: 'linkedin',
    utmMedium: 'social',
    utmCampaign: 'summer_hiring',
  };

  const mockCandidateService = {
    create: jest.fn(),
    createManual: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    purge: jest.fn(),
    list: jest.fn(),
    createNote: jest.fn(),
    getNotes: jest.fn(),
    updateNote: jest.fn(),
    deleteNote: jest.fn(),
    getJourney: jest.fn(),
    exportCandidates: jest.fn(),
  };

  const mockCandidateActivityService = {
    getActivities: jest.fn(),
  };

  const mockCandidateImportService = {
    previewImport: jest.fn(),
    confirmImport: jest.fn(),
  };

  const mockDatabaseService = {
    candidate: {
      findUnique: jest.fn(),
    },
  };

  const mockStageNotesService = {
    findByCandidateUid: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CandidateController],
      providers: [
        { provide: CandidateService, useValue: mockCandidateService },
        { provide: CandidateActivityService, useValue: mockCandidateActivityService },
        { provide: CandidateImportService, useValue: mockCandidateImportService },
        { provide: DatabaseService, useValue: mockDatabaseService },
        { provide: StageNotesService, useValue: mockStageNotesService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CandidateController>(CandidateController);
    candidateService = module.get<CandidateService>(CandidateService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a candidate', async () => {
      const createDto: CreateCandidateDto = {
        name: 'John Doe',
        email: 'john@example.com',
        source: ApplicationSource.LINKEDIN,
      };

      mockCandidateService.create.mockResolvedValue(mockCandidateResponse);

      const mockUser = { id: 1, uid: 'user-uid', companyId: 1 } as any;
      const result = await controller.create(createDto, mockUser);

      expect(result).toEqual(mockCandidateResponse);
      expect(candidateService.create).toHaveBeenCalledWith(createDto, mockUser);
    });
  });

  describe('createManual', () => {
    it('should create a manual candidate with hiring process', async () => {
      const createManualDto: CreateManualCandidateDto = {
        name: 'John Doe',
        email: 'john@example.com',
        phoneNumber: '+1234567890',
        jobPositionUid: 'job-uid-123',
        sourceDetails: 'Phone call',
      };

      const mockHiringProcess = {
        uid: 'hp-uid-123',
        title: 'Software Engineer - John Doe',
        candidate: mockCandidateResponse,
      };

      mockCandidateService.createManual.mockResolvedValue(mockHiringProcess);

      const result = await controller.createManual(createManualDto, mockUser);

      expect(result).toEqual(mockHiringProcess);
      expect(candidateService.createManual).toHaveBeenCalledWith(createManualDto, mockUser);
    });
  });

  describe('findAll', () => {
    it('should return all candidates', async () => {
      const mockCandidates = [mockCandidateResponse];
      mockCandidateService.findAll.mockResolvedValue(mockCandidates);

      const result = await controller.findAll(mockUser);

      expect(result).toEqual(mockCandidates);
      expect(candidateService.findAll).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('findOne', () => {
    it('should return a single candidate by UID', async () => {
      mockCandidateService.findOne.mockResolvedValue(mockCandidateResponse);

      const result = await controller.findOne('cand-uid-123', mockUser);

      expect(result).toEqual(mockCandidateResponse);
      expect(candidateService.findOne).toHaveBeenCalledWith('cand-uid-123', mockUser);
    });
  });

  describe('update', () => {
    it('should update a candidate', async () => {
      const updateDto: UpdateCandidateDto = {
        name: 'Jane Doe',
      };

      const updatedCandidate = {
        ...mockCandidateResponse,
        name: 'Jane Doe',
      };

      mockCandidateService.update.mockResolvedValue(updatedCandidate);

      const result = await controller.update('cand-uid-123', updateDto, mockUser);

      expect(result).toEqual(updatedCandidate);
      expect(candidateService.update).toHaveBeenCalledWith('cand-uid-123', updateDto, mockUser);
    });
  });

  describe('remove', () => {
    it('should soft delete a candidate', async () => {
      const mockResponse = { message: 'Candidate deleted successfully' };
      mockCandidateService.remove.mockResolvedValue(mockResponse);

      const result = await controller.remove('cand-uid-123', mockUser);

      expect(result).toEqual(mockResponse);
      expect(candidateService.remove).toHaveBeenCalledWith('cand-uid-123', mockUser);
    });
  });

  describe('purge', () => {
    it('should permanently delete a candidate (GDPR)', async () => {
      const mockSuperAdmin = {
        ...mockUser,
        roles: [RolesType.SUPER_ADMIN],
      };

      const mockResponse = { message: 'Candidate permanently deleted' };
      mockCandidateService.purge.mockResolvedValue(mockResponse);

      const result = await controller.purge('cand-uid-123', mockSuperAdmin);

      expect(result).toEqual(mockResponse);
      expect(candidateService.purge).toHaveBeenCalledWith('cand-uid-123', mockSuperAdmin);
    });
  });

  describe('list', () => {
    it('should return paginated candidates with filters', async () => {
      const filterDto = {
        page: 1,
        limit: 10,
        search: 'John',
      };

      const mockPaginatedResponse = {
        data: [mockCandidateResponse],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockCandidateService.list.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.list(filterDto, mockUser);

      expect(result).toEqual(mockPaginatedResponse);
      expect(candidateService.list).toHaveBeenCalledWith(filterDto, mockUser);
    });
  });
});
