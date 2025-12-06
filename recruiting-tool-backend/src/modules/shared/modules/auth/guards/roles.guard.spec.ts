import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RolesType } from '@prisma/client';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  const mockExecutionContext = {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn(),
    }),
    getHandler: jest.fn(),
    getClass: jest.fn(),
  } as unknown as ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        { provide: Reflector, useValue: mockReflector },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should allow access when user has SUPER_ADMIN role', () => {
      const mockRequest = {
        currentUser: {
          id: 1,
          email: 'admin@example.com',
          roles: [RolesType.SUPER_ADMIN],
        },
      };

      mockReflector.getAllAndOverride.mockReturnValue([RolesType.HR]);
      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should allow access when user has ADMIN role for HR requirement', () => {
      const mockRequest = {
        currentUser: {
          id: 1,
          email: 'admin@example.com',
          roles: [RolesType.ADMIN],
        },
      };

      mockReflector.getAllAndOverride.mockReturnValue([RolesType.HR]);
      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should allow access when user has exact required role', () => {
      const mockRequest = {
        currentUser: {
          id: 1,
          email: 'hr@example.com',
          roles: [RolesType.HR],
        },
      };

      mockReflector.getAllAndOverride.mockReturnValue([RolesType.HR]);
      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should deny access when user has lower role than required', () => {
      const mockRequest = {
        currentUser: {
          id: 1,
          email: 'user@example.com',
          roles: [RolesType.USER],
        },
      };

      mockReflector.getAllAndOverride.mockReturnValue([RolesType.HR]);
      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(mockExecutionContext)).toThrow('Access Denied: Insufficient Permissions');
    });

    it('should handle multiple required roles and allow highest user role', () => {
      const mockRequest = {
        currentUser: {
          id: 1,
          email: 'admin@example.com',
          roles: [RolesType.ADMIN, RolesType.HR],
        },
      };

      mockReflector.getAllAndOverride.mockReturnValue([RolesType.HR, RolesType.USER]);
      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should throw error when user has no roles', () => {
      const mockRequest = {
        currentUser: {
          id: 1,
          email: 'user@example.com',
          roles: undefined, // Explicitly undefined roles
        },
      };

      mockReflector.getAllAndOverride.mockReturnValue([RolesType.HR]);
      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      // The guard will fail when trying to map over undefined roles
      expect(() => guard.canActivate(mockExecutionContext)).toThrow();
    });

    it('should allow SUPER_ADMIN access to ADMIN-only routes', () => {
      const mockRequest = {
        currentUser: {
          id: 1,
          email: 'superadmin@example.com',
          roles: [RolesType.SUPER_ADMIN],
        },
      };

      mockReflector.getAllAndOverride.mockReturnValue([RolesType.ADMIN]);
      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should deny ADMIN access to SUPER_ADMIN-only routes', () => {
      const mockRequest = {
        currentUser: {
          id: 1,
          email: 'admin@example.com',
          roles: [RolesType.ADMIN],
        },
      };

      mockReflector.getAllAndOverride.mockReturnValue([RolesType.SUPER_ADMIN]);
      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(ForbiddenException);
    });
  });
});
