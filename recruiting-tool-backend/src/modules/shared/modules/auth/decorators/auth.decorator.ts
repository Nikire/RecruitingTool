import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { RolesType } from '@prisma/client';
import { RolesGuard } from '../guards/roles.guard';

export function Auth(roles?: RolesType[]) {
  return applyDecorators(
    SetMetadata('roles', roles || [RolesType.USER]),
    UseGuards(AuthGuard),
    UseGuards(RolesGuard),
  );
}
