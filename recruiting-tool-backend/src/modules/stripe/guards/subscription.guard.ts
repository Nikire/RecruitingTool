import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DatabaseService } from '../../shared/modules/database/database.service';
import { SubscriptionStatus } from '@prisma/client';

/**
 * Guard to check if company subscription is valid
 * Blocks access if subscription is EXPIRED
 * Allows access during grace period (PAST_DUE) with warning
 */
@Injectable()
export class SubscriptionGuard implements CanActivate {
  private readonly logger = new Logger(SubscriptionGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly databaseService: DatabaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.companyId) {
      // No company association - allow (will be handled by auth guards)
      return true;
    }

    try {
      // Get company subscription
      const subscription = await this.databaseService.subscription.findUnique({
        where: { companyId: user.companyId },
      });

      // No subscription record - allow (FREE plan)
      if (!subscription) {
        return true;
      }

      // Check if subscription is EXPIRED
      if (subscription.status === SubscriptionStatus.EXPIRED) {
        this.logger.warn(
          `Access blocked for company ${user.companyId}: Subscription expired`,
        );
        throw new ForbiddenException(
          'Your subscription has expired. Please renew your subscription to access this feature.',
        );
      }

      // Check if grace period has expired (PAST_DUE with expired grace period)
      if (
        subscription.status === SubscriptionStatus.PAST_DUE &&
        subscription.gracePeriodEndsAt &&
        new Date() > subscription.gracePeriodEndsAt
      ) {
        // Grace period expired - update status to EXPIRED
        await this.databaseService.subscription.update({
          where: { id: subscription.id },
          data: { status: SubscriptionStatus.EXPIRED },
        });

        this.logger.warn(
          `Access blocked for company ${user.companyId}: Grace period expired`,
        );
        throw new ForbiddenException(
          'Your subscription grace period has expired. Please update your payment method to restore access.',
        );
      }

      // Allow access for: TRIALING, ACTIVE, CANCELED (until period end), PAST_DUE (within grace period)
      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }

      // Log error but don't block access (fail open)
      this.logger.error(
        `Error checking subscription for company ${user.companyId}: ${error.message}`,
        error.stack,
      );
      return true;
    }
  }
}
