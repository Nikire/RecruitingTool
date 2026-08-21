import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from '../guards/roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RolesType } from '@prisma/client';
import { IS_PUBLIC_KEY } from '../decorators/skip-auth.decorator';

/**
 * Unit tests for RBAC (Role-Based Access Control) logic
 * Tests role hierarchy, permission checks, and guard behavior
 */
describe('RBAC Service Logic', () => {
  let guard: RolesGuard;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  /**
   * RolesGuard queries the Reflector twice per request: once for IS_PUBLIC_KEY (@SkipAuth)
   * and once for the 'roles' metadata. A blanket mockReturnValue answers the IS_PUBLIC_KEY
   * lookup with a truthy role array, which makes the guard return true before any role check
   * ever runs. The mock must therefore dispatch on the metadata key.
   */
  const setRequiredRoles = (requiredRoles: RolesType[], isPublic = false) => {
    mockReflector.getAllAndOverride.mockImplementation((key: string) => (key === IS_PUBLIC_KEY ? isPublic : requiredRoles));
  };

  const createMockExecutionContext = (user: any): ExecutionContext => {
    return {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          currentUser: user,
        }),
      }),
      getHandler: jest.fn().mockReturnValue(function handler() {}),
      getClass: jest.fn().mockReturnValue(class TestController {}),
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
     * Role hierarchy (from highest to lowest), as defined by `ROLE_LEVELS` in roles.guard.ts.
     * Every role now sits on its own level - there are no shared levels any more:
     * 1. SUPER_ADMIN
     * 2. ADMIN
     * 3. COMPANY_ADMIN
     * 4. COMPANY_OWNER
     * 5. HR_MANAGER
     * 6. HR
     * 7. RECRUITER
     * 8. USER
     *
     * A lower number means more authority; access is granted when the user's best (lowest)
     * level is <= the weakest (highest) level the route accepts.
     */

    it('should allow SUPER_ADMIN to access any role-protected endpoint', () => {
      const testCases = [{ requiredRoles: [RolesType.USER] }, { requiredRoles: [RolesType.HR] }, { requiredRoles: [RolesType.ADMIN] }, { requiredRoles: [RolesType.SUPER_ADMIN] }];

      testCases.forEach(({ requiredRoles }) => {
        const mockContext = createMockExecutionContext({
          id: 1,
          email: 'superadmin@example.com',
          roles: [RolesType.SUPER_ADMIN],
        });

        setRequiredRoles(requiredRoles);

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

        setRequiredRoles(requiredRoles);

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

      setRequiredRoles([RolesType.SUPER_ADMIN]);

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(mockContext)).toThrow('Access Denied: Insufficient Permissions');
    });

    it('should allow HR to access USER endpoints', () => {
      const mockContext = createMockExecutionContext({
        id: 1,
        email: 'hr@example.com',
        roles: [RolesType.HR],
      });

      setRequiredRoles([RolesType.USER]);

      const result = guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it('should deny HR access to ADMIN endpoints', () => {
      const mockContext = createMockExecutionContext({
        id: 1,
        email: 'hr@example.com',
        roles: [RolesType.HR],
      });

      setRequiredRoles([RolesType.ADMIN]);

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    });

    it('should deny USER access to HR endpoints', () => {
      const mockContext = createMockExecutionContext({
        id: 1,
        email: 'user@example.com',
        roles: [RolesType.USER],
      });

      setRequiredRoles([RolesType.HR]);

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
      setRequiredRoles([RolesType.HR]);

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
      setRequiredRoles([RolesType.HR]);

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
      setRequiredRoles([RolesType.ADMIN]);

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
      setRequiredRoles([RolesType.USER, RolesType.HR]);

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
      setRequiredRoles([RolesType.USER, RolesType.HR]);

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

      setRequiredRoles([RolesType.HR]);

      // BEHAVIOUR CHANGE: the guard now validates `roles` BEFORE mapping over it, so a
      // roleless principal produces a clean 403 instead of a TypeError surfaced as a 500.
      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(mockContext)).toThrow('Access Denied: Insufficient Permissions');
    });

    it('should throw error when user has empty roles array', () => {
      const mockContext = createMockExecutionContext({
        id: 1,
        email: 'emptyroles@example.com',
        roles: [],
      });

      setRequiredRoles([RolesType.HR]);

      // Math.min on empty array returns Infinity
      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    });

    it('should handle unknown roles gracefully', () => {
      const mockContext = createMockExecutionContext({
        id: 1,
        email: 'unknown@example.com',
        roles: ['UNKNOWN_ROLE' as any],
      });

      setRequiredRoles([RolesType.HR]);

      // Unknown role gets Infinity level, should deny access
      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    });
  });

  describe('Special Roles', () => {
    it('should let COMPANY_OWNER (level 4) reach HR endpoints', () => {
      const mockContext = createMockExecutionContext({
        id: 1,
        email: 'owner@example.com',
        roles: [RolesType.COMPANY_OWNER],
      });

      // COMPANY_OWNER should have access to HR endpoints
      setRequiredRoles([RolesType.HR]);

      const result = guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it('should let HR_MANAGER (level 5) reach HR endpoints', () => {
      const mockContext = createMockExecutionContext({
        id: 1,
        email: 'hrmanager@example.com',
        roles: [RolesType.HR_MANAGER],
      });

      setRequiredRoles([RolesType.HR]);

      const result = guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    // BEHAVIOUR CHANGE: RECRUITER is level 7, one step BELOW HR (level 6), so it can no
    // longer reach HR-only endpoints. It used to share HR's level under the old 4-level map.
    it('should deny RECRUITER (level 7) access to HR endpoints', () => {
      const mockContext = createMockExecutionContext({
        id: 1,
        email: 'recruiter@example.com',
        roles: [RolesType.RECRUITER],
      });

      setRequiredRoles([RolesType.HR]);

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    });

    it('should allow RECRUITER (level 7) to reach USER endpoints', () => {
      const mockContext = createMockExecutionContext({
        id: 1,
        email: 'recruiter@example.com',
        roles: [RolesType.RECRUITER],
      });

      setRequiredRoles([RolesType.USER]);

      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('should let COMPANY_ADMIN (level 3) reach HR endpoints', () => {
      const mockContext = createMockExecutionContext({
        id: 1,
        email: 'companyadmin@example.com',
        roles: [RolesType.COMPANY_ADMIN],
      });

      setRequiredRoles([RolesType.HR]);

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

    it('should correctly calculate COMPANY_ADMIN as level 3', () => {
      const getRoleLevel = (guard as any).getRoleLevel.bind(guard);
      expect(getRoleLevel(RolesType.COMPANY_ADMIN)).toBe(3);
    });

    it('should correctly calculate COMPANY_OWNER as level 4', () => {
      const getRoleLevel = (guard as any).getRoleLevel.bind(guard);
      expect(getRoleLevel(RolesType.COMPANY_OWNER)).toBe(4);
    });

    it('should correctly calculate HR_MANAGER as level 5', () => {
      const getRoleLevel = (guard as any).getRoleLevel.bind(guard);
      expect(getRoleLevel(RolesType.HR_MANAGER)).toBe(5);
    });

    it('should correctly calculate HR as level 6', () => {
      const getRoleLevel = (guard as any).getRoleLevel.bind(guard);
      expect(getRoleLevel(RolesType.HR)).toBe(6);
    });

    it('should correctly calculate RECRUITER as level 7', () => {
      const getRoleLevel = (guard as any).getRoleLevel.bind(guard);
      expect(getRoleLevel(RolesType.RECRUITER)).toBe(7);
    });

    it('should correctly calculate USER as level 8', () => {
      const getRoleLevel = (guard as any).getRoleLevel.bind(guard);
      expect(getRoleLevel(RolesType.USER)).toBe(8);
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
      // BEHAVIOUR CHANGE: RECRUITER (7) now sits below HR (6) in the 8-level hierarchy.
      {
        description: 'RECRUITER accessing HR endpoint',
        userRoles: [RolesType.RECRUITER],
        requiredRoles: [RolesType.HR],
        shouldAllow: false,
      },
      {
        description: 'RECRUITER accessing USER endpoint',
        userRoles: [RolesType.RECRUITER],
        requiredRoles: [RolesType.USER],
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

        setRequiredRoles(requiredRoles);

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
      setRequiredRoles([RolesType.HR]);

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    });

    // BEHAVIOUR CHANGE: a guarded handler that declares no @Auth roles now fails CLOSED.
    it('should deny access when the handler declares no required roles', () => {
      const mockContext = createMockExecutionContext({
        id: 1,
        email: 'superadmin@example.com',
        roles: [RolesType.SUPER_ADMIN],
      });

      mockReflector.getAllAndOverride.mockImplementation((key: string) => (key === IS_PUBLIC_KEY ? false : undefined));

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    });

    it('should consistently enforce role hierarchy', () => {
      // Mirrors `ROLE_LEVELS` in roles.guard.ts: one role per level, most authoritative first.
      const rolesByLevel = [
        [RolesType.SUPER_ADMIN],
        [RolesType.ADMIN],
        [RolesType.COMPANY_ADMIN],
        [RolesType.COMPANY_OWNER],
        [RolesType.HR_MANAGER],
        [RolesType.HR],
        [RolesType.RECRUITER],
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

              setRequiredRoles([requiredRole]);

              const result = guard.canActivate(mockContext);
              expect(result).toBe(true);
            });
          }
        });
      });
    });
  });
});
