import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { QuotaService } from '../quota.service';
import { QuotaResource } from '../config/plan-limits.config';
import { isSuperAdminRole } from 'src/utils/company-access.helper';

export const QUOTA_KEY = 'quota';

@Injectable()
export class QuotaGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private quotaService: QuotaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const quotaResource = this.reflector.get<QuotaResource>(QUOTA_KEY, context.getHandler());

    if (!quotaResource) {
      return true; // No quota check required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // If user is not yet resolved (auth guard hasn't run), skip — auth guard handles it
    if (!user) {
      return true;
    }

    // SUPER_ADMIN bypasses quota guards (unlimited access)
    if (isSuperAdminRole(user)) {
      return true;
    }

    if (!user.companyId) {
      throw new HttpException('User must be associated with a company', HttpStatus.PAYMENT_REQUIRED);
    }

    try {
      await this.quotaService.checkQuota(user.companyId, quotaResource);
      return true;
    } catch (error) {
      if (error instanceof HttpException && error.getStatus() === HttpStatus.PAYMENT_REQUIRED) {
        throw error;
      }
      // Re-throw other errors
      throw error;
    }
  }
}
