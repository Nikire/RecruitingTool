import { Injectable, Logger, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { lemonSqueezySetup, createCheckout, getSubscription as lsGetSubscription, cancelSubscription as lsCancelSubscription, listOrders } from '@lemonsqueezy/lemonsqueezy.js';
import { DatabaseService } from '../shared/modules/database/database.service';
import { SubscriptionPlan, SubscriptionStatus, NotificationType, RolesType } from '@prisma/client';
import { SubscriptionResponseDto } from '../stripe/dto/stripe.dto';
import { LsCreateCheckoutDto, LsCheckoutResponseDto, LsCancelResponseDto, LsBillingPortalResponseDto, LsInvoiceDto, LsInvoicesResponseDto } from './dto/lemon-squeezy.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class LemonSqueezyService {
  private readonly logger = new Logger(LemonSqueezyService.name);
  private readonly isEnabled: boolean = false;
  private readonly webhookSecret: string | undefined;

  constructor(
    private readonly configService: ConfigService,
    private readonly databaseService: DatabaseService,
    private readonly notificationsService: NotificationsService,
  ) {
    const apiKey = this.configService.get<string>('LEMONSQUEEZY_API_KEY');
    this.webhookSecret = this.configService.get<string>('LEMONSQUEEZY_WEBHOOK_SECRET');

    if (apiKey) {
      lemonSqueezySetup({ apiKey });
      this.isEnabled = true;
      this.logger.log('Lemon Squeezy service initialized');
    } else {
      this.logger.warn('LEMONSQUEEZY_API_KEY is not configured. Lemon Squeezy features will be disabled.');
    }
  }

  private ensureEnabled(): void {
    if (!this.isEnabled) {
      throw new BadRequestException('Lemon Squeezy is not configured. Please set LEMONSQUEEZY_API_KEY in environment variables.');
    }
  }

  /**
   * Create a Lemon Squeezy checkout URL
   */
  async createCheckout(companyId: number, dto: LsCreateCheckoutDto): Promise<LsCheckoutResponseDto> {
    this.ensureEnabled();

    try {
      const company = await this.databaseService.company.findUnique({
        where: { id: companyId },
        include: {
          users: { take: 1 },
        },
      });

      if (!company) {
        throw new NotFoundException('Company not found');
      }

      if (!company.users || company.users.length === 0) {
        throw new BadRequestException('Company must have at least one user');
      }

      const user = company.users[0];
      const storeId = this.configService.get<string>('LEMONSQUEEZY_STORE_ID');
      const variantId = this.getVariantId(dto.plan);

      if (!storeId) {
        throw new BadRequestException('LEMONSQUEEZY_STORE_ID is not configured');
      }

      const result = await createCheckout(storeId, variantId, {
        checkoutData: {
          email: user.email,
          name: company.name,
          custom: {
            companyId: String(companyId),
            companyUid: company.uid,
          },
        },
        productOptions: {
          redirectUrl: dto.successUrl,
          receiptButtonText: 'Go to Dashboard',
          receiptThankYouNote: 'Thank you for subscribing to Borderless ATS!',
        },
      });

      if (result.error) {
        this.logger.error(`Lemon Squeezy checkout error: ${JSON.stringify(result.error)}`);
        throw new InternalServerErrorException('Failed to create Lemon Squeezy checkout');
      }

      const checkoutUrl = result.data?.data?.attributes?.url;
      if (!checkoutUrl) {
        throw new InternalServerErrorException('No checkout URL returned from Lemon Squeezy');
      }

      this.logger.log(`Created Lemon Squeezy checkout for company ${company.uid}`);
      return { url: checkoutUrl };
    } catch (error) {
      this.logger.error(`Failed to create LS checkout: ${error.message}`, error.stack);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create checkout');
    }
  }

  /**
   * Get subscription details for a company, syncing with LS if available
   */
  async getSubscription(companyId: number): Promise<SubscriptionResponseDto> {
    try {
      const company = await this.databaseService.company.findUnique({
        where: { id: companyId },
        include: { subscription: true },
      });

      if (!company) {
        throw new NotFoundException('Company not found');
      }

      // If no subscription exists, create a FREE trial subscription
      let subscription = company.subscription;
      if (!subscription) {
        subscription = await this.databaseService.subscription.create({
          data: {
            companyId,
            status: SubscriptionStatus.TRIALING,
            plan: SubscriptionPlan.FREE,
            trialEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
          },
        });
      }

      // Sync with Lemon Squeezy if there's a subscription ID
      if (subscription.lsSubscriptionId && this.isEnabled) {
        try {
          const lsSub = await lsGetSubscription(subscription.lsSubscriptionId);
          if (!lsSub.error && lsSub.data?.data?.attributes) {
            const attrs = lsSub.data.data.attributes as Record<string, unknown>;
            await this.databaseService.subscription.update({
              where: { id: subscription.id },
              data: {
                status: this.mapStatus(String(attrs.status ?? ''), Boolean(attrs.cancelled)),
                currentPeriodEnd: attrs.renews_at ? new Date(String(attrs.renews_at)) : null,
                trialEnd: attrs.trial_ends_at ? new Date(String(attrs.trial_ends_at)) : null,
                cancelAtPeriodEnd: Boolean(attrs.cancelled),
                lsCustomerPortalUrl: (attrs.urls as Record<string, string>)?.customer_portal ?? null,
              },
            });
            subscription = await this.databaseService.subscription.findUnique({ where: { id: subscription.id } });
          }
        } catch (syncError) {
          this.logger.warn(`Failed to sync LS subscription: ${syncError.message}`);
        }
      }

      return {
        uid: subscription.uid,
        companyUid: company.uid,
        plan: subscription.plan,
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        trialEnd: subscription.trialEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        gracePeriodEndsAt: subscription.gracePeriodEndsAt,
        subscriptionEndsAt: subscription.subscriptionEndsAt,
      };
    } catch (error) {
      this.logger.error(`Failed to get subscription: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get subscription');
    }
  }

  /**
   * Cancel subscription at period end via Lemon Squeezy
   */
  async cancelSubscription(companyId: number): Promise<LsCancelResponseDto> {
    this.ensureEnabled();

    try {
      const company = await this.databaseService.company.findUnique({
        where: { id: companyId },
        include: { subscription: true },
      });

      if (!company) {
        throw new NotFoundException('Company not found');
      }

      if (!company.subscription) {
        throw new NotFoundException('No active subscription found');
      }

      if (!company.subscription.lsSubscriptionId) {
        throw new BadRequestException('No Lemon Squeezy subscription found for this company');
      }

      const result = await lsCancelSubscription(company.subscription.lsSubscriptionId);
      if (result.error) {
        this.logger.error(`LS cancel subscription error: ${JSON.stringify(result.error)}`);
        throw new InternalServerErrorException('Failed to cancel Lemon Squeezy subscription');
      }

      await this.databaseService.subscription.update({
        where: { id: company.subscription.id },
        data: { cancelAtPeriodEnd: true },
      });

      this.logger.log(`Cancelled LS subscription for company ${company.uid} at period end`);

      return { canceled: true, cancelAtPeriodEnd: true };
    } catch (error) {
      this.logger.error(`Failed to cancel LS subscription: ${error.message}`, error.stack);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to cancel subscription');
    }
  }

  /**
   * Get the Lemon Squeezy customer portal URL
   */
  async getCustomerPortal(companyId: number): Promise<LsBillingPortalResponseDto> {
    try {
      const company = await this.databaseService.company.findUnique({
        where: { id: companyId },
        include: { subscription: true },
      });

      if (!company) {
        throw new NotFoundException('Company not found');
      }

      const subscription = company.subscription;

      // Return cached portal URL if available
      if (subscription?.lsCustomerPortalUrl) {
        return { url: subscription.lsCustomerPortalUrl };
      }

      // Fetch fresh portal URL from LS if we have a subscription ID
      if (subscription?.lsSubscriptionId && this.isEnabled) {
        const lsSub = await lsGetSubscription(subscription.lsSubscriptionId);
        if (!lsSub.error && lsSub.data?.data?.attributes) {
          const attrs = lsSub.data.data.attributes as Record<string, unknown>;
          const portalUrl = (attrs.urls as Record<string, string>)?.customer_portal;
          if (portalUrl) {
            await this.databaseService.subscription.update({
              where: { id: subscription.id },
              data: { lsCustomerPortalUrl: portalUrl },
            });
            return { url: portalUrl };
          }
        }
      }

      throw new BadRequestException('No Lemon Squeezy subscription found. Please subscribe to a plan first.');
    } catch (error) {
      this.logger.error(`Failed to get LS customer portal: ${error.message}`, error.stack);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get customer portal');
    }
  }

  /**
   * Get order history (invoices) for a company
   */
  async getOrders(companyId: number): Promise<LsInvoicesResponseDto> {
    try {
      const company = await this.databaseService.company.findUnique({
        where: { id: companyId },
        include: {
          subscription: true,
          users: { take: 1 },
        },
      });

      if (!company) {
        throw new NotFoundException('Company not found');
      }

      if (!company.users || company.users.length === 0 || !this.isEnabled) {
        return { invoices: [] };
      }

      const userEmail = company.users[0].email;
      const result = await listOrders({ filter: { userEmail } });

      if (result.error) {
        this.logger.warn(`LS listOrders error: ${JSON.stringify(result.error)}`);
        return { invoices: [] };
      }

      const orders = result.data?.data ?? [];
      const invoices: LsInvoiceDto[] = orders.map((order) => {
        const attrs = order.attributes as Record<string, unknown>;
        return {
          id: String(order.id),
          amount: typeof attrs.total === 'number' ? attrs.total / 100 : 0,
          currency: String(attrs.currency ?? 'USD'),
          status: String(attrs.status ?? 'unknown'),
          createdAt: String(attrs.created_at ?? new Date().toISOString()),
          invoiceUrl: (attrs.urls as Record<string, string>)?.receipt,
        };
      });

      this.logger.log(`Retrieved ${invoices.length} LS orders for company ${company.uid}`);
      return { invoices };
    } catch (error) {
      this.logger.error(`Failed to get LS orders: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get invoices');
    }
  }

  /**
   * Verify and process a Lemon Squeezy webhook
   */
  async handleWebhook(rawBody: Buffer, signature: string): Promise<void> {
    if (!this.webhookSecret) {
      throw new BadRequestException('LEMONSQUEEZY_WEBHOOK_SECRET is not configured');
    }

    // Verify HMAC signature
    const hmac = crypto.createHmac('sha256', this.webhookSecret);
    hmac.update(rawBody);
    const digest = hmac.digest('hex');

    if (digest !== signature) {
      this.logger.warn('Invalid Lemon Squeezy webhook signature');
      throw new BadRequestException('Invalid webhook signature');
    }

    const payload = JSON.parse(rawBody.toString()) as Record<string, unknown>;
    const eventName = (payload.meta as Record<string, unknown>)?.event_name as string;

    this.logger.log(`Processing LS webhook event: ${eventName}`);

    try {
      switch (eventName) {
        case 'subscription_created':
          await this.handleSubscriptionCreated(payload);
          break;
        case 'subscription_updated':
          await this.handleSubscriptionUpdated(payload);
          break;
        case 'subscription_cancelled':
          await this.handleSubscriptionCancelled(payload);
          break;
        case 'subscription_expired':
          await this.handleSubscriptionExpired(payload);
          break;
        case 'subscription_payment_failed':
          await this.handlePaymentFailed(payload);
          break;
        case 'subscription_payment_success':
          await this.handlePaymentSuccess(payload);
          break;
        default:
          this.logger.warn(`Unhandled LS webhook event: ${eventName}`);
      }
    } catch (error) {
      this.logger.error(`Failed to process LS webhook event ${eventName}: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async handleSubscriptionCreated(payload: Record<string, unknown>): Promise<void> {
    await this.upsertSubscriptionFromPayload(payload);
  }

  private async handleSubscriptionUpdated(payload: Record<string, unknown>): Promise<void> {
    await this.upsertSubscriptionFromPayload(payload);
  }

  private async handleSubscriptionCancelled(payload: Record<string, unknown>): Promise<void> {
    // subscription_cancelled means cancel_at_period_end was set; treat same as updated
    await this.upsertSubscriptionFromPayload(payload);
  }

  private async handleSubscriptionExpired(payload: Record<string, unknown>): Promise<void> {
    const data = payload.data as Record<string, unknown>;
    const lsSubscriptionId = String(data.id);

    const subscription = await this.databaseService.subscription.findUnique({
      where: { lsSubscriptionId },
    });

    if (!subscription) {
      this.logger.warn(`LS subscription not found in DB for expired event: ${lsSubscriptionId}`);
      return;
    }

    await this.databaseService.subscription.update({
      where: { id: subscription.id },
      data: {
        status: SubscriptionStatus.EXPIRED,
        plan: SubscriptionPlan.FREE,
        subscriptionEndsAt: new Date(),
      },
    });

    this.logger.log(`Marked LS subscription ${lsSubscriptionId} as EXPIRED`);
  }

  private async handlePaymentFailed(payload: Record<string, unknown>): Promise<void> {
    const data = payload.data as Record<string, unknown>;
    const attrs = data.attributes as Record<string, unknown>;
    const lsSubscriptionId = String(data.id);

    const subscription = await this.databaseService.subscription.findUnique({
      where: { lsSubscriptionId },
    });

    if (!subscription) {
      this.logger.warn(`LS subscription not found in DB for payment_failed event: ${lsSubscriptionId}`);
      return;
    }

    const gracePeriodEndsAt = new Date();
    gracePeriodEndsAt.setDate(gracePeriodEndsAt.getDate() + 7);

    await this.databaseService.subscription.update({
      where: { id: subscription.id },
      data: {
        status: SubscriptionStatus.PAST_DUE,
        gracePeriodEndsAt,
      },
    });

    this.logger.log(`LS payment failed for subscription ${lsSubscriptionId}. Grace period until ${gracePeriodEndsAt.toISOString()}`);

    await this.createSubscriptionNotification(
      subscription.companyId,
      NotificationType.SUBSCRIPTION_PAYMENT_FAILED,
      'Payment Failed - Grace Period Active',
      `Payment for your ${subscription.plan} plan failed. You have until ${gracePeriodEndsAt.toLocaleDateString()} to update your payment method to avoid service interruption.`,
      {
        subscriptionUid: subscription.uid,
        planName: subscription.plan,
        gracePeriodEndsAt: gracePeriodEndsAt.toISOString(),
        lsSubscriptionId,
        variantId: attrs.variant_id,
      },
    );
  }

  private async handlePaymentSuccess(payload: Record<string, unknown>): Promise<void> {
    const data = payload.data as Record<string, unknown>;
    const lsSubscriptionId = String(data.id);

    const subscription = await this.databaseService.subscription.findUnique({
      where: { lsSubscriptionId },
    });

    if (!subscription) {
      this.logger.warn(`LS subscription not found in DB for payment_success event: ${lsSubscriptionId}`);
      return;
    }

    await this.databaseService.subscription.update({
      where: { id: subscription.id },
      data: {
        status: SubscriptionStatus.ACTIVE,
        gracePeriodEndsAt: null,
      },
    });

    this.logger.log(`LS payment success for subscription ${lsSubscriptionId}`);

    await this.createSubscriptionNotification(
      subscription.companyId,
      NotificationType.SUBSCRIPTION_PAYMENT_SUCCESS,
      'Payment Successful',
      `Payment processed successfully for your ${subscription.plan} plan.`,
      { subscriptionUid: subscription.uid, planName: subscription.plan, lsSubscriptionId },
    );
  }

  /**
   * Upsert subscription record from a LS webhook payload
   */
  private async upsertSubscriptionFromPayload(payload: Record<string, unknown>): Promise<void> {
    const meta = payload.meta as Record<string, unknown>;
    const data = payload.data as Record<string, unknown>;
    const attrs = data.attributes as Record<string, unknown>;
    const customData = meta.custom_data as Record<string, string> | undefined;

    if (!customData?.companyId) {
      this.logger.warn(`LS webhook missing custom_data.companyId`);
      return;
    }

    const companyId = parseInt(customData.companyId, 10);
    const lsSubscriptionId = String(data.id);
    const relationships = data.relationships as Record<string, unknown>;
    const customerData = (relationships?.customer as Record<string, unknown>)?.data as Record<string, unknown>;
    const lsCustomerId = customerData?.id ? String(customerData.id) : undefined;

    const plan = this.getPlanFromVariantId(attrs.variant_id);
    const status = this.mapStatus(String(attrs.status ?? ''), Boolean(attrs.cancelled));
    const portalUrl = (attrs.urls as Record<string, string>)?.customer_portal ?? null;

    const updateData = {
      lsSubscriptionId,
      ...(lsCustomerId ? { lsCustomerId } : {}),
      plan,
      status,
      lsCustomerPortalUrl: portalUrl,
      currentPeriodStart: new Date(),
      currentPeriodEnd: attrs.renews_at ? new Date(String(attrs.renews_at)) : null,
      trialEnd: attrs.trial_ends_at ? new Date(String(attrs.trial_ends_at)) : null,
      cancelAtPeriodEnd: Boolean(attrs.cancelled),
      subscriptionEndsAt: attrs.ends_at ? new Date(String(attrs.ends_at)) : null,
    };

    await this.databaseService.subscription.upsert({
      where: { companyId },
      create: { companyId, ...updateData },
      update: updateData,
    });

    this.logger.log(`Upserted LS subscription for company ${companyId}: sub=${lsSubscriptionId}, plan=${plan}, status=${status}`);

    // Send notification for new paid subscriptions
    if (plan !== SubscriptionPlan.FREE) {
      const subscription = await this.databaseService.subscription.findUnique({ where: { companyId } });
      if (subscription) {
        await this.createSubscriptionNotification(
          companyId,
          NotificationType.SUBSCRIPTION_PLAN_UPGRADED,
          'Subscription Activated',
          `Your ${plan} plan is now active. Enjoy your new features!`,
          { subscriptionUid: subscription.uid, planName: plan, status },
        );
      }
    }
  }

  /**
   * Map Lemon Squeezy status to our SubscriptionStatus enum
   */
  private mapStatus(lsStatus: string, cancelled: boolean): SubscriptionStatus {
    if (lsStatus === 'active' && cancelled) return SubscriptionStatus.ACTIVE; // cancelAtPeriodEnd handles it
    if (lsStatus === 'active') return SubscriptionStatus.ACTIVE;
    if (lsStatus === 'on_trial') return SubscriptionStatus.TRIALING;
    if (lsStatus === 'cancelled') return SubscriptionStatus.ACTIVE; // still active until period ends
    if (lsStatus === 'expired') return SubscriptionStatus.EXPIRED;
    if (lsStatus === 'past_due') return SubscriptionStatus.PAST_DUE;
    if (lsStatus === 'unpaid') return SubscriptionStatus.UNPAID;
    return SubscriptionStatus.CANCELED;
  }

  /**
   * Map Lemon Squeezy variant ID to our SubscriptionPlan enum
   */
  private getPlanFromVariantId(variantId: unknown): SubscriptionPlan {
    const proVariantId = this.configService.get<string>('LEMONSQUEEZY_PROFESSIONAL_VARIANT_ID');
    const entVariantId = this.configService.get<string>('LEMONSQUEEZY_ENTERPRISE_VARIANT_ID');

    const variantIdStr = String(variantId ?? '');
    if (proVariantId && variantIdStr === String(proVariantId)) return SubscriptionPlan.PROFESSIONAL;
    if (entVariantId && variantIdStr === String(entVariantId)) return SubscriptionPlan.ENTERPRISE;

    this.logger.warn(`Unknown LS variant ID ${variantIdStr}, defaulting to FREE`);
    return SubscriptionPlan.FREE;
  }

  /**
   * Get the configured variant ID for a given plan
   */
  private getVariantId(plan: 'PROFESSIONAL' | 'ENTERPRISE'): string {
    const envVar = plan === 'PROFESSIONAL' ? 'LEMONSQUEEZY_PROFESSIONAL_VARIANT_ID' : 'LEMONSQUEEZY_ENTERPRISE_VARIANT_ID';
    const variantId = this.configService.get<string>(envVar);
    if (!variantId) {
      throw new BadRequestException(`Variant ID for ${plan} plan is not configured (${envVar})`);
    }
    return variantId;
  }

  /**
   * Create a notification for subscription events, targeting Company Owners
   */
  private async createSubscriptionNotification(companyId: number, type: NotificationType, title: string, message: string, metadata?: Record<string, unknown>): Promise<void> {
    try {
      const companyOwners = await this.databaseService.user.findMany({
        where: {
          companyId,
          roles: { has: RolesType.COMPANY_OWNER },
          isActive: true,
        },
        select: { uid: true },
      });

      if (companyOwners.length === 0) {
        this.logger.warn(`No active Company Owners found for company ${companyId}`);
        return;
      }

      await Promise.all(
        companyOwners.map((owner) =>
          this.notificationsService.create({
            userUid: owner.uid,
            type,
            title,
            message,
            metadata: metadata || null,
          }),
        ),
      );

      this.logger.log(`Created ${type} notifications for ${companyOwners.length} company owner(s) in company ${companyId}`);
    } catch (error) {
      // Don't throw - notification failures shouldn't break subscription operations
      this.logger.error(`Failed to create subscription notification: ${error.message}`, error.stack);
    }
  }
}
