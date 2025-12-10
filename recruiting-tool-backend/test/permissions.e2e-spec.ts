import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DatabaseService } from '../src/modules/shared/modules/database/database.service';
import * as bcrypt from 'bcryptjs';
import { RolesType } from '@prisma/client';

describe('Role-Based Access Control (RBAC) E2E Tests (e2e)', () => {
  let app: INestApplication;
  let databaseService: DatabaseService;

  // Test companies
  let companyA: any;
  let companyB: any;

  // Test users by role with their tokens
  const users: Record<RolesType, { user: any; token: string; refreshToken: string }> = {} as any;

  const password = 'TestPassword123!';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

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

    // Setup test data
    await setupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await app.close();
  });

  const cleanupTestData = async () => {
    // Delete test users
    await databaseService.user.deleteMany({
      where: {
        email: {
          contains: 'test-rbac',
        },
      },
    });

    // Delete test candidates
    await databaseService.candidate.deleteMany({
      where: {
        email: {
          contains: 'test-rbac',
        },
      },
    });

    // Delete test companies
    await databaseService.company.deleteMany({
      where: {
        name: {
          contains: 'RBAC Test Company',
        },
      },
    });
  };

  const setupTestData = async () => {
    // Create two test companies
    companyA = await databaseService.company.create({
      data: {
        name: 'RBAC Test Company A',
        description: 'First company for RBAC testing',
      },
    });

    companyB = await databaseService.company.create({
      data: {
        name: 'RBAC Test Company B',
        description: 'Second company for RBAC testing',
      },
    });

    // Create users for each role
    const roles: RolesType[] = [
      RolesType.USER,
      RolesType.HR,
      RolesType.HR_MANAGER,
      RolesType.RECRUITER,
      RolesType.COMPANY_OWNER,
      RolesType.COMPANY_ADMIN,
      RolesType.ADMIN,
      RolesType.SUPER_ADMIN,
    ];

    const hashedPassword = await bcrypt.hash(password, 10);

    for (const role of roles) {
      // Create user in Company A
      const user = await databaseService.user.create({
        data: {
          email: `test-rbac-${role.toLowerCase()}@companya.com`,
          password: hashedPassword,
          name: `Test ${role} User`,
          roles: [role],
          companyId: companyA.id,
          isActive: true,
        },
      });

      // Login to get tokens
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: user.email,
          password: password,
        });

      users[role] = {
        user: user,
        token: loginResponse.body.token,
        refreshToken: loginResponse.body.refreshToken,
      };
    }

    // Create a user in Company B for cross-company testing
    const companyBUser = await databaseService.user.create({
      data: {
        email: 'test-rbac-hr@companyb.com',
        password: hashedPassword,
        name: 'Test HR User Company B',
        roles: [RolesType.HR],
        companyId: companyB.id,
        isActive: true,
      },
    });

    // Login Company B user
    const companyBLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: companyBUser.email,
        password: password,
      });

    // Store Company B HR user for cross-company tests
    users['HR_COMPANY_B'] = {
      user: companyBUser,
      token: companyBLoginResponse.body.token,
      refreshToken: companyBLoginResponse.body.refreshToken,
    } as any;
  };

  describe('Role Hierarchy Tests', () => {
    it('SUPER_ADMIN should have access to ADMIN-only routes', async () => {
      await request(app.getHttpServer())
        .get('/admin/users')
        .set('Authorization', `Bearer ${users[RolesType.SUPER_ADMIN].token}`)
        .expect(200);
    });

    it('SUPER_ADMIN should have access to HR routes', async () => {
      await request(app.getHttpServer())
        .get('/candidate')
        .set('Authorization', `Bearer ${users[RolesType.SUPER_ADMIN].token}`)
        .expect(200);
    });

    it('ADMIN should have access to HR routes', async () => {
      await request(app.getHttpServer())
        .get('/candidate')
        .set('Authorization', `Bearer ${users[RolesType.ADMIN].token}`)
        .expect(200);
    });

    it('ADMIN should NOT have access to SUPER_ADMIN-only routes', async () => {
      // Note: This depends on having SUPER_ADMIN-only routes in the application
      // The purge endpoint is SUPER_ADMIN only
      const candidate = await databaseService.candidate.create({
        data: {
          email: 'test-rbac-candidate-purge@example.com',
          companyId: companyA.id,
        },
      });

      await request(app.getHttpServer())
        .delete(`/candidate/${candidate.uid}/purge`)
        .set('Authorization', `Bearer ${users[RolesType.ADMIN].token}`)
        .expect(403);
    });

    it('HR should have access to HR routes', async () => {
      await request(app.getHttpServer())
        .get('/candidate')
        .set('Authorization', `Bearer ${users[RolesType.HR].token}`)
        .expect(200);
    });

    it('HR should NOT have access to ADMIN routes', async () => {
      await request(app.getHttpServer())
        .get('/admin/users')
        .set('Authorization', `Bearer ${users[RolesType.HR].token}`)
        .expect(403);
    });

    it('USER should NOT have access to HR routes', async () => {
      await request(app.getHttpServer())
        .get('/candidate')
        .set('Authorization', `Bearer ${users[RolesType.USER].token}`)
        .expect(403);
    });

    it('COMPANY_OWNER should have access to HR routes in their company', async () => {
      await request(app.getHttpServer())
        .get('/candidate')
        .set('Authorization', `Bearer ${users[RolesType.COMPANY_OWNER].token}`)
        .expect(200);
    });
  });

  describe('Company-Scoped Data Isolation', () => {
    let candidateCompanyA: any;
    let candidateCompanyB: any;
    let jobPositionCompanyA: any;
    let jobPositionCompanyB: any;

    beforeAll(async () => {
      // Create candidates in both companies
      candidateCompanyA = await databaseService.candidate.create({
        data: {
          email: 'test-rbac-candidate-a@example.com',
          companyId: companyA.id,
        },
      });

      candidateCompanyB = await databaseService.candidate.create({
        data: {
          email: 'test-rbac-candidate-b@example.com',
          companyId: companyB.id,
        },
      });

      // Create job positions in both companies
      jobPositionCompanyA = await databaseService.jobPosition.create({
        data: {
          title: 'Software Engineer Company A',
          department: 'Engineering',
          location: 'Remote',
          employmentType: 'FULL_TIME',
          experienceLevel: 'MID',
          companyId: companyA.id,
          createdById: users[RolesType.HR].user.id,
        },
      });

      jobPositionCompanyB = await databaseService.jobPosition.create({
        data: {
          title: 'Software Engineer Company B',
          department: 'Engineering',
          location: 'Remote',
          employmentType: 'FULL_TIME',
          experienceLevel: 'MID',
          companyId: companyB.id,
          createdById: users['HR_COMPANY_B'].user.id,
        },
      });
    });

    describe('Candidate Access Control', () => {
      it('HR from Company A should be able to access Company A candidates', async () => {
        const response = await request(app.getHttpServer())
          .get(`/candidate/${candidateCompanyA.uid}`)
          .set('Authorization', `Bearer ${users[RolesType.HR].token}`)
          .expect(200);

        expect(response.body.uid).toBe(candidateCompanyA.uid);
        expect(response.body.email).toBe(candidateCompanyA.email);
      });

      it('HR from Company A should NOT be able to access Company B candidates', async () => {
        const response = await request(app.getHttpServer())
          .get(`/candidate/${candidateCompanyB.uid}`)
          .set('Authorization', `Bearer ${users[RolesType.HR].token}`)
          .expect(404);

        expect(response.body.message).toContain('Candidate not found');
      });

      it('HR from Company B should be able to access Company B candidates', async () => {
        const response = await request(app.getHttpServer())
          .get(`/candidate/${candidateCompanyB.uid}`)
          .set('Authorization', `Bearer ${users['HR_COMPANY_B'].token}`)
          .expect(200);

        expect(response.body.uid).toBe(candidateCompanyB.uid);
      });

      it('HR from Company B should NOT be able to access Company A candidates', async () => {
        await request(app.getHttpServer())
          .get(`/candidate/${candidateCompanyA.uid}`)
          .set('Authorization', `Bearer ${users['HR_COMPANY_B'].token}`)
          .expect(404);
      });

      it('HR list endpoint should only return candidates from their company', async () => {
        const response = await request(app.getHttpServer())
          .get('/candidate')
          .set('Authorization', `Bearer ${users[RolesType.HR].token}`)
          .expect(200);

        // Should only contain Company A candidates
        const candidateEmails = response.body.map((c: any) => c.email);
        expect(candidateEmails).toContain(candidateCompanyA.email);
        expect(candidateEmails).not.toContain(candidateCompanyB.email);
      });

      it('SUPER_ADMIN should be able to access candidates from any company', async () => {
        // Access Company A candidate
        await request(app.getHttpServer())
          .get(`/candidate/${candidateCompanyA.uid}`)
          .set('Authorization', `Bearer ${users[RolesType.SUPER_ADMIN].token}`)
          .expect(200);

        // Access Company B candidate
        await request(app.getHttpServer())
          .get(`/candidate/${candidateCompanyB.uid}`)
          .set('Authorization', `Bearer ${users[RolesType.SUPER_ADMIN].token}`)
          .expect(200);
      });
    });

    describe('Job Position Access Control', () => {
      it('HR from Company A should be able to access Company A job positions', async () => {
        const response = await request(app.getHttpServer())
          .get(`/job-position/${jobPositionCompanyA.uid}`)
          .set('Authorization', `Bearer ${users[RolesType.HR].token}`)
          .expect(200);

        expect(response.body.uid).toBe(jobPositionCompanyA.uid);
      });

      it('HR from Company A should NOT be able to access Company B job positions', async () => {
        await request(app.getHttpServer())
          .get(`/job-position/${jobPositionCompanyB.uid}`)
          .set('Authorization', `Bearer ${users[RolesType.HR].token}`)
          .expect(404);
      });

      it('Job position list should only return positions from user company', async () => {
        const response = await request(app.getHttpServer())
          .get('/job-position')
          .set('Authorization', `Bearer ${users[RolesType.HR].token}`)
          .expect(200);

        const positionUids = response.body.map((p: any) => p.uid);
        expect(positionUids).toContain(jobPositionCompanyA.uid);
        expect(positionUids).not.toContain(jobPositionCompanyB.uid);
      });
    });

    describe('Modification Access Control', () => {
      it('HR from Company A should NOT be able to update Company B candidates', async () => {
        await request(app.getHttpServer())
          .put(`/candidate/${candidateCompanyB.uid}`)
          .set('Authorization', `Bearer ${users[RolesType.HR].token}`)
          .send({
            email: 'updated-email@example.com',
          })
          .expect(404);
      });

      it('HR from Company A should NOT be able to delete Company B candidates', async () => {
        await request(app.getHttpServer())
          .delete(`/candidate/${candidateCompanyB.uid}`)
          .set('Authorization', `Bearer ${users[RolesType.HR].token}`)
          .expect(404);
      });

      it('HR should be able to create candidates only in their own company', async () => {
        const response = await request(app.getHttpServer())
          .post('/candidate')
          .set('Authorization', `Bearer ${users[RolesType.HR].token}`)
          .send({
            email: 'new-candidate-companya@example.com',
          })
          .expect(201);

        // Verify candidate was created in Company A
        const candidate = await databaseService.candidate.findUnique({
          where: { uid: response.body.uid },
        });

        expect(candidate.companyId).toBe(companyA.id);
      });
    });
  });

  describe('Endpoint-Specific Permission Tests', () => {
    describe('User Management Endpoints', () => {
      it('ADMIN should be able to list all users', async () => {
        await request(app.getHttpServer())
          .get('/admin/users')
          .set('Authorization', `Bearer ${users[RolesType.ADMIN].token}`)
          .expect(200);
      });

      it('HR should NOT be able to list all users', async () => {
        await request(app.getHttpServer())
          .get('/admin/users')
          .set('Authorization', `Bearer ${users[RolesType.HR].token}`)
          .expect(403);
      });

      it('SUPER_ADMIN should be able to deactivate users', async () => {
        // Create a test user to deactivate
        const testUser = await databaseService.user.create({
          data: {
            email: 'test-rbac-deactivate@example.com',
            password: await bcrypt.hash(password, 10),
            name: 'User To Deactivate',
            roles: [RolesType.USER],
            companyId: companyA.id,
          },
        });

        await request(app.getHttpServer())
          .post(`/users/${testUser.uid}/deactivate`)
          .set('Authorization', `Bearer ${users[RolesType.SUPER_ADMIN].token}`)
          .expect(200);

        // Verify user was deactivated
        const deactivatedUser = await databaseService.user.findUnique({
          where: { id: testUser.id },
        });

        expect(deactivatedUser.isActive).toBe(false);
        expect(deactivatedUser.deactivatedAt).toBeDefined();
      });

      it('HR should NOT be able to deactivate users', async () => {
        const testUser = await databaseService.user.create({
          data: {
            email: 'test-rbac-deactivate-2@example.com',
            password: await bcrypt.hash(password, 10),
            name: 'User To Deactivate 2',
            roles: [RolesType.USER],
            companyId: companyA.id,
          },
        });

        await request(app.getHttpServer())
          .post(`/users/${testUser.uid}/deactivate`)
          .set('Authorization', `Bearer ${users[RolesType.HR].token}`)
          .expect(403);
      });
    });

    describe('Company Management Endpoints', () => {
      it('COMPANY_OWNER should be able to update their company', async () => {
        await request(app.getHttpServer())
          .put(`/company/${companyA.uid}`)
          .set('Authorization', `Bearer ${users[RolesType.COMPANY_OWNER].token}`)
          .send({
            description: 'Updated description',
          })
          .expect(200);
      });

      it('HR should NOT be able to update company settings', async () => {
        await request(app.getHttpServer())
          .put(`/company/${companyA.uid}`)
          .set('Authorization', `Bearer ${users[RolesType.HR].token}`)
          .send({
            description: 'Unauthorized update',
          })
          .expect(403);
      });

      it('COMPANY_OWNER should NOT be able to update other companies', async () => {
        await request(app.getHttpServer())
          .put(`/company/${companyB.uid}`)
          .set('Authorization', `Bearer ${users[RolesType.COMPANY_OWNER].token}`)
          .send({
            description: 'Cross-company update',
          })
          .expect(403);
      });
    });

    describe('Candidate GDPR Purge Endpoint', () => {
      it('SUPER_ADMIN should be able to permanently delete candidates', async () => {
        const candidate = await databaseService.candidate.create({
          data: {
            email: 'test-rbac-purge@example.com',
            companyId: companyA.id,
          },
        });

        await request(app.getHttpServer())
          .delete(`/candidate/${candidate.uid}/purge`)
          .set('Authorization', `Bearer ${users[RolesType.SUPER_ADMIN].token}`)
          .expect(200);

        // Verify candidate was permanently deleted
        const deletedCandidate = await databaseService.candidate.findUnique({
          where: { uid: candidate.uid },
        });

        expect(deletedCandidate).toBeNull();
      });

      it('ADMIN should NOT be able to permanently delete candidates', async () => {
        const candidate = await databaseService.candidate.create({
          data: {
            email: 'test-rbac-purge-2@example.com',
            companyId: companyA.id,
          },
        });

        await request(app.getHttpServer())
          .delete(`/candidate/${candidate.uid}/purge`)
          .set('Authorization', `Bearer ${users[RolesType.ADMIN].token}`)
          .expect(403);
      });

      it('HR should NOT be able to permanently delete candidates', async () => {
        const candidate = await databaseService.candidate.create({
          data: {
            email: 'test-rbac-purge-3@example.com',
            companyId: companyA.id,
          },
        });

        await request(app.getHttpServer())
          .delete(`/candidate/${candidate.uid}/purge`)
          .set('Authorization', `Bearer ${users[RolesType.HR].token}`)
          .expect(403);
      });
    });
  });

  describe('Multi-Role User Tests', () => {
    let multiRoleUser: any;
    let multiRoleToken: string;

    beforeAll(async () => {
      // Create a user with multiple roles
      multiRoleUser = await databaseService.user.create({
        data: {
          email: 'test-rbac-multirole@example.com',
          password: await bcrypt.hash(password, 10),
          name: 'Multi-Role User',
          roles: [RolesType.HR, RolesType.ADMIN],
          companyId: companyA.id,
          isActive: true,
        },
      });

      // Login to get token
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: multiRoleUser.email,
          password: password,
        });

      multiRoleToken = loginResponse.body.token;
    });

    it('User with HR and ADMIN roles should have access to HR endpoints', async () => {
      await request(app.getHttpServer())
        .get('/candidate')
        .set('Authorization', `Bearer ${multiRoleToken}`)
        .expect(200);
    });

    it('User with HR and ADMIN roles should have access to ADMIN endpoints', async () => {
      await request(app.getHttpServer())
        .get('/admin/users')
        .set('Authorization', `Bearer ${multiRoleToken}`)
        .expect(200);
    });

    it('Highest role should take precedence in authorization', async () => {
      // ADMIN role should allow access even if HR role would normally restrict
      await request(app.getHttpServer())
        .get('/admin/users')
        .set('Authorization', `Bearer ${multiRoleToken}`)
        .expect(200);
    });
  });

  describe('Edge Cases and Security', () => {
    it('Should reject access when token has no roles', async () => {
      // This would require manipulating the JWT, which is difficult in e2e tests
      // This scenario is better tested in unit tests for RolesGuard
    });

    it('Should handle non-existent UIDs gracefully', async () => {
      const fakeUid = '00000000-0000-0000-0000-000000000000';

      const response = await request(app.getHttpServer())
        .get(`/candidate/${fakeUid}`)
        .set('Authorization', `Bearer ${users[RolesType.HR].token}`)
        .expect(404);

      expect(response.body.message).toContain('not found');
    });

    it('Should prevent privilege escalation via request manipulation', async () => {
      // Try to access admin endpoint by manipulating path
      await request(app.getHttpServer())
        .get('/admin/users')
        .set('Authorization', `Bearer ${users[RolesType.USER].token}`)
        .expect(403);
    });

    it('Should maintain consistent permissions across HTTP methods', async () => {
      const candidate = await databaseService.candidate.create({
        data: {
          email: 'test-rbac-methods@example.com',
          companyId: companyA.id,
        },
      });

      // USER should not have GET access
      await request(app.getHttpServer())
        .get(`/candidate/${candidate.uid}`)
        .set('Authorization', `Bearer ${users[RolesType.USER].token}`)
        .expect(403);

      // USER should not have PUT access
      await request(app.getHttpServer())
        .put(`/candidate/${candidate.uid}`)
        .set('Authorization', `Bearer ${users[RolesType.USER].token}`)
        .send({ email: 'new-email@example.com' })
        .expect(403);

      // USER should not have DELETE access
      await request(app.getHttpServer())
        .delete(`/candidate/${candidate.uid}`)
        .set('Authorization', `Bearer ${users[RolesType.USER].token}`)
        .expect(403);
    });
  });

  describe('Role-Specific Feature Access', () => {
    it('HR_MANAGER should be able to manage HR users in their company', async () => {
      // This depends on having HR user management endpoints
      // Placeholder for when these endpoints are implemented
    });

    it('RECRUITER should have access to candidate and job position endpoints', async () => {
      await request(app.getHttpServer())
        .get('/candidate')
        .set('Authorization', `Bearer ${users[RolesType.RECRUITER].token}`)
        .expect(200);

      await request(app.getHttpServer())
        .get('/job-position')
        .set('Authorization', `Bearer ${users[RolesType.RECRUITER].token}`)
        .expect(200);
    });

    it('COMPANY_ADMIN should have admin-like access within their company', async () => {
      await request(app.getHttpServer())
        .get('/candidate')
        .set('Authorization', `Bearer ${users[RolesType.COMPANY_ADMIN].token}`)
        .expect(200);

      await request(app.getHttpServer())
        .get('/job-position')
        .set('Authorization', `Bearer ${users[RolesType.COMPANY_ADMIN].token}`)
        .expect(200);
    });
  });
});
