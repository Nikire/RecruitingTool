import { CanActivate, ExecutionContext, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesType } from '@prisma/client';
import { IS_PUBLIC_KEY } from '../decorators/skip-auth.decorator';
import { Observable } from 'rxjs';

/**
 * CANONICAL ROLE LADDER — the single source of truth for backend authorization.
 *
 * Lower number = MORE privilege. `RECRUITER` sits between `HR` and `USER`.
 *
 * The frontend route guards (`App.tsx` -> `<RoleGuard allowedRoles={...}>`) must
 * be derived from the RECRUITER matrix documented in `ROLE_MATRIX_NOTES` below;
 * any UI surface offered to a role that the ladder rejects produces a 403.
 */
export const ROLE_LEVELS = {
  [RolesType.SUPER_ADMIN]: 1,
  [RolesType.ADMIN]: 2,
  [RolesType.COMPANY_ADMIN]: 3,
  [RolesType.COMPANY_OWNER]: 4,
  [RolesType.HR_MANAGER]: 5,
  [RolesType.HR]: 6,
  [RolesType.RECRUITER]: 7,
  [RolesType.USER]: 8,
} satisfies Record<RolesType, number>;

/**
 * ROLE_MATRIX_NOTES — how to read an `@Auth([...])` list.
 *
 * Semantics are "AT LEAST the least-privileged role in the list":
 *   threshold = MAX(level of each listed role)
 *   allow     = MIN(level of each of the caller's roles) <= threshold
 *
 * So `@Auth(['HR', 'ADMIN', 'SUPER_ADMIN'])` means "HR **and everything above
 * HR**" — the ADMIN/SUPER_ADMIN entries are documentation, not the gate. The
 * gate is the *lowest* role you name.
 *
 * ── Why we did NOT switch to `authRoles.some(r => userRoles.includes(r))` ──
 * A literal `some()` membership check was sitting commented out in this file.
 * Switching to it would silently re-interpret all ~209 `@Auth` sites:
 *   - `@Auth(['ADMIN'])`          would lock out SUPER_ADMIN (5 sites).
 *   - `@Auth(['COMPANY_OWNER'])`  would lock out ADMIN/SUPER_ADMIN (3 sites).
 *   - `@Auth([RolesType.USER])`   would lock out every staff account that does
 *     not literally carry the USER role (16 sites, incl. shared read routes).
 * That is a whole-application lockout risk for zero functional gain, so the
 * ladder stays. To grant a *lower* role access to an endpoint, ADD that role to
 * the endpoint's `@Auth` list — because the threshold is the MAX level in the
 * list, adding e.g. RECRUITER to `['HR', 'ADMIN', 'SUPER_ADMIN']` widens access
 * by exactly one rung (RECRUITER) and nothing else.
 *
 * ── RECRUITER (level 7) capability matrix, as enforced today ──
 * READ  ✅ job positions      (`@Auth([... 'USER'])` — already below RECRUITER)
 * READ  ✅ hiring processes   (`@Auth([... 'USER'])` — already below RECRUITER)
 * READ  ✅ candidates         (list / detail / notes / journey / activities /
 *                              stage-eval-notes — RECRUITER added explicitly)
 * READ  ✅ applications       (list / grouped / detail — RECRUITER added
 *                              explicitly)
 * WRITE ❌ everything. Create/update/delete on candidates, applications, job
 *          positions, hiring processes and stages remain HR (level 6) and above.
 * ❌ analytics, exports, AI, email templates, calendar, interviews, scorecards,
 *    team/role management, admin panel — all remain HR+ or higher.
 */

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const handler = [context.getHandler(), context.getClass()];

    const { roles, uid } = request?.currentUser || {};

    // Validate BEFORE mapping — an unauthenticated/roleless request must produce
    // a clean 403, never a TypeError surfaced as a 500.
    if (!Array.isArray(roles) || roles.length === 0) {
      this.deny(uid, roles, undefined);
    }

    const authRoles = this.reflector.getAllAndOverride<RolesType[]>('roles', handler);
    if (!Array.isArray(authRoles) || authRoles.length === 0) {
      // A guarded handler with no declared roles is a configuration bug.
      // Fail closed rather than admitting everyone.
      this.deny(uid, roles, authRoles);
    }

    // Caller's strongest role (lowest level number).
    const highestRoleLevel = Math.min(...roles.map((role: RolesType) => this.getRoleLevel(role)));

    // Endpoint threshold: the LEAST privileged role the endpoint names.
    const lowerRequiredRoleLevel = Math.max(...authRoles.map((role: RolesType) => this.getRoleLevel(role)));

    if (highestRoleLevel <= lowerRequiredRoleLevel) {
      return true;
    }

    this.deny(uid, roles, authRoles);
  }

  private deny(uid: string | undefined, roles: RolesType[] | undefined, authRoles: RolesType[] | undefined): never {
    // Authorization failures are logged (uid only, no PII) so that a role that
    // is offered in the UI but rejected by the API is visible in the logs.
    this.logger.warn(`Access denied for user ${uid ?? '<anonymous>'} — roles=[${(roles ?? []).join(', ')}] required=[${(authRoles ?? []).join(', ')}]`);
    throw new ForbiddenException('Access Denied: Insufficient Permissions');
  }

  private getRoleLevel(role: RolesType): number {
    const level = (ROLE_LEVELS as Record<string, number>)[role];
    return level ?? Infinity;
  }
}
