import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesType } from '@prisma/client';
import { Observable } from 'rxjs';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const handler = [context.getHandler(), context.getClass()];

    const { roles } = request.user || {};
    const authRoles = this.reflector.getAllAndOverride<RolesType[]>(
      'roles',
      handler,
    );
    if (!roles) {
      throw new Error('Auth token has no roles component');
    }

    if ((authRoles || []).some((role: RolesType) => roles.includes(role))) {
      return true;
    } else {
      throw new ForbiddenException('Access Denied: Insufficient Permissions');
    }
  }
}
