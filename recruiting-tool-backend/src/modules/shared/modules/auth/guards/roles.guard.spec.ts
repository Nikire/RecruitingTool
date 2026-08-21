import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RolesType } from '@prisma/client';
import { IS_PUBLIC_KEY } from '../decorators/skip-auth.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  const mockExecutionContext = {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn(),
    }),
    getHandler: jest.fn().mockReturnValue(function handler() {}),
    getClass: jest.fn().mockReturnValue(class TestController {}),
  } as unknown as ExecutionContext;

  /**
   * The guard asks the Reflector twice: once for IS_PUBLIC_KEY (@SkipAuth) and once for 'roles'.
   * A single mockReturnValue would answer the IS_PUBLIC_KEY lookup with a truthy role array and
   * short-circuit the guard, so the mock has to dispatch on the metadata key.
   */
  const setRequiredRoles = (requiredRoles: RolesType[], isPublic = false) => {
    mockReflector.getAllAndOverride.mockImplementation((key: string) => (key === IS_PUBLIC_KEY ? isPublic : requiredRoles));
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesGuard, { provide: Reflector, useValue: mockReflector }],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);

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

      setRequiredRoles([RolesType.HR]);
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

      setRequiredRoles([RolesType.HR]);
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

      setRequiredRoles([RolesType.HR]);
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

      setRequiredRoles([RolesType.HR]);
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

      setRequiredRoles([RolesType.HR, RolesType.USER]);
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

      setRequiredRoles([RolesType.HR]);
      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      // BEHAVIOUR CHANGE: roles are validated before being mapped, so a roleless
      // principal now yields a clean ForbiddenException (403) rather than a TypeError (500).
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(ForbiddenException);
    });

    it('should allow SUPER_ADMIN access to ADMIN-only routes', () => {
      const mockRequest = {
        currentUser: {
          id: 1,
          email: 'superadmin@example.com',
          roles: [RolesType.SUPER_ADMIN],
        },
      };

      setRequiredRoles([RolesType.ADMIN]);
      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should allow access to @SkipAuth() routes without evaluating roles', () => {
      const mockRequest = { currentUser: undefined };

      setRequiredRoles([RolesType.SUPER_ADMIN], true);
      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      expect(guard.canActivate(mockExecutionContext)).toBe(true);
    });

    it('should deny ADMIN access to SUPER_ADMIN-only routes', () => {
      const mockRequest = {
        currentUser: {
          id: 1,
          email: 'admin@example.com',
          roles: [RolesType.ADMIN],
        },
      };

      setRequiredRoles([RolesType.SUPER_ADMIN]);
      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(ForbiddenException);
    });
  });
});
