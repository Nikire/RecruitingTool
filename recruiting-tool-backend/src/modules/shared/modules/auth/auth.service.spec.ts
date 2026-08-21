import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from 'src/modules/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UserActivityService } from 'src/modules/users/services/user-activity.service';
import { DatabaseService } from '../database/database.service';
import { EmailService } from 'src/modules/email/email.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { RolesType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
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
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    updateLastLogin: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    signAsync: jest.fn(),
    verify: jest.fn(),
  };

  const mockUserActivityService = {
    logActivity: jest.fn(),
  };

  const mockDatabaseService = {
    company: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    // register() now stamps an email-verification token onto the freshly created user
    // and re-reads it to seed the company's default email templates.
    user: {
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    emailTemplate: {
      createMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockEmailService = {
    sendVerificationEmail: jest.fn(),
    sendEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: UserActivityService, useValue: mockUserActivityService },
        { provide: DatabaseService, useValue: mockDatabaseService },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    databaseService = module.get<DatabaseService>(DatabaseService);

    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const createUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        roles: [RolesType.HR],
        companyUid: 'company-uid-123',
      };

      const createdUser = {
        uid: 'user-uid-123',
        name: createUserDto.name,
        email: createUserDto.email,
        roles: createUserDto.roles,
        password: '$2a$10$hashedpassword',
        isActive: true,
        id: 1,
        companyId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        lastLogin: null,
      };

      // First call returns null (user doesn't exist), second call returns the created user (for login)
      mockUsersService.findByEmail.mockResolvedValueOnce(null).mockResolvedValueOnce(createdUser);
      mockUsersService.create.mockResolvedValue(createdUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('mock-access-token');
      mockJwtService.sign.mockReturnValue('mock-token');
      mockDatabaseService.refreshToken.create.mockResolvedValue({
        id: 1,
        token: 'mock-refresh-token',
      });
      mockUsersService.updateLastLogin.mockResolvedValue(undefined);
      mockUserActivityService.logActivity.mockResolvedValue(undefined);

      const result = await service.register(createUserDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
      expect(usersService.findByEmail).toHaveBeenCalledWith(createUserDto.email);
      expect(usersService.create).toHaveBeenCalledWith(expect.objectContaining(createUserDto));
    });

    // BEHAVIOUR CHANGE: register() now forwards signup attribution to usersService.create(),
    // stores an email-verification token on the new user, and sends a verification email.
    it('should forward signup attribution and send a verification email', async () => {
      const createUserDto = {
        name: 'Attributed User',
        email: 'attributed@example.com',
        password: 'password123',
        roles: [RolesType.HR],
        companyUid: 'company-uid-123',
        utmSource: 'google',
        utmMedium: 'cpc',
        utmCampaign: 'launch',
        utmTerm: 'ats',
        utmContent: 'variant-b',
        referrerUrl: 'https://news.ycombinator.com/',
        landingPath: '/pricing',
      };

      const createdUser = { ...mockUser, uid: 'user-uid-attributed', email: createUserDto.email };

      mockUsersService.findByEmail.mockResolvedValueOnce(null).mockResolvedValueOnce(createdUser);
      mockUsersService.create.mockResolvedValue(createdUser);
      mockDatabaseService.user.update.mockResolvedValue(createdUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('mock-access-token');
      mockDatabaseService.refreshToken.create.mockResolvedValue({ id: 1, token: 'mock-refresh-token' });
      mockUsersService.updateLastLogin.mockResolvedValue(undefined);
      mockUserActivityService.logActivity.mockResolvedValue(undefined);
      mockEmailService.sendVerificationEmail.mockResolvedValue(undefined);

      await service.register(createUserDto);

      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          utmSource: 'google',
          utmMedium: 'cpc',
          utmCampaign: 'launch',
          utmTerm: 'ats',
          utmContent: 'variant-b',
          referrerUrl: 'https://news.ycombinator.com/',
          landingPath: '/pricing',
        }),
      );

      // A verification token is persisted against the new user...
      expect(mockDatabaseService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { uid: createdUser.uid },
          data: expect.objectContaining({
            emailVerificationToken: expect.any(String),
            emailVerificationSentAt: expect.any(Date),
          }),
        }),
      );

      // ...and the verification link is emailed to the address that just registered.
      expect(mockEmailService.sendVerificationEmail).toHaveBeenCalledWith(createUserDto.email, expect.stringContaining('/verify-email?token='));
    });

    it('should still register the user when the verification email fails to send', async () => {
      const createUserDto = {
        name: 'Resilient User',
        email: 'resilient@example.com',
        password: 'password123',
        roles: [RolesType.HR],
        companyUid: 'company-uid-123',
      };

      const createdUser = { ...mockUser, uid: 'user-uid-resilient', email: createUserDto.email };

      mockUsersService.findByEmail.mockResolvedValueOnce(null).mockResolvedValueOnce(createdUser);
      mockUsersService.create.mockResolvedValue(createdUser);
      mockDatabaseService.user.update.mockResolvedValue(createdUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('mock-access-token');
      mockDatabaseService.refreshToken.create.mockResolvedValue({ id: 1, token: 'mock-refresh-token' });
      mockUsersService.updateLastLogin.mockResolvedValue(undefined);
      mockUserActivityService.logActivity.mockResolvedValue(undefined);
      mockEmailService.sendVerificationEmail.mockRejectedValue(new Error('SMTP down'));

      const result = await service.register(createUserDto);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw BadRequestException if user already exists', async () => {
      const createUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      await expect(service.register(createUserDto)).rejects.toThrow(BadRequestException);
      expect(usersService.findByEmail).toHaveBeenCalledWith(createUserDto.email);
    });

    it('should auto-create company for COMPANY_OWNER role', async () => {
      const createUserDto = {
        name: 'Company Owner',
        email: 'owner@example.com',
        password: 'password123',
        roles: [RolesType.COMPANY_OWNER],
        companyName: 'My Company',
      };

      const mockCompany = {
        id: 1,
        uid: 'company-uid-123',
        name: 'My Company',
        description: 'Company created for Company Owner',
      };

      const createdUser = {
        uid: 'user-uid-123',
        name: createUserDto.name,
        email: createUserDto.email,
        roles: createUserDto.roles,
        companyId: mockCompany.id,
        password: '$2a$10$hashedpassword',
        isActive: true,
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        lastLogin: null,
      };

      // First call returns null (user doesn't exist), second call returns the created user (for login)
      mockUsersService.findByEmail.mockResolvedValueOnce(null).mockResolvedValueOnce(createdUser);
      mockDatabaseService.company.create.mockResolvedValue(mockCompany);
      mockUsersService.create.mockResolvedValue(createdUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('mock-access-token');
      mockJwtService.sign.mockReturnValue('mock-token');
      mockDatabaseService.refreshToken.create.mockResolvedValue({
        id: 1,
        token: 'mock-refresh-token',
      });
      mockUsersService.updateLastLogin.mockResolvedValue(undefined);
      mockUserActivityService.logActivity.mockResolvedValue(undefined);

      await service.register(createUserDto);

      expect(databaseService.company.create).toHaveBeenCalledWith({
        data: {
          name: 'My Company',
          description: 'Company created for Company Owner',
        },
      });
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('mock-access-token');
      mockJwtService.sign.mockReturnValue('mock-token');
      mockDatabaseService.refreshToken.create.mockResolvedValue({
        id: 1,
        token: 'mock-refresh-token',
      });
      mockUsersService.updateLastLogin.mockResolvedValue(undefined);
      mockUserActivityService.logActivity.mockResolvedValue(undefined);

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
      expect(usersService.updateLastLogin).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Email is wrong');
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Password is wrong');
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const inactiveUser = {
        ...mockUser,
        isActive: false,
      };

      mockUsersService.findByEmail.mockResolvedValue(inactiveUser);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('User account has been deactivated');
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh access token with valid refresh token', async () => {
      const refreshTokenDto = {
        refreshToken: 'valid-refresh-token',
      };

      const mockStoredToken = {
        id: 1,
        token: 'hashed-refresh-token',
        userId: mockUser.id,
        user: mockUser,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      };

      mockDatabaseService.refreshToken.findUnique.mockResolvedValue(mockStoredToken);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('new-access-token');

      const result = await service.refreshAccessToken(refreshTokenDto);

      expect(result).toHaveProperty('accessToken', 'new-access-token');
      expect(databaseService.refreshToken.findUnique).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      const refreshTokenDto = {
        refreshToken: 'invalid-refresh-token',
      };

      mockDatabaseService.refreshToken.findUnique.mockResolvedValue(null);

      await expect(service.refreshAccessToken(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if refresh token is expired', async () => {
      const refreshTokenDto = {
        refreshToken: 'expired-refresh-token',
      };

      const expiredToken = {
        id: 1,
        token: 'hashed-refresh-token',
        userId: mockUser.id,
        expiresAt: new Date(Date.now() - 1000), // Expired
      };

      mockDatabaseService.refreshToken.findUnique.mockResolvedValue(expiredToken);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.refreshAccessToken(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('revokeRefreshToken', () => {
    it('should revoke refresh token successfully', async () => {
      const refreshToken = 'valid-refresh-token';
      const mockStoredToken = {
        id: 1,
        token: refreshToken,
        userId: mockUser.id,
      };

      mockDatabaseService.refreshToken.findUnique.mockResolvedValue(mockStoredToken);
      mockDatabaseService.refreshToken.update.mockResolvedValue({
        ...mockStoredToken,
        revokedAt: new Date(),
      });

      await service.revokeRefreshToken(refreshToken);

      expect(databaseService.refreshToken.findUnique).toHaveBeenCalledWith({
        where: { token: refreshToken },
      });
      expect(databaseService.refreshToken.update).toHaveBeenCalled();
    });

    it('should silently succeed if token does not exist', async () => {
      const refreshToken = 'nonexistent-token';

      mockDatabaseService.refreshToken.findUnique.mockResolvedValue(null);

      await service.revokeRefreshToken(refreshToken);

      expect(databaseService.refreshToken.findUnique).toHaveBeenCalledWith({
        where: { token: refreshToken },
      });
      expect(databaseService.refreshToken.update).not.toHaveBeenCalled();
    });
  });
});
