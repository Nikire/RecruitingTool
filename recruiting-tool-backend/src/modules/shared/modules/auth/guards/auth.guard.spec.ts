import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../auth.service';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../decorators/skip-auth.decorator';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: AuthService;

  const mockAuthService = {
    verifyToken: jest.fn(),
  };

  // The guard reads route metadata through the Reflector, so the mock context must expose
  // getHandler()/getClass() exactly like a real ExecutionContext does.
  const mockExecutionContext = {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn(),
    }),
    getHandler: jest.fn().mockReturnValue(function handler() {}),
    getClass: jest.fn().mockReturnValue(class TestController {}),
    getType: jest.fn().mockReturnValue('http'),
    getArgs: jest.fn().mockReturnValue([]),
    getArgByIndex: jest.fn(),
    switchToRpc: jest.fn(),
    switchToWs: jest.fn(),
  } as unknown as ExecutionContext;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthGuard, { provide: AuthService, useValue: mockAuthService }, { provide: Reflector, useValue: mockReflector }],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();

    // Default: the route under test is NOT decorated with @SkipAuth().
    mockReflector.getAllAndOverride.mockImplementation((key: string) => (key === IS_PUBLIC_KEY ? false : undefined));
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true and set currentUser when valid token is provided', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        roles: ['HR'],
      };

      const mockRequest = {
        headers: {
          authorization: 'Bearer valid-token',
        },
      };

      mockAuthService.verifyToken.mockResolvedValue(mockUser);
      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockRequest).toHaveProperty('currentUser', mockUser);
      expect(mockRequest).toHaveProperty('token', 'valid-token');
      expect(authService.verifyToken).toHaveBeenCalledWith('valid-token');
    });

    it('should throw UnauthorizedException when no token is provided', async () => {
      const mockRequest = {
        headers: {},
      };

      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow('No token provided');
    });

    it('should throw UnauthorizedException when token verification fails', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer invalid-token',
        },
      };

      mockAuthService.verifyToken.mockRejectedValue(new Error('Token expired'));
      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow('Invalid token');
    });

    it('should return true without checking the token for @SkipAuth() routes', async () => {
      const mockRequest = { headers: {} };

      mockReflector.getAllAndOverride.mockImplementation((key: string) => key === IS_PUBLIC_KEY);
      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      await expect(guard.canActivate(mockExecutionContext)).resolves.toBe(true);
      expect(authService.verifyToken).not.toHaveBeenCalled();
    });

    it('should handle malformed authorization header', async () => {
      const mockRequest = {
        headers: {
          authorization: 'InvalidFormat',
        },
      };

      mockAuthService.verifyToken.mockRejectedValue(new Error('Invalid token'));
      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(UnauthorizedException);
    });
  });
});
