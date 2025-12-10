# Security Testing Suite - Permission Tests

This directory contains comprehensive automated tests for authentication and role-based access control (RBAC) to prevent security regressions.

## Test Files

### 1. `auth.e2e-spec.ts` - Authentication E2E Tests

End-to-end tests for authentication workflows including:

**Registration Tests:**
- User registration with valid credentials
- Duplicate email rejection
- Auto-company creation for COMPANY_OWNER role
- Email format validation
- Password strength validation

**Login Tests:**
- Valid credential authentication
- Invalid email rejection
- Invalid password rejection
- Deactivated user rejection
- Last login timestamp updates

**JWT Token Management:**
- Valid token acceptance
- Missing token rejection
- Invalid token rejection
- Malformed authorization header handling
- Token refresh with valid refresh token
- Invalid/expired/revoked refresh token rejection
- Token rotation on refresh
- Logout and token revocation

**Token Security:**
- No sensitive data in JWT payload
- Token rejection after user deactivation
- Concurrent login handling

**Edge Cases:**
- Concurrent login requests
- Missing required fields
- Whitespace handling in email

### 2. `permissions.e2e-spec.ts` - RBAC E2E Tests

End-to-end tests for role-based access control:

**Role Hierarchy Tests:**
- SUPER_ADMIN access to all routes
- ADMIN access to HR routes
- ADMIN blocked from SUPER_ADMIN routes
- HR access to HR routes
- HR blocked from ADMIN routes
- USER blocked from HR routes
- COMPANY_OWNER access within company

**Company-Scoped Data Isolation:**
- Candidate access control (company A vs B)
- Job position access control (company A vs B)
- List endpoints filter by company
- SUPER_ADMIN cross-company access
- Modification access control (update/delete)
- Creation limited to user's company

**Endpoint-Specific Permissions:**
- User management (list, deactivate)
- Company management (update settings)
- GDPR purge (SUPER_ADMIN only)

**Multi-Role Users:**
- Users with multiple roles
- Highest role precedence
- Access to endpoints from all roles

**Edge Cases:**
- Non-existent UIDs
- Privilege escalation prevention
- Consistent permissions across HTTP methods

**Role-Specific Features:**
- HR_MANAGER capabilities
- RECRUITER access
- COMPANY_ADMIN permissions

### 3. `rbac.service.spec.ts` - RBAC Unit Tests

Unit tests for the RBAC guard logic:

**Role Hierarchy:**
- SUPER_ADMIN access to all endpoints
- ADMIN access to HR/USER endpoints
- ADMIN blocked from SUPER_ADMIN endpoints
- HR access to USER endpoints
- HR blocked from ADMIN endpoints
- USER blocked from HR endpoints

**Multiple Roles:**
- Highest role used for authorization
- Access granted if any role sufficient
- Access denied if no roles sufficient

**Multiple Required Roles:**
- Access if user has any required role or higher
- Check against lowest required role level

**Edge Cases:**
- User with no roles
- User with empty roles array
- Unknown roles handling

**Special Roles:**
- COMPANY_OWNER treated as HR level
- HR_MANAGER treated as HR level
- RECRUITER treated as HR level
- COMPANY_ADMIN treated as HR level

**Role Level Calculations:**
- SUPER_ADMIN = level 1
- ADMIN = level 2
- HR/HR_MANAGER/RECRUITER/COMPANY_OWNER/COMPANY_ADMIN = level 3
- USER = level 4
- Unknown roles = Infinity

**Access Control Scenarios:**
- Comprehensive matrix of role combinations
- Same level access
- Higher role accessing lower endpoints
- Lower role blocked from higher endpoints

**Security Validations:**
- Null/undefined user handling
- Consistent role hierarchy enforcement

## Running Tests

### Run All Permission Tests
```bash
# All security tests
yarn test auth.e2e-spec.ts permissions.e2e-spec.ts rbac.service.spec.ts

# Authentication tests only
yarn test auth.e2e-spec.ts

# RBAC e2e tests only
yarn test permissions.e2e-spec.ts

# RBAC unit tests only
yarn test rbac.service.spec.ts
```

### Run with Coverage
```bash
yarn test:cov auth.e2e-spec.ts permissions.e2e-spec.ts rbac.service.spec.ts
```

### Watch Mode
```bash
yarn test:watch rbac.service.spec.ts
```

## Test Data Setup

The tests automatically:
1. Create test companies (Company A and Company B)
2. Create users for each role in both companies
3. Login users to obtain JWT tokens
4. Clean up test data after tests complete

## Role Hierarchy Reference

```
SUPER_ADMIN (Level 1)
  └─> Has access to everything
      |
      └─> ADMIN (Level 2)
          └─> Has access to ADMIN, HR, USER routes
              |
              └─> HR / HR_MANAGER / RECRUITER / COMPANY_OWNER / COMPANY_ADMIN (Level 3)
                  └─> Has access to HR, USER routes
                      |
                      └─> USER (Level 4)
                          └─> Has access to USER routes only
```

## Company Data Isolation

All tests verify that:
- Users can only access data from their own company
- Cross-company data access is blocked (except for SUPER_ADMIN)
- List endpoints filter results by company
- Create/Update/Delete operations are company-scoped

## Test Coverage

These tests cover:
- ✅ Authentication (login, registration, token management)
- ✅ JWT token security (validation, expiration, revocation)
- ✅ Role-based access control (all roles)
- ✅ Company data isolation (multi-tenant security)
- ✅ Endpoint-specific permissions
- ✅ Multi-role users
- ✅ Edge cases and security validations
- ✅ GDPR compliance (purge endpoint)
- ✅ Token refresh and rotation
- ✅ User deactivation security

## CI/CD Integration

These tests should be run:
- Before every commit
- In PR validation pipelines
- Before deploying to production
- After any authentication/authorization changes

## Security Regression Prevention

These tests prevent:
- Unauthorized access to protected endpoints
- Cross-company data leaks
- Privilege escalation attacks
- Token-based security vulnerabilities
- Role hierarchy violations
- RBAC bypass attempts

## Maintenance

When adding new:
- **Roles**: Update role hierarchy tests and scenarios
- **Endpoints**: Add permission tests for new endpoints
- **Features**: Add feature-specific permission tests
- **Security measures**: Add corresponding security tests

## Related Documentation

- `../src/modules/shared/modules/auth/README.md` - Authentication system docs
- `../src/modules/shared/modules/auth/guards/README.md` - Guard implementation docs
- `.claude/docs/PERMISSIONS_AUDIT.md` - Complete permissions audit

## Test Patterns Used

- **Jest + Supertest** for E2E tests
- **Mock ExecutionContext** for unit tests
- **Test fixtures** for consistent test data
- **Cleanup hooks** to prevent test data pollution
- **Descriptive test names** for clear failure messages
