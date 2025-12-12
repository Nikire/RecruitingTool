import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { DatabaseService } from '../shared/modules/database/database.service';
import { StorageService } from '../storage/storage.service';
import { UserActivityService } from './services/user-activity.service';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { RolesType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('UsersService', () => {
  let service: UsersService;
  let databaseService: DatabaseService;

  const mockUser = {
    id: 1,
    uid: 'user-uid-123',
    email: 'test@example.com',
    name: 'Test User',
    password: '$2a$10$hashedpassword',
    roles: [RolesType.HR],
    companyId: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    lastLogin: null,
    company: {
      id: 1,
      uid: 'company-uid-123',
      name: 'Test Company',
      description: 'Test company',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    },
  };

  const mockDatabaseService = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    company: {
      findUnique: jest.fn(),
    },
    fileUpload: {
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockStorageService = {
    deleteFile: jest.fn(),
  };

  const mockUserActivityService = {
    logActivity: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: DatabaseService, useValue: mockDatabaseService },
        { provide: StorageService, useValue: mockStorageService },
        { provide: UserActivityService, useValue: mockUserActivityService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    databaseService = module.get<DatabaseService>(DatabaseService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const createDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        companyUid: 'company-uid-123',
      };

      mockDatabaseService.company.findUnique.mockResolvedValue(mockUser.company);
      mockDatabaseService.user.create.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2a$10$hashedpassword');

      const result = await service.create(createDto);

      expect(result).toHaveProperty('uid', mockUser.uid);
      expect(result).toHaveProperty('email', mockUser.email);
      expect(databaseService.user.create).toHaveBeenCalledWith({
        data: {
          name: createDto.name,
          email: createDto.email,
          password: '$2a$10$hashedpassword',
          companyId: mockUser.company.id,
        },
        include: {
          company: true,
        },
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      const createDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      mockDatabaseService.user.create.mockRejectedValue({ code: 'P2002' });

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if company not found', async () => {
      const createDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        companyUid: 'invalid-company-uid',
      };

      mockDatabaseService.company.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      mockDatabaseService.user.findFirst.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toHaveProperty('uid', mockUser.uid);
      expect(databaseService.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null if user not found', async () => {
      mockDatabaseService.user.findFirst.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findOne', () => {
    it('should return user by UID', async () => {
      mockDatabaseService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne('user-uid-123');

      expect(result).toHaveProperty('uid', mockUser.uid);
      expect(databaseService.user.findUnique).toHaveBeenCalledWith({
        where: { uid: 'user-uid-123' },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockDatabaseService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid-uid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const updateDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      const updatedUser = {
        ...mockUser,
        name: 'Updated Name',
      };

      mockDatabaseService.user.findUnique.mockResolvedValue(mockUser);
      mockDatabaseService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update('user-uid-123', updateDto);

      expect(result).toHaveProperty('name', 'Updated Name');
      expect(databaseService.user.update).toHaveBeenCalledWith({
        where: { uid: 'user-uid-123' },
        data: { name: 'Updated Name' },
        include: { company: true },
      });
    });

    it('should throw NotFoundException if user not found during update', async () => {
      mockDatabaseService.user.findUnique.mockResolvedValue(null);

      await expect(service.update('invalid-uid', { name: 'Test' })).rejects.toThrow();
    });
  });

  describe('remove', () => {
    it('should delete user successfully', async () => {
      mockDatabaseService.user.findUnique.mockResolvedValue(mockUser);
      mockDatabaseService.user.delete.mockResolvedValue(mockUser);

      const result = await service.remove('user-uid-123');

      expect(result).toHaveProperty('message');
      expect(databaseService.user.delete).toHaveBeenCalledWith({
        where: { uid: 'user-uid-123' },
      });
    });

    it('should throw NotFoundException if user not found during removal', async () => {
      mockDatabaseService.user.findUnique.mockResolvedValue(null);

      await expect(service.remove('invalid-uid')).rejects.toThrow(NotFoundException);
    });
  });
});
