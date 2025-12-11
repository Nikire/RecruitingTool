import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesType } from '@prisma/client';
import { Observable } from 'rxjs';

const permissionRoles = {
  1: RolesType.SUPER_ADMIN,
  2: RolesType.ADMIN,
  3: RolesType.HR,
  4: RolesType.USER,
} satisfies Record<number, RolesType>;

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const handler = [context.getHandler(), context.getClass()];

    const { roles } = request.currentUser || {};

    const highestRoleLevel = Math.min(...roles.map((role: RolesType) => this.getRoleLevel(role)));

    const authRoles = this.reflector.getAllAndOverride<RolesType[]>('roles', handler);
    if (!roles) {
      throw new Error('Auth token has no roles component');
    }

    const lowerRequiredRoleLevel = Math.max(...authRoles.map((role: RolesType) => this.getRoleLevel(role)));

    if (highestRoleLevel <= lowerRequiredRoleLevel) {
      return true;
    } else {
      throw new ForbiddenException('Access Denied: Insufficient Permissions');
    }

    /*  if ((authRoles || []).some((role: RolesType) => roles.includes(role))) {
      return true;
    } else {
      throw new ForbiddenException('Access Denied: Insufficient Permissions');
    } */
  }
  private getRoleLevel(role: RolesType): number {
    const entry = Object.entries(permissionRoles).find(([, r]) => r === role);
    return entry ? Number(entry[0]) : Infinity;
  }
}
