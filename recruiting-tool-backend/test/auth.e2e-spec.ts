import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DatabaseService } from '../src/modules/shared/modules/database/database.service';
import * as bcrypt from 'bcryptjs';
import { RolesType } from '@prisma/client';

describe('Authentication E2E Tests (e2e)', () => {
  let app: INestApplication;
  let databaseService: DatabaseService;

  // Test user credentials
  const testUser = {
    email: 'test-auth-user@example.com',
    password: 'TestPassword123!',
    name: 'Test Auth User',
  };

  const testCompany = {
    name: 'Test Auth Company',
    description: 'Company for auth testing',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply global validation pipe like in main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    databaseService = moduleFixture.get<DatabaseService>(DatabaseService);

    // Clean up any existing test data
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await app.close();
  });

  const cleanupTestData = async () => {
    // Delete test users (cascade will handle related data)
    await databaseService.user.deleteMany({
      where: {
        email: {
          contains: 'test-auth',
        },
      },
    });

    // Delete test companies
    await databaseService.company.deleteMany({
      where: {
        name: {
          contains: 'Test Auth',
        },
      },
    });
  };

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      // First create a company for the user
      const company = await databaseService.company.create({
        data: testCompany,
      });

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: testUser.email,
          password: testUser.password,
          name: testUser.name,
          roles: [RolesType.USER],
          companyUid: company.uid,
        })
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.name).toBe(testUser.name);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should reject registration with existing email', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: testUser.email, // Already registered
          password: 'AnotherPassword123!',
          name: 'Another User',
          roles: [RolesType.USER],
        })
        .expect(400);

      expect(response.body.message).toContain('User already exists');
    });

    it('should auto-create company for COMPANY_OWNER role', async () => {
      const ownerEmail = 'test-auth-owner@example.com';
      const companyName = 'Auto Created Company';

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: ownerEmail,
          password: testUser.password,
          name: 'Company Owner',
          roles: [RolesType.COMPANY_OWNER],
          companyName: companyName,
        })
        .expect(201);

      expect(response.body.user.email).toBe(ownerEmail);

      // Verify company was created
      const user = await databaseService.user.findUnique({
        where: { email: ownerEmail },
        include: { company: true },
      });

      expect(user).toBeDefined();
      expect(user.company).toBeDefined();
      expect(user.company.name).toBe(companyName);
    });

    it('should reject registration with invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: testUser.password,
          name: 'Test User',
          roles: [RolesType.USER],
        })
        .expect(400);
    });

    it('should reject registration with weak password', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test-weak@example.com',
          password: '123', // Too weak
          name: 'Test User',
          roles: [RolesType.USER],
        })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should reject login with invalid email', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password,
        })
        .expect(401);

      expect(response.body.message).toContain('Email is wrong');
    });

    it('should reject login with invalid password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!',
        })
        .expect(401);

      expect(response.body.message).toContain('Password is wrong');
    });

    it('should reject login for deactivated user', async () => {
      // Create a deactivated user
      const deactivatedEmail = 'test-auth-deactivated@example.com';
      const company = await databaseService.company.findFirst({
        where: { name: testCompany.name },
      });

      const hashedPassword = await bcrypt.hash(testUser.password, 10);
      await databaseService.user.create({
        data: {
          email: deactivatedEmail,
          password: hashedPassword,
          name: 'Deactivated User',
          roles: [RolesType.USER],
          companyId: company.id,
          isActive: false,
          deactivatedAt: new Date(),
        },
      });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: deactivatedEmail,
          password: testUser.password,
        })
        .expect(401);

      expect(response.body.message).toContain('User account has been deactivated');
    });

    it('should update lastLoginAt timestamp on successful login', async () => {
      const beforeLogin = new Date();

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(201);

      const user = await databaseService.user.findUnique({
        where: { email: testUser.email },
      });

      expect(user.lastLoginAt).toBeDefined();
      expect(user.lastLoginAt.getTime()).toBeGreaterThanOrEqual(beforeLogin.getTime());
    });
  });

  describe('JWT Token Management', () => {
    let accessToken: string;
    let refreshToken: string;

    beforeAll(async () => {
      // Login to get tokens
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      accessToken = response.body.token;
      refreshToken = response.body.refreshToken;
    });

    it('should accept valid access token', async () => {
      await request(app.getHttpServer())
        .get('/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('should reject request without token', async () => {
      const response = await request(app.getHttpServer())
        .get('/profile')
        .expect(401);

      expect(response.body.message).toContain('No token provided');
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/profile')
        .set('Authorization', 'Bearer invalid-token-12345')
        .expect(401);

      expect(response.body.message).toContain('Invalid token');
    });

    it('should reject request with malformed authorization header', async () => {
      await request(app.getHttpServer())
        .get('/profile')
        .set('Authorization', 'InvalidFormat')
        .expect(401);
    });

    describe('POST /auth/refresh', () => {
      it('should refresh access token with valid refresh token', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/refresh')
          .send({
            refreshToken: refreshToken,
          })
          .expect(201);

        expect(response.body).toHaveProperty('accessToken');
        expect(response.body).toHaveProperty('refreshToken');
        expect(response.body).toHaveProperty('expiresIn');

        // New tokens should be different from old ones
        expect(response.body.accessToken).not.toBe(accessToken);
        expect(response.body.refreshToken).not.toBe(refreshToken);

        // Update tokens for next tests
        accessToken = response.body.accessToken;
        refreshToken = response.body.refreshToken;
      });

      it('should reject invalid refresh token', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/refresh')
          .send({
            refreshToken: 'invalid-refresh-token-12345',
          })
          .expect(401);

        expect(response.body.message).toContain('Invalid refresh token');
      });

      it('should reject expired refresh token', async () => {
        // Create an expired refresh token
        const user = await databaseService.user.findUnique({
          where: { email: testUser.email },
        });

        const expiredToken = await databaseService.refreshToken.create({
          data: {
            token: 'expired-token-test',
            userId: user.id,
            expiresAt: new Date(Date.now() - 1000), // Already expired
          },
        });

        const response = await request(app.getHttpServer())
          .post('/auth/refresh')
          .send({
            refreshToken: expiredToken.token,
          })
          .expect(401);

        expect(response.body.message).toContain('Refresh token has expired');
      });

      it('should reject revoked refresh token', async () => {
        // Create and immediately revoke a token
        const user = await databaseService.user.findUnique({
          where: { email: testUser.email },
        });

        const revokedToken = await databaseService.refreshToken.create({
          data: {
            token: 'revoked-token-test',
            userId: user.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            revokedAt: new Date(),
          },
        });

        const response = await request(app.getHttpServer())
          .post('/auth/refresh')
          .send({
            refreshToken: revokedToken.token,
          })
          .expect(401);

        expect(response.body.message).toContain('Refresh token has been revoked');
      });
    });

    describe('POST /auth/logout', () => {
      it('should logout and revoke refresh token', async () => {
        // Get a fresh token for logout test
        const loginResponse = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: testUser.email,
            password: testUser.password,
          });

        const logoutRefreshToken = loginResponse.body.refreshToken;

        // Logout
        await request(app.getHttpServer())
          .post('/auth/logout')
          .set('Authorization', `Bearer ${loginResponse.body.token}`)
          .send({
            refreshToken: logoutRefreshToken,
          })
          .expect(201);

        // Try to use the revoked refresh token
        const response = await request(app.getHttpServer())
          .post('/auth/refresh')
          .send({
            refreshToken: logoutRefreshToken,
          })
          .expect(401);

        expect(response.body.message).toContain('Refresh token has been revoked');
      });
    });
  });

  describe('Token Security', () => {
    it('should not include sensitive data in JWT payload', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(201);

      const token = response.body.token;

      // Decode JWT without verification (just to inspect payload)
      const parts = token.split('.');
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

      // Should not contain password
      expect(payload).not.toHaveProperty('password');

      // Should contain necessary data
      expect(payload).toHaveProperty('email');
      expect(payload).toHaveProperty('roles');
      expect(payload).toHaveProperty('sub'); // User ID
    });

    it('should reject token after user is deactivated', async () => {
      // Create a new user
      const tempEmail = 'test-auth-temp@example.com';
      const company = await databaseService.company.findFirst({
        where: { name: testCompany.name },
      });

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: tempEmail,
          password: testUser.password,
          name: 'Temp User',
          roles: [RolesType.USER],
          companyUid: company.uid,
        });

      // Login to get token
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: tempEmail,
          password: testUser.password,
        });

      const token = loginResponse.body.token;

      // Token should work
      await request(app.getHttpServer())
        .get('/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Deactivate user
      await databaseService.user.update({
        where: { email: tempEmail },
        data: {
          isActive: false,
          deactivatedAt: new Date(),
        },
      });

      // Token should now be rejected
      const response = await request(app.getHttpServer())
        .get('/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);

      expect(response.body.message).toContain('User account has been deactivated');
    });
  });

  describe('Edge Cases', () => {
    it('should handle concurrent login requests', async () => {
      const promises = Array(5).fill(null).map(() =>
        request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: testUser.email,
            password: testUser.password,
          })
      );

      const responses = await Promise.all(promises);

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('refreshToken');
      });

      // Each should get a unique refresh token
      const refreshTokens = responses.map(r => r.body.refreshToken);
      const uniqueTokens = new Set(refreshTokens);
      expect(uniqueTokens.size).toBe(5);
    });

    it('should handle missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          // Missing password
        })
        .expect(400);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          // Missing email
          password: testUser.password,
        })
        .expect(400);
    });

    it('should trim whitespace from email during login', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: `  ${testUser.email}  `, // Email with whitespace
          password: testUser.password,
        })
        .expect(201);

      expect(response.body.user.email).toBe(testUser.email);
    });
  });
});
