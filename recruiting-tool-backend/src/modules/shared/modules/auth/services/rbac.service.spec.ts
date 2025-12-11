import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from '../guards/roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RolesType } from '@prisma/client';

/**
 * Unit tests for RBAC (Role-Based Access Control) logic
 * Tests role hierarchy, permission checks, and guard behavior
 */
describe('RBAC Service Logic', () => {
  let guard: RolesGuard;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  const createMockExecutionContext = (user: any): ExecutionContext => {
    return {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          currentUser: user,
        }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesGuard, { provide: Reflector, useValue: mockReflector }],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);

    jest.clearAllMocks();
  });

  describe('Role Hierarchy', () => {
    /**
     * Role hierarchy (from highest to lowest):
     * 1. SUPER_ADMIN (level 1)
     * 2. ADMIN (level 2)
     * 3. HR, HR_MANAGER, RECRUITER, COMPANY_OWNER, COMPANY_ADMIN (level 3)
     * 4. USER (level 4)
     */

    it('should allow SUPER_ADMIN to access any role-protected endpoint', () => {
      const testCases = [{ requiredRoles: [RolesType.USER] }, { requiredRoles: [RolesType.HR] }, { requiredRoles: [RolesType.ADMIN] }, { requiredRoles: [RolesType.SUPER_ADMIN] }];

      testCases.forEach(({ requiredRoles }) => {
        const mockContext = createMockExecutionContext({
          id: 1,
          email: 'superadmin@example.com',
          roles: [RolesType.SUPER_ADMIN],
        });

        mockReflector.getAllAndOverride.mockReturnValue(requiredRoles);

        const result = guard.canActivate(mockContext);
        expect(result).toBe(true);
      });
    });

    it('should allow ADMIN to access HR and USER endpoints', () => {
      const testCases = [
        { requiredRoles: [RolesType.USER], shouldAllow: true },
        { requiredRoles: [RolesType.HR], shouldAllow: true },
        { requiredRoles: [RolesType.ADMIN], shouldAllow: true },
      ];

      testCases.forEach(({ requiredRoles, shouldAllow }) => {
        const mockContext = createMockExecutionContext({
          id: 1,
          email: 'admin@example.com',
          roles: [RolesType.ADMIN],
        });

        mockReflector.getAllAndOverride.mockReturnValue(requiredRoles);

        const result = guard.canActivate(mockContext);
        expect(result).toBe(shouldAllow);
      });
    });

    it('should deny ADMIN access to SUPER_ADMIN-only endpoints', () => {
      const mockContext = createMockExecutionContext({
        id: 1,
        email: 'admin@example.com',
        roles: [RolesType.ADMIN],
      });

      mockReflector.getAllAndOverride.mockReturnValue([RolesType.SUPER_ADMIN]);

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(mockContext)).toThrow('Access Denied: Insufficient Permissions');
    });

    it('should allow HR to access USER endpoints', () => {
      const mockContext = createMockExecutionContext({
        id: 1,
        email: 'hr@example.com',
        roles: [RolesType.HR],
      });

      mockReflector.getAllAndOverride.mockReturnValue([RolesType.USER]);

      const result = guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it('should deny HR access to ADMIN endpoints', () => {
      const mockContext = createMockExecutionContext({
        id: 1,
        email: 'hr@example.com',
        roles: [RolesType.HR],
      });

      mockReflector.getAllAndOverride.mockReturnValue([RolesType.ADMIN]);

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    });

    it('should deny USER access to HR endpoints', () => {
      const mockContext = createMockExecutionContext({
        id: 1,
        email: 'user@example.com',
        roles: [RolesType.USER],
      });

      mockReflector.getAllAndOverride.mockReturnValue([RolesType.HR]);

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    });
  });

  describe('Multiple Roles', () => {
    it('should use highest role when user has multiple roles', () => {
      const mockContext = createMockExecutionContext({
        id: 1,
        email: 'multirole@example.com',
        roles: [RolesType.HR, RolesType.ADMIN],
      });

      // ADMIN is higher than HR, so should have access to HR-only endpoints
      mockReflector.getAllAndOverride.mockReturnValue([RolesType.HR]);

      const result = guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it('should grant access if user has any role equal or higher than required', () => {
      const mockContext = createMockExecutionContext({
        id: 1,
        email: 'multirole@example.com',
        roles: [RolesType.USER, RolesType.HR],
      });

      // User has HR role, which is required
      mockReflector.getAllAndOverride.mockReturnValue([RolesType.HR]);

      const result = guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it('should deny access if none of user roles meet requirement', () => {
      const mockContext = createMockExecutionContext({
        id: 1,
        email: 'multirole@example.com',
        roles: [RolesType.USER, RolesType.HR],
      });

      // User has HR and USER, but ADMIN is required
      mockReflector.getAllAndOverride.mockReturnValue([RolesType.ADMIN]);

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    });
  });

  describe('Multiple Required Roles', () => {
    it('should allow access if user has role equal or higher than any required role', () => {
      const mockContext = createMockExecutionContext({
        id: 1,
        email: 'hr@example.com',
        roles: [RolesType.HR],
      });

      // Endpoint requires either USER or HR (lower required role level is HR)
      mockReflector.getAllAndOverride.mockReturnValue([RolesType.USER, RolesType.HR]);

      const result = guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it('should check against the lowest required role level', () => {
      const mockContext = createMockExecutionContext({
        id: 1,
        email: 'user@example.com',
        roles: [RolesType.USER],
      });

      // Endpoint requires USER or HR - USER should have access
      mockReflector.getAllAndOverride.mockReturnValue([RolesType.USER, RolesType.HR]);

      const result = guard.canActivate(mockContext);
      expect(result).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should throw error when user has no roles', () => {
      const mockContext = createMockExecutionContext({
        id: 1,
        email: 'noroles@example.com',
        roles: undefined,
      });

      mockReflector.getAllAndOverride.mockReturnValue([RolesType.HR]);

      // Guard will fail when trying to map over undefined roles
      expect(() => guard.canActivate(mockContext)).toThrow();
    });

    it('should throw error when user has empty roles array', () => {
      const mockContext = createMockExecutionContext({
        id: 1,
        email: 'emptyroles@example.com',
        roles: [],
      });

      mockReflector.getAllAndOverride.mockReturnValue([RolesType.HR]);

      // Math.min on empty array returns Infinity
      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    });

    it('should handle unknown roles gracefully', () => {
      const mockContext = createMockExecutionContext({
        id: 1,
        email: 'unknown@example.com',
        roles: ['UNKNOWN_ROLE' as any],
      });

      mockReflector.getAllAndOverride.mockReturnValue([RolesType.HR]);

      // Unknown role gets Infinity level, should deny access
      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    });
  });

  describe('Special Roles', () => {
    it('should treat COMPANY_OWNER as same level as HR', () => {
      const mockContext = createMockExecutionContext({
        id: 1,
        email: 'owner@example.com',
        roles: [RolesType.COMPANY_OWNER],
      });

      // COMPANY_OWNER should have access to HR endpoints
      mockReflector.getAllAndOverride.mockReturnValue([RolesType.HR]);

      const result = guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it('should treat HR_MANAGER as same level as HR', () => {
      const mockContext = createMockExecutionContext({
        id: 1,
        email: 'hrmanager@example.com',
        roles: [RolesType.HR_MANAGER],
      });

      mockReflector.getAllAndOverride.mockReturnValue([RolesType.HR]);

      const result = guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it('should treat RECRUITER as same level as HR', () => {
      const mockContext = createMockExecutionContext({
        id: 1,
        email: 'recruiter@example.com',
        roles: [RolesType.RECRUITER],
      });

      mockReflector.getAllAndOverride.mockReturnValue([RolesType.HR]);

      const result = guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it('should treat COMPANY_ADMIN as same level as HR', () => {
      const mockContext = createMockExecutionContext({
        id: 1,
        email: 'companyadmin@example.com',
        roles: [RolesType.COMPANY_ADMIN],
      });

      mockReflector.getAllAndOverride.mockReturnValue([RolesType.HR]);

      const result = guard.canActivate(mockContext);
      expect(result).toBe(true);
    });
  });

  describe('Role Level Calculations', () => {
    it('should correctly calculate SUPER_ADMIN as level 1', () => {
      // Access private method via reflection for testing
      const getRoleLevel = (guard as any).getRoleLevel.bind(guard);
      expect(getRoleLevel(RolesType.SUPER_ADMIN)).toBe(1);
    });

    it('should correctly calculate ADMIN as level 2', () => {
      const getRoleLevel = (guard as any).getRoleLevel.bind(guard);
      expect(getRoleLevel(RolesType.ADMIN)).toBe(2);
    });

    it('should correctly calculate HR as level 3', () => {
      const getRoleLevel = (guard as any).getRoleLevel.bind(guard);
      expect(getRoleLevel(RolesType.HR)).toBe(3);
    });

    it('should correctly calculate USER as level 4', () => {
      const getRoleLevel = (guard as any).getRoleLevel.bind(guard);
      expect(getRoleLevel(RolesType.USER)).toBe(4);
    });

    it('should return Infinity for unknown roles', () => {
      const getRoleLevel = (guard as any).getRoleLevel.bind(guard);
      expect(getRoleLevel('UNKNOWN_ROLE' as any)).toBe(Infinity);
    });
  });

  describe('Access Control Scenarios', () => {
    interface Scenario {
      description: string;
      userRoles: RolesType[];
      requiredRoles: RolesType[];
      shouldAllow: boolean;
    }

    const scenarios: Scenario[] = [
      // Same level access
      {
        description: 'USER accessing USER endpoint',
        userRoles: [RolesType.USER],
        requiredRoles: [RolesType.USER],
        shouldAllow: true,
      },
      {
        description: 'HR accessing HR endpoint',
        userRoles: [RolesType.HR],
        requiredRoles: [RolesType.HR],
        shouldAllow: true,
      },

      // Higher role accessing lower role endpoints
      {
        description: 'ADMIN accessing HR endpoint',
        userRoles: [RolesType.ADMIN],
        requiredRoles: [RolesType.HR],
        shouldAllow: true,
      },
      {
        description: 'SUPER_ADMIN accessing USER endpoint',
        userRoles: [RolesType.SUPER_ADMIN],
        requiredRoles: [RolesType.USER],
        shouldAllow: true,
      },
      {
        description: 'HR accessing USER endpoint',
        userRoles: [RolesType.HR],
        requiredRoles: [RolesType.USER],
        shouldAllow: true,
      },

      // Lower role accessing higher role endpoints (should deny)
      {
        description: 'USER accessing HR endpoint',
        userRoles: [RolesType.USER],
        requiredRoles: [RolesType.HR],
        shouldAllow: false,
      },
      {
        description: 'HR accessing ADMIN endpoint',
        userRoles: [RolesType.HR],
        requiredRoles: [RolesType.ADMIN],
        shouldAllow: false,
      },
      {
        description: 'ADMIN accessing SUPER_ADMIN endpoint',
        userRoles: [RolesType.ADMIN],
        requiredRoles: [RolesType.SUPER_ADMIN],
        shouldAllow: false,
      },

      // Multiple roles scenarios
      {
        description: 'HR+ADMIN accessing HR endpoint',
        userRoles: [RolesType.HR, RolesType.ADMIN],
        requiredRoles: [RolesType.HR],
        shouldAllow: true,
      },
      {
        description: 'USER+HR accessing ADMIN endpoint',
        userRoles: [RolesType.USER, RolesType.HR],
        requiredRoles: [RolesType.ADMIN],
        shouldAllow: false,
      },

      // Special roles
      {
        description: 'COMPANY_OWNER accessing HR endpoint',
        userRoles: [RolesType.COMPANY_OWNER],
        requiredRoles: [RolesType.HR],
        shouldAllow: true,
      },
      {
        description: 'HR_MANAGER accessing USER endpoint',
        userRoles: [RolesType.HR_MANAGER],
        requiredRoles: [RolesType.USER],
        shouldAllow: true,
      },
      {
        description: 'RECRUITER accessing HR endpoint',
        userRoles: [RolesType.RECRUITER],
        requiredRoles: [RolesType.HR],
        shouldAllow: true,
      },
    ];

    scenarios.forEach(({ description, userRoles, requiredRoles, shouldAllow }) => {
      it(description, () => {
        const mockContext = createMockExecutionContext({
          id: 1,
          email: 'test@example.com',
          roles: userRoles,
        });

        mockReflector.getAllAndOverride.mockReturnValue(requiredRoles);

        if (shouldAllow) {
          const result = guard.canActivate(mockContext);
          expect(result).toBe(true);
        } else {
          expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
          expect(() => guard.canActivate(mockContext)).toThrow('Access Denied: Insufficient Permissions');
        }
      });
    });
  });

  describe('Security Validations', () => {
    it('should not allow null or undefined user', () => {
      const mockContext = createMockExecutionContext(null);
      mockReflector.getAllAndOverride.mockReturnValue([RolesType.HR]);

      expect(() => guard.canActivate(mockContext)).toThrow();
    });

    it('should consistently enforce role hierarchy', () => {
      const rolesByLevel = [
        [RolesType.SUPER_ADMIN],
        [RolesType.ADMIN],
        [RolesType.HR, RolesType.HR_MANAGER, RolesType.RECRUITER, RolesType.COMPANY_OWNER, RolesType.COMPANY_ADMIN],
        [RolesType.USER],
      ];

      // Verify that roles at each level can access all lower levels
      rolesByLevel.forEach((currentLevelRoles, currentLevel) => {
        currentLevelRoles.forEach((role) => {
          // Test access to all lower levels
          for (let lowerLevel = currentLevel; lowerLevel < rolesByLevel.length; lowerLevel++) {
            rolesByLevel[lowerLevel].forEach((requiredRole) => {
              const mockContext = createMockExecutionContext({
                id: 1,
                email: 'test@example.com',
                roles: [role],
              });

              mockReflector.getAllAndOverride.mockReturnValue([requiredRole]);

              const result = guard.canActivate(mockContext);
              expect(result).toBe(true);
            });
          }
        });
      });
    });
  });
});
