import { Injectable, Logger, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import DodoPayments from 'dodopayments';
import type { Subscription as DodoSubscription } from 'dodopayments/resources/subscriptions';
import { DatabaseService } from '../shared/modules/database/database.service';
import { SubscriptionPlan, SubscriptionStatus, NotificationType, RolesType } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import {
  DoCreateCheckoutDto,
  DoCheckoutResponseDto,
  DoCancelResponseDto,
  DoBillingPortalResponseDto,
  DoInvoiceDto,
  DoInvoicesResponseDto,
  DoSubscriptionResponseDto,
  DoAdminSubscriptionsResponseDto,
  DoListSubscriptionsQueryDto,
  DoSubscriptionsListResponseDto,
  DoSubscriptionWithCompanyDto,
} from './dto/dodo-payments.dto';

@Injectable()
export class DodoPaymentsService {
  private readonly logger = new Logger(DodoPaymentsService.name);
  private readonly client: DodoPayments | null = null;
  private readonly isEnabled: boolean = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly databaseService: DatabaseService,
    private readonly notificationsService: NotificationsService,
  ) {
    const apiKey = this.configService.get<string>('DODO_PAYMENTS_API_KEY');
    const webhookKey = this.configService.get<string>('DODO_PAYMENTS_WEBHOOK_KEY');
    const environment = (this.configService.get<string>('DODO_PAYMENTS_ENVIRONMENT') ?? 'test_mode') as 'test_mode' | 'live_mode';

    if (apiKey) {
      this.client = new DodoPayments({
        bearerToken: apiKey,
        webhookKey: webhookKey ?? null,
        environment,
      });
      this.isEnabled = true;
      this.logger.log(`Dodo Payments service initialized (environment: ${environment})`);
    } else {
      this.logger.warn('DODO_PAYMENTS_API_KEY is not configured. Dodo Payments features will be disabled.');
    }
  }

  private ensureEnabled(): void {
    if (!this.isEnabled || !this.client) {
      throw new BadRequestException('Dodo Payments is not configured. Please set DODO_PAYMENTS_API_KEY in environment variables.');
    }
  }

  /**
   * Length of the self-serve Professional trial, in days.
   *
   * The landing page advertises a 14-day Professional trial, so the trial has to
   * be applied here rather than left to per-product configuration in the Dodo
   * dashboard — otherwise the claim on the pricing card is only true if someone
   * remembers to tick a box. `subscription_data.trial_period_days` overrides
   * whatever the product's price carries, so this is authoritative.
   *
   * Override with DODO_PAYMENTS_PRO_TRIAL_DAYS; set it to 0 to sell without a trial.
   */
  private get proTrialDays(): number {
    const raw = this.configService.get<string>('DODO_PAYMENTS_PRO_TRIAL_DAYS');
    if (raw === undefined || raw === null || raw === '') {
      return 14;
    }
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 14;
  }

  /**
   * Create a Dodo Payments checkout session URL
   */
  async createCheckout(companyId: number, dto: DoCreateCheckoutDto): Promise<DoCheckoutResponseDto> {
    this.ensureEnabled();

    try {
      const company = await this.databaseService.company.findUnique({
        where: { id: companyId },
        include: {
          users: { take: 1 },
          subscription: true,
        },
      });

      if (!company) {
        throw new NotFoundException('Company not found');
      }

      if (!company.users || company.users.length === 0) {
        throw new BadRequestException('Company must have at least one user');
      }

      const user = company.users[0];
      const productId = this.getProductId(dto.plan, dto.interval ?? 'monthly');

      const storedCustomerId = company.subscription?.doCustomerId;
      const newCustomerPayload = { email: user.email, name: company.name };

      // Trial is offered on Professional only, and only to a company that has
      // never held a Dodo subscription. Without the second condition a company
      // could cancel and re-check-out for a fresh free fortnight every month.
      const isFirstSubscription = !company.subscription?.doSubscriptionId;
      const trialDays = dto.plan === 'PROFESSIONAL' && isFirstSubscription ? this.proTrialDays : 0;

      const checkoutParams = {
        product_cart: [{ product_id: productId, quantity: 1 }],
        return_url: dto.successUrl,
        cancel_url: dto.cancelUrl,
        metadata: { companyId: String(companyId), companyUid: company.uid },
        ...(trialDays > 0 ? { subscription_data: { trial_period_days: trialDays } } : {}),
        customization: {
          theme_config: {
            light: {
              button_primary: '#325CE7',
              button_primary_hover: '#2748C0',
              button_text_primary: '#ffffff',
              input_focus_border: '#325CE7',
            },
            dark: {
              button_primary: '#325CE7',
              button_primary_hover: '#2748C0',
              button_text_primary: '#ffffff',
              input_focus_border: '#B6C5F6',
            },
          },
        },
      };

      let session: Awaited<ReturnType<typeof this.client.checkoutSessions.create>>;
      try {
        session = await this.client!.checkoutSessions.create({
          ...checkoutParams,
          customer: storedCustomerId ? { customer_id: storedCustomerId } : newCustomerPayload,
        });
      } catch (customerError) {
        // Stale customer ID (e.g. test→live mode switch) — clear it and retry with email
        if (storedCustomerId && (customerError as { status?: number })?.status === 404) {
          this.logger.warn(`Dodo customer ${storedCustomerId} not found, clearing stale ID and retrying with email`);
          await this.databaseService.subscription.update({ where: { companyId }, data: { doCustomerId: null } });
          session = await this.client!.checkoutSessions.create({ ...checkoutParams, customer: newCustomerPayload });
        } else {
          throw customerError;
        }
      }

      const checkoutUrl = session.checkout_url;
      if (!checkoutUrl) {
        throw new InternalServerErrorException('No checkout URL returned from Dodo Payments');
      }

      this.logger.log(`Created Dodo Payments checkout session for company ${company.uid} ` + `(plan=${dto.plan}, interval=${dto.interval ?? 'monthly'}, trialDays=${trialDays})`);
      return { url: checkoutUrl };
    } catch (error) {
      this.logger.error(`Failed to create Dodo checkout: ${error.message}`, error.stack);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create checkout');
    }
  }

  /**
   * Get subscription details for a company, syncing with Dodo if available
   */
  async getSubscription(companyId: number): Promise<DoSubscriptionResponseDto> {
    try {
      const company = await this.databaseService.company.findUnique({
        where: { id: companyId },
        include: { subscription: true },
      });

      if (!company) {
        throw new NotFoundException('Company not found');
      }

      // If no subscription row exists yet, materialise the implicit FREE plan.
      //
      // This used to be written as TRIALING with trialEnd 30 days out, which
      // described a trial that did not exist: nothing ever expired it, and FREE
      // is not a paid plan, so the countdown shown to the user led nowhere.
      // FREE is now a permanent tier, so the row is ACTIVE with no trial end.
      // The real trial is the 14 days applied at Professional checkout.
      let subscription = company.subscription;
      if (!subscription) {
        subscription = await this.databaseService.subscription.create({
          data: {
            companyId,
            status: SubscriptionStatus.ACTIVE,
            plan: SubscriptionPlan.FREE,
            trialEnd: null,
          },
        });
      }

      // Sync with Dodo Payments if there's a Dodo subscription ID
      if (subscription.doSubscriptionId && this.isEnabled && this.client) {
        try {
          const doSub = await this.client.subscriptions.retrieve(subscription.doSubscriptionId);
          await this.databaseService.subscription.update({
            where: { id: subscription.id },
            data: {
              status: this.mapStatus(doSub.status, doSub.cancel_at_next_billing_date),
              currentPeriodStart: doSub.previous_billing_date ? new Date(doSub.previous_billing_date) : null,
              currentPeriodEnd: doSub.next_billing_date ? new Date(doSub.next_billing_date) : null,
              cancelAtPeriodEnd: doSub.cancel_at_next_billing_date,
              subscriptionEndsAt: doSub.expires_at ? new Date(doSub.expires_at) : null,
              doCustomerId: doSub.customer.customer_id,
            },
          });
          subscription = await this.databaseService.subscription.findUnique({ where: { id: subscription.id } });
        } catch (syncError) {
          this.logger.warn(`Failed to sync Dodo subscription: ${syncError.message}`);
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
   * Cancel subscription at period end via Dodo Payments
   */
  async cancelSubscription(companyId: number): Promise<DoCancelResponseDto> {
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

      if (!company.subscription.doSubscriptionId) {
        throw new BadRequestException('No Dodo Payments subscription found for this company');
      }

      await this.client!.subscriptions.update(company.subscription.doSubscriptionId, {
        cancel_at_next_billing_date: true,
        cancel_reason: 'cancelled_by_customer',
      });

      await this.databaseService.subscription.update({
        where: { id: company.subscription.id },
        data: { cancelAtPeriodEnd: true },
      });

      this.logger.log(`Scheduled Dodo Payments subscription cancellation for company ${company.uid} at next billing date`);

      return { canceled: true, cancelAtPeriodEnd: true };
    } catch (error) {
      this.logger.error(`Failed to cancel Dodo subscription: ${error.message}`, error.stack);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to cancel subscription');
    }
  }

  /**
   * Get the Dodo Payments customer portal URL
   */
  async getCustomerPortal(companyId: number): Promise<DoBillingPortalResponseDto> {
    this.ensureEnabled();

    try {
      const company = await this.databaseService.company.findUnique({
        where: { id: companyId },
        include: { subscription: true },
      });

      if (!company) {
        throw new NotFoundException('Company not found');
      }

      const doCustomerId = company.subscription?.doCustomerId;
      if (!doCustomerId) {
        throw new BadRequestException('No Dodo Payments customer found. Please subscribe to a plan first.');
      }

      const portal = await this.client!.customers.customerPortal.create(doCustomerId);
      return { url: portal.link };
    } catch (error) {
      this.logger.error(`Failed to get Dodo customer portal: ${error.message}`, error.stack);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get customer portal');
    }
  }

  /**
   * Get payment history (invoices) for a company
   */
  async getInvoices(companyId: number): Promise<DoInvoicesResponseDto> {
    try {
      const company = await this.databaseService.company.findUnique({
        where: { id: companyId },
        include: { subscription: true },
      });

      if (!company) {
        throw new NotFoundException('Company not found');
      }

      if (!company.subscription?.doSubscriptionId || !this.isEnabled || !this.client) {
        return { invoices: [] };
      }

      const paymentsPage = await this.client.payments.list({
        subscription_id: company.subscription.doSubscriptionId,
      });

      const invoices: DoInvoiceDto[] = (paymentsPage.items ?? []).map((payment) => ({
        id: payment.payment_id,
        amount: typeof payment.total_amount === 'number' ? payment.total_amount / 100 : 0,
        currency: payment.currency ?? 'USD',
        status: payment.status ?? 'unknown',
        createdAt: payment.created_at ?? new Date().toISOString(),
        invoiceUrl: payment.invoice_url ?? undefined,
      }));

      this.logger.log(`Retrieved ${invoices.length} Dodo payments for company ${company.uid}`);
      return { invoices };
    } catch (error) {
      this.logger.error(`Failed to get Dodo invoices: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      // Don't fail hard on invoice fetch errors
      return { invoices: [] };
    }
  }

  /**
   * Verify and process a Dodo Payments webhook
   */
  async handleWebhook(rawBody: Buffer, headers: Record<string, string>): Promise<void> {
    if (!this.client) {
      throw new BadRequestException('Dodo Payments is not configured');
    }

    let event: ReturnType<typeof this.client.webhooks.unwrap>;
    try {
      event = this.client.webhooks.unwrap(rawBody.toString('utf8'), { headers });
    } catch (err) {
      this.logger.warn(`Invalid Dodo Payments webhook signature: ${err.message}`);
      throw new BadRequestException('Invalid webhook signature');
    }

    const eventType = event.type;
    this.logger.log(`Processing Dodo Payments webhook event: ${eventType}`);

    try {
      switch (eventType) {
        case 'subscription.active':
          await this.handleSubscriptionActive(event.data as DodoSubscription);
          break;
        case 'subscription.updated':
          await this.handleSubscriptionUpdated(event.data as DodoSubscription);
          break;
        case 'subscription.renewed':
          await this.handleSubscriptionRenewed(event.data as DodoSubscription);
          break;
        case 'subscription.on_hold':
          await this.handleSubscriptionOnHold(event.data as DodoSubscription);
          break;
        case 'subscription.cancelled':
          await this.handleSubscriptionCancelled(event.data as DodoSubscription);
          break;
        case 'subscription.expired':
          await this.handleSubscriptionExpired(event.data as DodoSubscription);
          break;
        case 'subscription.failed':
          await this.handleSubscriptionFailed(event.data as DodoSubscription);
          break;
        default:
          this.logger.log(`Unhandled Dodo Payments webhook event: ${eventType}`);
      }
    } catch (error) {
      this.logger.error(`Failed to process Dodo webhook event ${eventType}: ${error.message}`, error.stack);
      throw error;
    }
  }

  // ─── Webhook Handlers ───────────────────────────────────────────────────────

  private async handleSubscriptionActive(data: DodoSubscription): Promise<void> {
    await this.upsertSubscriptionFromData(data);

    const companyId = this.extractCompanyId(data.metadata);
    if (companyId) {
      const subscription = await this.databaseService.subscription.findUnique({ where: { companyId } });
      if (subscription && subscription.plan !== SubscriptionPlan.FREE) {
        await this.createSubscriptionNotification(
          companyId,
          NotificationType.SUBSCRIPTION_PLAN_UPGRADED,
          'Subscription Activated',
          `Your ${subscription.plan} plan is now active. Enjoy your new features!`,
          { subscriptionUid: subscription.uid, planName: subscription.plan, doSubscriptionId: data.subscription_id },
        );
      }
    }
  }

  private async handleSubscriptionUpdated(data: DodoSubscription): Promise<void> {
    await this.upsertSubscriptionFromData(data);
  }

  private async handleSubscriptionRenewed(data: DodoSubscription): Promise<void> {
    await this.upsertSubscriptionFromData(data);

    // Also clear any grace period
    const companyId = this.extractCompanyId(data.metadata);
    if (companyId) {
      await this.databaseService.subscription.updateMany({
        where: { companyId },
        data: { gracePeriodEndsAt: null },
      });
    }
  }

  private async handleSubscriptionOnHold(data: DodoSubscription): Promise<void> {
    const companyId = this.extractCompanyId(data.metadata);
    if (!companyId) {
      this.logger.warn(`Dodo webhook on_hold missing companyId in metadata for subscription ${data.subscription_id}`);
      return;
    }

    const gracePeriodEndsAt = new Date();
    gracePeriodEndsAt.setDate(gracePeriodEndsAt.getDate() + 7);

    await this.databaseService.subscription.upsert({
      where: { companyId },
      create: {
        companyId,
        doSubscriptionId: data.subscription_id,
        doCustomerId: data.customer.customer_id,
        status: SubscriptionStatus.PAST_DUE,
        plan: this.getPlanFromProductId(data.product_id),
        gracePeriodEndsAt,
      },
      update: {
        doSubscriptionId: data.subscription_id,
        doCustomerId: data.customer.customer_id,
        status: SubscriptionStatus.PAST_DUE,
        gracePeriodEndsAt,
      },
    });

    const subscription = await this.databaseService.subscription.findUnique({ where: { companyId } });
    if (subscription) {
      await this.createSubscriptionNotification(
        companyId,
        NotificationType.SUBSCRIPTION_PAYMENT_FAILED,
        'Payment Issue - Grace Period Active',
        `Your ${subscription.plan} plan has a payment issue. You have until ${gracePeriodEndsAt.toLocaleDateString()} to update your payment method.`,
        { subscriptionUid: subscription.uid, planName: subscription.plan, gracePeriodEndsAt: gracePeriodEndsAt.toISOString() },
      );
    }
  }

  private async handleSubscriptionCancelled(data: DodoSubscription): Promise<void> {
    // Subscription was cancelled — keep active until period ends, set cancelAtPeriodEnd
    const companyId = this.extractCompanyId(data.metadata);
    if (!companyId) {
      this.logger.warn(`Dodo webhook cancelled missing companyId for subscription ${data.subscription_id}`);
      return;
    }

    await this.databaseService.subscription.upsert({
      where: { companyId },
      create: {
        companyId,
        doSubscriptionId: data.subscription_id,
        doCustomerId: data.customer.customer_id,
        status: SubscriptionStatus.ACTIVE,
        plan: this.getPlanFromProductId(data.product_id),
        cancelAtPeriodEnd: true,
        currentPeriodEnd: data.next_billing_date ? new Date(data.next_billing_date) : null,
        subscriptionEndsAt: data.expires_at ? new Date(data.expires_at) : null,
      },
      update: {
        doSubscriptionId: data.subscription_id,
        doCustomerId: data.customer.customer_id,
        status: SubscriptionStatus.ACTIVE,
        cancelAtPeriodEnd: true,
        currentPeriodEnd: data.next_billing_date ? new Date(data.next_billing_date) : null,
        subscriptionEndsAt: data.expires_at ? new Date(data.expires_at) : null,
      },
    });

    this.logger.log(`Dodo subscription ${data.subscription_id} marked as cancelled at period end for company ${companyId}`);
  }

  private async handleSubscriptionExpired(data: DodoSubscription): Promise<void> {
    const companyId = this.extractCompanyId(data.metadata);
    if (!companyId) {
      // Try to find by doSubscriptionId
      const sub = await this.databaseService.subscription.findFirst({ where: { doSubscriptionId: data.subscription_id } });
      if (!sub) {
        this.logger.warn(`Dodo webhook expired: subscription ${data.subscription_id} not found in DB`);
        return;
      }
      await this.databaseService.subscription.update({
        where: { id: sub.id },
        data: { status: SubscriptionStatus.EXPIRED, plan: SubscriptionPlan.FREE, subscriptionEndsAt: new Date() },
      });
      return;
    }

    await this.databaseService.subscription.upsert({
      where: { companyId },
      create: {
        companyId,
        doSubscriptionId: data.subscription_id,
        doCustomerId: data.customer.customer_id,
        status: SubscriptionStatus.EXPIRED,
        plan: SubscriptionPlan.FREE,
        subscriptionEndsAt: new Date(),
      },
      update: {
        doSubscriptionId: data.subscription_id,
        doCustomerId: data.customer.customer_id,
        status: SubscriptionStatus.EXPIRED,
        plan: SubscriptionPlan.FREE,
        subscriptionEndsAt: new Date(),
      },
    });

    this.logger.log(`Dodo subscription ${data.subscription_id} expired for company ${companyId}`);
  }

  private async handleSubscriptionFailed(data: DodoSubscription): Promise<void> {
    // Treat similarly to on_hold
    await this.handleSubscriptionOnHold(data);
  }

  /**
   * Upsert the subscription record from a Dodo Payments subscription data object
   */
  private async upsertSubscriptionFromData(data: DodoSubscription): Promise<void> {
    const companyId = this.extractCompanyId(data.metadata);
    if (!companyId) {
      this.logger.warn(`Dodo webhook missing companyId in metadata for subscription ${data.subscription_id}`);
      return;
    }

    const plan = this.getPlanFromProductId(data.product_id);
    const status = this.mapStatus(data.status, data.cancel_at_next_billing_date);

    const updateData = {
      doSubscriptionId: data.subscription_id,
      doCustomerId: data.customer.customer_id,
      plan,
      status,
      currentPeriodStart: data.previous_billing_date ? new Date(data.previous_billing_date) : null,
      currentPeriodEnd: data.next_billing_date ? new Date(data.next_billing_date) : null,
      trialEnd: this.resolveTrialEnd(data),
      cancelAtPeriodEnd: data.cancel_at_next_billing_date,
      subscriptionEndsAt: data.expires_at ? new Date(data.expires_at) : null,
    };

    await this.databaseService.subscription.upsert({
      where: { companyId },
      create: { companyId, ...updateData },
      update: updateData,
    });

    this.logger.log(`Upserted Dodo subscription for company ${companyId}: sub=${data.subscription_id}, plan=${plan}, status=${status}`);
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  /**
   * Map Dodo Payments subscription status to our SubscriptionStatus enum
   */
  private mapStatus(doStatus: string, cancelAtNextBilling: boolean): SubscriptionStatus {
    if (doStatus === 'active' && cancelAtNextBilling) return SubscriptionStatus.ACTIVE; // cancelAtPeriodEnd handles display
    if (doStatus === 'active') return SubscriptionStatus.ACTIVE;
    if (doStatus === 'pending') return SubscriptionStatus.TRIALING;
    if (doStatus === 'on_hold') return SubscriptionStatus.PAST_DUE;
    if (doStatus === 'cancelled') return SubscriptionStatus.ACTIVE; // still active until period ends
    if (doStatus === 'failed') return SubscriptionStatus.PAST_DUE;
    if (doStatus === 'expired') return SubscriptionStatus.EXPIRED;
    return SubscriptionStatus.CANCELED;
  }

  /**
   * Work out when a trial ends from the Dodo subscription payload.
   *
   * Dodo reports the trial as a length in days on the subscription plus the
   * creation timestamp; it has no `trial_end` field and no `trialing` status
   * (a subscription inside its trial is reported as `active`). Storing the
   * computed end date is what lets the app tell a trialing company how long it
   * has left.
   */
  private resolveTrialEnd(data: DodoSubscription): Date | null {
    const days = data.trial_period_days;
    if (!days || days <= 0 || !data.created_at) {
      return null;
    }

    const createdAt = new Date(data.created_at);
    if (Number.isNaN(createdAt.getTime())) {
      return null;
    }

    return new Date(createdAt.getTime() + days * 24 * 60 * 60 * 1000);
  }

  /**
   * Map Dodo Payments product ID to our SubscriptionPlan enum
   */
  private getPlanFromProductId(productId: string): SubscriptionPlan {
    const proMonthly = this.configService.get<string>('DODO_PAYMENTS_PROFESSIONAL_PRODUCT_ID');
    const proAnnual = this.configService.get<string>('DODO_PAYMENTS_PROFESSIONAL_ANNUAL_PRODUCT_ID');
    const entMonthly = this.configService.get<string>('DODO_PAYMENTS_ENTERPRISE_PRODUCT_ID');
    const entAnnual = this.configService.get<string>('DODO_PAYMENTS_ENTERPRISE_ANNUAL_PRODUCT_ID');

    if (productId === proMonthly || productId === proAnnual) return SubscriptionPlan.PROFESSIONAL;
    if (productId === entMonthly || productId === entAnnual) return SubscriptionPlan.ENTERPRISE;

    this.logger.warn(`Unknown Dodo product ID ${productId}, defaulting to FREE`);
    return SubscriptionPlan.FREE;
  }

  /**
   * Get the configured Dodo product ID for a given plan and interval
   */
  private getProductId(plan: 'PROFESSIONAL' | 'ENTERPRISE', interval: 'monthly' | 'annual'): string {
    const envVarMap: Record<string, string> = {
      PROFESSIONAL_monthly: 'DODO_PAYMENTS_PROFESSIONAL_PRODUCT_ID',
      PROFESSIONAL_annual: 'DODO_PAYMENTS_PROFESSIONAL_ANNUAL_PRODUCT_ID',
      ENTERPRISE_monthly: 'DODO_PAYMENTS_ENTERPRISE_PRODUCT_ID',
      ENTERPRISE_annual: 'DODO_PAYMENTS_ENTERPRISE_ANNUAL_PRODUCT_ID',
    };

    const envVar = envVarMap[`${plan}_${interval}`];
    const productId = this.configService.get<string>(envVar);

    if (!productId) {
      throw new BadRequestException(`Product ID for ${plan} ${interval} plan is not configured (${envVar})`);
    }

    return productId;
  }

  /**
   * Extract numeric companyId from Dodo metadata
   */
  private extractCompanyId(metadata: Record<string, string> | null | undefined): number | null {
    if (!metadata?.companyId) return null;
    const id = parseInt(metadata.companyId, 10);
    return isNaN(id) ? null : id;
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
      // Don't throw — notification failures shouldn't break subscription operations
      this.logger.error(`Failed to create subscription notification: ${error.message}`, error.stack);
    }
  }

  // ─── Admin reporting ────────────────────────────────────────────────────────

  /**
   * Monthly list price per plan, in cents.
   *
   * Deliberately the same numbers the admin revenue dashboard uses
   * (`AdminService.getRevenueStats`, PROFESSIONAL $49 / ENTERPRISE $149) so the
   * two admin screens cannot disagree about MRR. The Stripe implementation this
   * replaces used $29.99/$99.99, which never matched the dashboard.
   *
   * These are list prices, not amounts actually charged: Dodo does not expose a
   * per-subscription amount on our stored record, and custom-plan pricing is
   * negotiated outside the provider. Treat the figures as an estimate.
   */
  private static readonly PLAN_MONTHLY_PRICE_CENTS: Record<SubscriptionPlan, number> = {
    [SubscriptionPlan.FREE]: 0,
    [SubscriptionPlan.PROFESSIONAL]: 4900,
    [SubscriptionPlan.ENTERPRISE]: 14900,
  };

  private monthlyPriceCents(plan: SubscriptionPlan): number {
    return DodoPaymentsService.PLAN_MONTHLY_PRICE_CENTS[plan] ?? 0;
  }

  /**
   * Yearly list price in cents. Annual plans are sold at 10x the monthly price
   * (two months free), matching the annual product configuration in Dodo.
   */
  private yearlyPriceCents(plan: SubscriptionPlan): number {
    return this.monthlyPriceCents(plan) * 10;
  }

  /**
   * Every subscription in the system, with company and owner details, for the
   * admin subscriptions screen. Reads only from our own database — no calls out
   * to Dodo — so it stays fast and keeps working when the provider is down or
   * unconfigured.
   */
  async getAllSubscriptionsAdmin(): Promise<DoAdminSubscriptionsResponseDto> {
    try {
      const subscriptions = await this.databaseService.subscription.findMany({
        include: {
          company: {
            select: {
              uid: true,
              name: true,
              users: {
                where: { roles: { has: RolesType.COMPANY_OWNER }, isActive: true },
                take: 1,
                select: { uid: true, name: true, email: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const items = subscriptions.map((sub) => {
        const owner = sub.company.users[0];
        return {
          subscriptionUid: sub.uid,
          companyUid: sub.company.uid,
          companyName: sub.company.name,
          ownerUid: owner?.uid,
          ownerName: owner?.name,
          ownerEmail: owner?.email,
          plan: sub.plan,
          status: sub.status,
          hasProviderSubscription: Boolean(sub.doSubscriptionId),
          currentPeriodStart: sub.currentPeriodStart ?? undefined,
          currentPeriodEnd: sub.currentPeriodEnd ?? undefined,
          trialEnd: sub.trialEnd ?? undefined,
          cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
          mrr: sub.status === SubscriptionStatus.ACTIVE ? this.monthlyPriceCents(sub.plan) : 0,
          createdAt: sub.createdAt,
          updatedAt: sub.updatedAt,
        };
      });

      return {
        subscriptions: items,
        total: items.length,
        totalActive: items.filter((i) => i.status === SubscriptionStatus.ACTIVE).length,
        totalTrialing: items.filter((i) => i.status === SubscriptionStatus.TRIALING).length,
        totalPastDue: items.filter((i) => i.status === SubscriptionStatus.PAST_DUE).length,
        totalMrr: items.reduce((sum, i) => sum + i.mrr, 0),
      };
    } catch (error) {
      this.logger.error(`Failed to fetch all subscriptions: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch subscriptions');
    }
  }

  /**
   * Paginated + filterable subscriptions list for admin.
   *
   * `stats` are computed across the whole table, not the current page, so the
   * summary cards do not change as the admin pages through the grid.
   */
  async listAllSubscriptions(query: DoListSubscriptionsQueryDto): Promise<DoSubscriptionsListResponseDto> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? Math.min(query.limit, 100) : 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (query.status) {
      where.status = query.status;
    }
    if (query.plan) {
      where.plan = query.plan;
    }
    if (query.search?.trim()) {
      where.company = { name: { contains: query.search.trim(), mode: 'insensitive' } };
    }

    try {
      const [subscriptions, total, allForStats] = await Promise.all([
        this.databaseService.subscription.findMany({
          where,
          skip,
          take: limit,
          include: {
            company: {
              select: { uid: true, name: true, _count: { select: { users: true } } },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.databaseService.subscription.count({ where }),
        this.databaseService.subscription.findMany({ select: { status: true, plan: true } }),
      ]);

      const items: DoSubscriptionWithCompanyDto[] = subscriptions.map((sub) => ({
        uid: sub.uid,
        companyUid: sub.company.uid,
        companyName: sub.company.name,
        userCount: sub.company._count.users,
        plan: sub.plan,
        status: sub.status,
        currentPeriodStart: sub.currentPeriodStart ?? undefined,
        currentPeriodEnd: sub.currentPeriodEnd ?? undefined,
        trialEnd: sub.trialEnd ?? undefined,
        cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
        gracePeriodEndsAt: sub.gracePeriodEndsAt ?? undefined,
        subscriptionEndsAt: sub.subscriptionEndsAt ?? undefined,
        monthlyRevenue: this.monthlyPriceCents(sub.plan),
        yearlyRevenue: this.yearlyPriceCents(sub.plan),
      }));

      const active = allForStats.filter((s) => s.status === SubscriptionStatus.ACTIVE);

      return {
        subscriptions: items,
        total,
        page,
        limit,
        stats: {
          totalActive: active.length,
          totalTrialing: allForStats.filter((s) => s.status === SubscriptionStatus.TRIALING).length,
          totalCanceled: allForStats.filter((s) => s.status === SubscriptionStatus.CANCELED).length,
          totalPastDue: allForStats.filter((s) => s.status === SubscriptionStatus.PAST_DUE).length,
          totalMonthlyRevenue: active.reduce((sum, s) => sum + this.monthlyPriceCents(s.plan), 0),
          totalYearlyRevenue: active.reduce((sum, s) => sum + this.yearlyPriceCents(s.plan), 0),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to list subscriptions: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to list subscriptions');
    }
  }
}
