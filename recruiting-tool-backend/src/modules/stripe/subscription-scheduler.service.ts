import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DatabaseService } from '../shared/modules/database/database.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SubscriptionStatus, NotificationType, RolesType } from '@prisma/client';

/**
 * Scheduled job service for subscription management
 * Handles grace period expirations and warnings
 */
@Injectable()
export class SubscriptionSchedulerService {
  private readonly logger = new Logger(SubscriptionSchedulerService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Daily job to check and expire grace periods
   * Runs every day at 00:00 (midnight)
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkExpiredGracePeriods(): Promise<void> {
    this.logger.log('Running daily grace period expiration check...');

    try {
      const now = new Date();

      // Find subscriptions with expired grace periods
      const expiredSubscriptions = await this.databaseService.subscription.findMany({
        where: {
          status: SubscriptionStatus.PAST_DUE,
          gracePeriodEndsAt: {
            lte: now, // Grace period ended
          },
        },
        include: {
          company: {
            include: {
              users: {
                where: {
                  roles: { has: RolesType.COMPANY_OWNER },
                  isActive: true,
                },
                select: { uid: true, name: true },
              },
            },
          },
        },
      });

      if (expiredSubscriptions.length === 0) {
        this.logger.log('No expired grace periods found');
        return;
      }

      this.logger.log(`Found ${expiredSubscriptions.length} expired grace periods`);

      // Update subscriptions to EXPIRED
      for (const subscription of expiredSubscriptions) {
        await this.databaseService.subscription.update({
          where: { id: subscription.id },
          data: {
            status: SubscriptionStatus.EXPIRED,
          },
        });

        this.logger.log(`Updated subscription ${subscription.uid} to EXPIRED (company: ${subscription.company.name})`);

        // Notify Company Owners
        const owners = subscription.company.users;
        if (owners.length > 0) {
          for (const owner of owners) {
            await this.notificationsService.create({
              userUid: owner.uid,
              type: NotificationType.SUBSCRIPTION_LIMIT_REACHED,
              title: 'Subscription Expired',
              message: `Your subscription grace period has ended. Access to premium features has been suspended. Please update your payment method to restore service.`,
              metadata: {
                subscriptionUid: subscription.uid,
                planName: subscription.plan,
                gracePeriodEndedAt: subscription.gracePeriodEndsAt?.toISOString(),
              },
            });
          }

          this.logger.log(`Sent expiration notifications to ${owners.length} company owner(s)`);
        }
      }

      this.logger.log('Grace period expiration check completed');
    } catch (error) {
      this.logger.error(`Failed to check expired grace periods: ${error.message}`, error.stack);
    }
  }

  /**
   * Daily job to send grace period warnings
   * Runs every day at 10:00 AM
   * Sends warnings at 3 days and 1 day before expiration
   */
  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async sendGracePeriodWarnings(): Promise<void> {
    this.logger.log('Running grace period warning check...');

    try {
      const now = new Date();

      // Calculate warning dates
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      threeDaysFromNow.setHours(23, 59, 59, 999); // End of day

      const oneDayFromNow = new Date();
      oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);
      oneDayFromNow.setHours(23, 59, 59, 999); // End of day

      // Find subscriptions needing warnings (3 days)
      const threeDayWarningSubscriptions = await this.databaseService.subscription.findMany({
        where: {
          status: SubscriptionStatus.PAST_DUE,
          gracePeriodEndsAt: {
            gte: now,
            lte: threeDaysFromNow,
          },
        },
        include: {
          company: {
            include: {
              users: {
                where: {
                  roles: { has: RolesType.COMPANY_OWNER },
                  isActive: true,
                },
                select: { uid: true, name: true },
              },
            },
          },
        },
      });

      // Find subscriptions needing warnings (1 day)
      const oneDayWarningSubscriptions = await this.databaseService.subscription.findMany({
        where: {
          status: SubscriptionStatus.PAST_DUE,
          gracePeriodEndsAt: {
            gte: now,
            lte: oneDayFromNow,
          },
        },
        include: {
          company: {
            include: {
              users: {
                where: {
                  roles: { has: RolesType.COMPANY_OWNER },
                  isActive: true,
                },
                select: { uid: true, name: true },
              },
            },
          },
        },
      });

      // Send 3-day warnings
      for (const subscription of threeDayWarningSubscriptions) {
        const owners = subscription.company.users;
        if (owners.length > 0) {
          const daysRemaining = Math.ceil((subscription.gracePeriodEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          for (const owner of owners) {
            await this.notificationsService.create({
              userUid: owner.uid,
              type: NotificationType.SUBSCRIPTION_LIMIT_WARNING,
              title: `Subscription Grace Period Ending Soon`,
              message: `Your payment failed and your grace period expires in ${daysRemaining} days. Please update your payment method to avoid service interruption.`,
              metadata: {
                subscriptionUid: subscription.uid,
                planName: subscription.plan,
                gracePeriodEndsAt: subscription.gracePeriodEndsAt?.toISOString(),
                daysRemaining,
              },
            });
          }
        }
      }

      // Send 1-day warnings
      for (const subscription of oneDayWarningSubscriptions) {
        const owners = subscription.company.users;
        if (owners.length > 0) {
          for (const owner of owners) {
            await this.notificationsService.create({
              userUid: owner.uid,
              type: NotificationType.SUBSCRIPTION_LIMIT_WARNING,
              title: `Urgent: Subscription Grace Period Ending Tomorrow`,
              message: `Your payment failed and your grace period expires tomorrow. Please update your payment method immediately to avoid losing access to premium features.`,
              metadata: {
                subscriptionUid: subscription.uid,
                planName: subscription.plan,
                gracePeriodEndsAt: subscription.gracePeriodEndsAt?.toISOString(),
                daysRemaining: 1,
              },
            });
          }
        }
      }

      this.logger.log(`Sent ${threeDayWarningSubscriptions.length} 3-day warnings and ${oneDayWarningSubscriptions.length} 1-day warnings`);
    } catch (error) {
      this.logger.error(`Failed to send grace period warnings: ${error.message}`, error.stack);
    }
  }
}
