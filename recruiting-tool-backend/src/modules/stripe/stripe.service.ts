import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { DatabaseService } from '../shared/modules/database/database.service';
import { SubscriptionPlan, SubscriptionStatus, NotificationType, RolesType } from '@prisma/client';
import {
  CreateCheckoutSessionDto,
  SubscriptionResponseDto,
  CheckoutSessionResponseDto,
  CancelSubscriptionResponseDto,
  CreateBillingPortalDto,
  BillingPortalResponseDto,
  InvoicesResponseDto,
  InvoiceResponseDto,
} from './dto/stripe.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private readonly stripe: Stripe | null = null;
  private readonly isEnabled: boolean = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly databaseService: DatabaseService,
    private readonly notificationsService: NotificationsService,
  ) {
    const apiKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!apiKey) {
      this.logger.warn('STRIPE_SECRET_KEY is not configured. Stripe features will be disabled.');
      return;
    }

    this.stripe = new Stripe(apiKey, {
      apiVersion: '2025-11-17.clover',
    });
    this.isEnabled = true;

    this.logger.log('Stripe service initialized');
  }

  /**
   * Check if Stripe is enabled and throw if not
   */
  private ensureEnabled(): void {
    if (!this.isEnabled || !this.stripe) {
      throw new BadRequestException(
        'Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.',
      );
    }
  }

  /**
   * Create a Stripe customer for a company
   */
  async createCustomer(companyId: number, email: string, name: string): Promise<string> {
    this.ensureEnabled();
    try {
      const company = await this.databaseService.company.findUnique({
        where: { id: companyId },
        include: { subscription: true },
      });

      if (!company) {
        throw new NotFoundException('Company not found');
      }

      // Check if customer already exists
      if (company.subscription?.stripeCustomerId) {
        return company.subscription.stripeCustomerId;
      }

      // Create new Stripe customer
      const customer = await this.stripe!.customers.create({
        email,
        name,
        metadata: {
          companyId: companyId.toString(),
          companyUid: company.uid,
        },
      });

      this.logger.log(`Created Stripe customer ${customer.id} for company ${company.uid}`);

      // Update or create subscription record with customer ID
      if (company.subscription) {
        await this.databaseService.subscription.update({
          where: { id: company.subscription.id },
          data: { stripeCustomerId: customer.id },
        });
      } else {
        await this.databaseService.subscription.create({
          data: {
            companyId,
            stripeCustomerId: customer.id,
            status: SubscriptionStatus.TRIALING,
            plan: SubscriptionPlan.FREE,
          },
        });
      }

      return customer.id;
    } catch (error) {
      this.logger.error(`Failed to create Stripe customer: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create Stripe customer');
    }
  }

  /**
   * Create a Stripe Checkout session for subscription
   */
  async createCheckoutSession(
    companyId: number,
    dto: CreateCheckoutSessionDto,
  ): Promise<CheckoutSessionResponseDto> {
    this.ensureEnabled();
    try {
      const company = await this.databaseService.company.findUnique({
        where: { id: companyId },
        include: {
          subscription: true,
          users: { take: 1 }, // Get one user for email/name
        },
      });

      if (!company) {
        throw new NotFoundException('Company not found');
      }

      if (!company.users || company.users.length === 0) {
        throw new BadRequestException('Company must have at least one user');
      }

      const user = company.users[0];

      // Get or create Stripe customer
      let customerId = company.subscription?.stripeCustomerId;
      if (!customerId) {
        customerId = await this.createCustomer(companyId, user.email, company.name);
      }

      // Get billing interval (default to monthly if not specified)
      const interval = dto.interval || 'monthly';

      // Get price ID based on plan and interval
      const priceId = this.getPriceId(dto.plan, interval);

      // Create Checkout session
      const session = await this.stripe!.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: dto.successUrl,
        cancel_url: dto.cancelUrl,
        metadata: {
          companyId: companyId.toString(),
          companyUid: company.uid,
          plan: dto.plan,
          interval,
        },
        subscription_data: {
          metadata: {
            companyId: companyId.toString(),
            companyUid: company.uid,
            interval,
          },
        },
      });

      this.logger.log(`Created checkout session ${session.id} for company ${company.uid}`);

      return {
        sessionId: session.id,
        url: session.url,
      };
    } catch (error) {
      this.logger.error(`Failed to create checkout session: ${error.message}`, error.stack);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create checkout session');
    }
  }

  /**
   * Get subscription details for a company
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
            trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
          },
        });
      }

      // Sync with Stripe if there's a subscription ID
      if (subscription.stripeSubscriptionId) {
        await this.syncSubscriptionWithStripe(subscription.id, subscription.stripeSubscriptionId);
        // Reload after sync
        subscription = await this.databaseService.subscription.findUnique({
          where: { id: subscription.id },
        });
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
   * Cancel subscription at period end
   */
  async cancelSubscription(companyId: number): Promise<CancelSubscriptionResponseDto> {
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

      if (!company.subscription.stripeSubscriptionId) {
        throw new BadRequestException('Cannot cancel a free subscription');
      }

      // Cancel subscription in Stripe (at period end)
      const stripeSubscription = await this.stripe!.subscriptions.update(
        company.subscription.stripeSubscriptionId,
        {
          cancel_at_period_end: true,
        },
      );

      // Update local subscription record
      await this.databaseService.subscription.update({
        where: { id: company.subscription.id },
        data: {
          cancelAtPeriodEnd: true,
        },
      });

      this.logger.log(`Canceled subscription for company ${company.uid} at period end`);

      // Get current period end from the first subscription item
      const currentPeriodEnd = stripeSubscription.items?.data?.[0]?.current_period_end;
      const cancelDate = currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : new Date();

      // Create notification for subscription cancellation
      await this.createSubscriptionNotification(
        companyId,
        NotificationType.SUBSCRIPTION_CANCELLED,
        'Subscription Cancellation Scheduled',
        `Your ${company.subscription.plan} subscription will be cancelled on ${cancelDate.toLocaleDateString()}. You'll be downgraded to the FREE plan after that date.`,
        {
          subscriptionUid: company.subscription.uid,
          planName: company.subscription.plan,
          cancelDate: cancelDate.toISOString(),
        },
      );

      return {
        message: 'Subscription will be canceled at the end of the current billing period',
        cancelAt: cancelDate,
      };
    } catch (error) {
      this.logger.error(`Failed to cancel subscription: ${error.message}`, error.stack);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to cancel subscription');
    }
  }

  /**
   * Create a Stripe Customer Portal session
   */
  async createBillingPortalSession(
    companyId: number,
    dto: CreateBillingPortalDto,
  ): Promise<BillingPortalResponseDto> {
    this.ensureEnabled();
    try {
      const company = await this.databaseService.company.findUnique({
        where: { id: companyId },
        include: { subscription: true },
      });

      if (!company) {
        throw new NotFoundException('Company not found');
      }

      if (!company.subscription?.stripeCustomerId) {
        throw new BadRequestException(
          'No Stripe customer found. Please subscribe to a plan first.',
        );
      }

      // Create billing portal session
      const session = await this.stripe!.billingPortal.sessions.create({
        customer: company.subscription.stripeCustomerId,
        return_url: dto.returnUrl,
      });

      this.logger.log(`Created billing portal session for company ${company.uid}`);

      return {
        url: session.url,
      };
    } catch (error) {
      this.logger.error(`Failed to create billing portal session: ${error.message}`, error.stack);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create billing portal session');
    }
  }

  /**
   * Sync subscription data from Stripe
   */
  private async syncSubscriptionWithStripe(
    subscriptionId: number,
    stripeSubscriptionId: string,
  ): Promise<void> {
    try {
      const stripeSubscription =
        await this.stripe!.subscriptions.retrieve(stripeSubscriptionId);

      // Get current period from the first subscription item
      const currentPeriodStart = stripeSubscription.items?.data?.[0]?.current_period_start;
      const currentPeriodEnd = stripeSubscription.items?.data?.[0]?.current_period_end;

      await this.databaseService.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: this.mapStripeStatus(stripeSubscription.status),
          currentPeriodStart: currentPeriodStart
            ? new Date(currentPeriodStart * 1000)
            : null,
          currentPeriodEnd: currentPeriodEnd
            ? new Date(currentPeriodEnd * 1000)
            : null,
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        },
      });

      this.logger.log(`Synced subscription ${subscriptionId} with Stripe`);
    } catch (error) {
      this.logger.error(
        `Failed to sync subscription with Stripe: ${error.message}`,
        error.stack,
      );
      // Don't throw - this is a background sync operation
    }
  }

  /**
   * Map Stripe subscription status to our enum
   */
  private mapStripeStatus(stripeStatus: string): SubscriptionStatus {
    switch (stripeStatus) {
      case 'active':
        return SubscriptionStatus.ACTIVE;
      case 'trialing':
        return SubscriptionStatus.TRIALING;
      case 'past_due':
        return SubscriptionStatus.PAST_DUE;
      case 'canceled':
      case 'unpaid':
        return SubscriptionStatus.CANCELED;
      default:
        return SubscriptionStatus.TRIALING;
    }
  }

  /**
   * Get Stripe Price ID based on plan and interval
   */
  private getPriceId(plan: 'PROFESSIONAL' | 'ENTERPRISE', interval: 'monthly' | 'annual' = 'monthly'): string {
    let envVar: string;

    if (interval === 'annual') {
      envVar = plan === 'PROFESSIONAL'
        ? 'STRIPE_PROFESSIONAL_ANNUAL_PRICE_ID'
        : 'STRIPE_ENTERPRISE_ANNUAL_PRICE_ID';
    } else {
      envVar = plan === 'PROFESSIONAL'
        ? 'STRIPE_PROFESSIONAL_PRICE_ID'
        : 'STRIPE_ENTERPRISE_PRICE_ID';
    }

    const priceId = this.configService.get<string>(envVar);

    if (!priceId) {
      throw new BadRequestException(`Price ID for ${plan} ${interval} plan is not configured`);
    }

    return priceId;
  }

  /**
   * Get invoices for a company
   */
  async getInvoices(companyId: number): Promise<InvoicesResponseDto> {
    this.ensureEnabled();
    try {
      const company = await this.databaseService.company.findUnique({
        where: { id: companyId },
        include: { subscription: true },
      });

      if (!company) {
        throw new NotFoundException('Company not found');
      }

      // Return empty list if no Stripe customer
      if (!company.subscription?.stripeCustomerId) {
        return {
          invoices: [],
          total: 0,
        };
      }

      // Fetch invoices from Stripe
      const stripeInvoices = await this.stripe!.invoices.list({
        customer: company.subscription.stripeCustomerId,
        limit: 100, // Fetch up to 100 invoices
      });

      // Map Stripe invoices to our DTO
      const invoices: InvoiceResponseDto[] = stripeInvoices.data.map((invoice) => ({
        id: invoice.id,
        invoiceNumber: invoice.number || invoice.id,
        amountDue: invoice.amount_due,
        amountPaid: invoice.amount_paid,
        currency: invoice.currency,
        status: invoice.status || 'draft',
        createdAt: new Date(invoice.created * 1000),
        dueDate: invoice.due_date ? new Date(invoice.due_date * 1000) : undefined,
        pdfUrl: invoice.invoice_pdf || '',
        hostedInvoiceUrl: invoice.hosted_invoice_url || '',
      }));

      this.logger.log(`Retrieved ${invoices.length} invoices for company ${company.uid}`);

      return {
        invoices,
        total: stripeInvoices.data.length,
      };
    } catch (error) {
      this.logger.error(`Failed to get invoices: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get invoices');
    }
  }

  /**
   * Construct and verify Stripe webhook event
   */
  constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
    this.ensureEnabled();

    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new BadRequestException('STRIPE_WEBHOOK_SECRET is not configured');
    }

    try {
      return this.stripe!.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error) {
      this.logger.error(`Webhook signature verification failed: ${error.message}`);
      throw new BadRequestException(`Webhook signature verification failed: ${error.message}`);
    }
  }

  /**
   * Handle incoming Stripe webhook events
   */
  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    this.logger.log(`Processing webhook event: ${event.type} (${event.id})`);

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
          break;

        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;

        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        default:
          this.logger.warn(`Unhandled webhook event type: ${event.type}`);
      }
    } catch (error) {
      this.logger.error(`Failed to process webhook event ${event.type}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Handle checkout.session.completed event
   */
  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const companyId = session.metadata?.companyId;
    if (!companyId) {
      this.logger.warn(`No companyId in checkout session metadata: ${session.id}`);
      return;
    }

    this.logger.log(`Checkout session completed for company ${companyId}`);

    // Subscription will be updated via customer.subscription.created event
    // Nothing specific to do here except log
  }

  /**
   * Handle customer.subscription.created event
   */
  private async handleSubscriptionCreated(stripeSubscription: Stripe.Subscription): Promise<void> {
    const companyId = stripeSubscription.metadata?.companyId;
    if (!companyId) {
      this.logger.warn(`No companyId in subscription metadata: ${stripeSubscription.id}`);
      return;
    }

    const company = await this.databaseService.company.findUnique({
      where: { id: parseInt(companyId) },
      include: { subscription: true },
    });

    if (!company) {
      this.logger.error(`Company not found: ${companyId}`);
      return;
    }

    // Determine plan from price ID
    const plan = this.determinePlanFromPriceId(stripeSubscription.items.data[0]?.price.id);

    // Get current period from the first subscription item
    const currentPeriodStart = stripeSubscription.items?.data?.[0]?.current_period_start;
    const currentPeriodEnd = stripeSubscription.items?.data?.[0]?.current_period_end;

    // Update existing subscription or create new one
    if (company.subscription) {
      await this.databaseService.subscription.update({
        where: { id: company.subscription.id },
        data: {
          stripeSubscriptionId: stripeSubscription.id,
          status: this.mapStripeStatus(stripeSubscription.status),
          plan,
          currentPeriodStart: currentPeriodStart
            ? new Date(currentPeriodStart * 1000)
            : null,
          currentPeriodEnd: currentPeriodEnd
            ? new Date(currentPeriodEnd * 1000)
            : null,
          trialEnd: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : null,
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        },
      });
    } else {
      await this.databaseService.subscription.create({
        data: {
          companyId: parseInt(companyId),
          stripeCustomerId: stripeSubscription.customer as string,
          stripeSubscriptionId: stripeSubscription.id,
          status: this.mapStripeStatus(stripeSubscription.status),
          plan,
          currentPeriodStart: currentPeriodStart
            ? new Date(currentPeriodStart * 1000)
            : null,
          currentPeriodEnd: currentPeriodEnd
            ? new Date(currentPeriodEnd * 1000)
            : null,
          trialEnd: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : null,
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        },
      });
    }

    this.logger.log(`Subscription created for company ${companyId}: ${stripeSubscription.id}`);

    // Create notification for plan upgrade (new paid subscription)
    if (plan !== SubscriptionPlan.FREE) {
      await this.createSubscriptionNotification(
        parseInt(companyId),
        NotificationType.SUBSCRIPTION_PLAN_UPGRADED,
        'Subscription Plan Activated',
        `You've been upgraded to the ${plan} plan! Enjoy your new features and benefits.`,
        {
          subscriptionUid: company.subscription?.uid || null,
          planName: plan,
          status: this.mapStripeStatus(stripeSubscription.status),
        },
      );
    }
  }

  /**
   * Handle customer.subscription.updated event
   */
  private async handleSubscriptionUpdated(stripeSubscription: Stripe.Subscription): Promise<void> {
    const subscription = await this.databaseService.subscription.findUnique({
      where: { stripeSubscriptionId: stripeSubscription.id },
      include: { company: true },
    });

    if (!subscription) {
      this.logger.warn(`Subscription not found in database: ${stripeSubscription.id}`);
      return;
    }

    // Determine new plan from price ID
    const newPlan = this.determinePlanFromPriceId(stripeSubscription.items.data[0]?.price.id);
    const oldPlan = subscription.plan;

    // Get current period from the first subscription item
    const currentPeriodStart = stripeSubscription.items?.data?.[0]?.current_period_start;
    const currentPeriodEnd = stripeSubscription.items?.data?.[0]?.current_period_end;

    await this.databaseService.subscription.update({
      where: { id: subscription.id },
      data: {
        status: this.mapStripeStatus(stripeSubscription.status),
        plan: newPlan,
        currentPeriodStart: currentPeriodStart
          ? new Date(currentPeriodStart * 1000)
          : null,
        currentPeriodEnd: currentPeriodEnd
          ? new Date(currentPeriodEnd * 1000)
          : null,
        trialEnd: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : null,
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      },
    });

    this.logger.log(`Subscription updated: ${stripeSubscription.id}`);

    // Create notification if plan changed
    if (oldPlan !== newPlan) {
      const isPlanUpgrade = this.isPlanUpgrade(oldPlan, newPlan);

      await this.createSubscriptionNotification(
        subscription.companyId,
        isPlanUpgrade
          ? NotificationType.SUBSCRIPTION_PLAN_UPGRADED
          : NotificationType.SUBSCRIPTION_PLAN_DOWNGRADED,
        isPlanUpgrade ? 'Plan Upgraded' : 'Plan Downgraded',
        isPlanUpgrade
          ? `Your plan has been upgraded from ${oldPlan} to ${newPlan}. Enjoy your new features!`
          : `Your plan has been changed from ${oldPlan} to ${newPlan}.`,
        {
          subscriptionUid: subscription.uid,
          oldPlan,
          newPlan,
        },
      );
    }

    // Create notification for subscription renewal
    if (stripeSubscription.status === 'active' && !stripeSubscription.cancel_at_period_end) {
      await this.createSubscriptionNotification(
        subscription.companyId,
        NotificationType.SUBSCRIPTION_RENEWED,
        'Subscription Renewed',
        `Your ${newPlan} subscription has been renewed successfully until ${new Date(currentPeriodEnd * 1000).toLocaleDateString()}.`,
        {
          subscriptionUid: subscription.uid,
          planName: newPlan,
          renewedUntil: new Date(currentPeriodEnd * 1000).toISOString(),
        },
      );
    }
  }

  /**
   * Handle customer.subscription.deleted event
   */
  private async handleSubscriptionDeleted(stripeSubscription: Stripe.Subscription): Promise<void> {
    const subscription = await this.databaseService.subscription.findUnique({
      where: { stripeSubscriptionId: stripeSubscription.id },
    });

    if (!subscription) {
      this.logger.warn(`Subscription not found in database: ${stripeSubscription.id}`);
      return;
    }

    const oldPlan = subscription.plan;

    // Mark as canceled and downgrade to FREE plan
    await this.databaseService.subscription.update({
      where: { id: subscription.id },
      data: {
        status: SubscriptionStatus.CANCELED,
        plan: SubscriptionPlan.FREE,
        cancelAtPeriodEnd: false,
      },
    });

    this.logger.log(`Subscription deleted (downgraded to FREE): ${stripeSubscription.id}`);

    // Create notification for subscription cancellation
    await this.createSubscriptionNotification(
      subscription.companyId,
      NotificationType.SUBSCRIPTION_CANCELLED,
      'Subscription Cancelled',
      `Your ${oldPlan} subscription has been cancelled. You've been downgraded to the FREE plan.`,
      {
        subscriptionUid: subscription.uid,
        oldPlan,
        newPlan: SubscriptionPlan.FREE,
      },
    );
  }

  /**
   * Handle invoice.payment_succeeded event
   */
  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    // Get subscription ID from invoice parent
    const subscriptionId = invoice.parent?.subscription_details?.subscription;
    if (!subscriptionId) {
      return; // Not a subscription invoice
    }

    const subscription = await this.databaseService.subscription.findUnique({
      where: { stripeSubscriptionId: subscriptionId as string },
    });

    if (!subscription) {
      this.logger.warn(`Subscription not found in database: ${subscriptionId}`);
      return;
    }

    // Update subscription to ACTIVE after successful payment
    await this.databaseService.subscription.update({
      where: { id: subscription.id },
      data: {
        status: SubscriptionStatus.ACTIVE,
      },
    });

    this.logger.log(`Payment succeeded for subscription: ${subscriptionId}`);

    // Create notification for successful payment
    const amount = invoice.amount_paid ? (invoice.amount_paid / 100).toFixed(2) : '0.00';
    const currency = invoice.currency?.toUpperCase() || 'USD';

    await this.createSubscriptionNotification(
      subscription.companyId,
      NotificationType.SUBSCRIPTION_PAYMENT_SUCCESS,
      'Payment Successful',
      `Payment of ${currency} $${amount} processed successfully for your ${subscription.plan} plan.`,
      {
        subscriptionUid: subscription.uid,
        planName: subscription.plan,
        amount,
        currency,
        invoiceId: invoice.id,
      },
    );
  }

  /**
   * Handle invoice.payment_failed event
   */
  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    // Get subscription ID from invoice parent
    const subscriptionId = invoice.parent?.subscription_details?.subscription;
    if (!subscriptionId) {
      return; // Not a subscription invoice
    }

    const subscription = await this.databaseService.subscription.findUnique({
      where: { stripeSubscriptionId: subscriptionId as string },
    });

    if (!subscription) {
      this.logger.warn(`Subscription not found in database: ${subscriptionId}`);
      return;
    }

    // Update subscription to PAST_DUE after failed payment
    await this.databaseService.subscription.update({
      where: { id: subscription.id },
      data: {
        status: SubscriptionStatus.PAST_DUE,
      },
    });

    this.logger.log(`Payment failed for subscription: ${subscriptionId}`);

    // Create notification for failed payment
    const amount = invoice.amount_due ? (invoice.amount_due / 100).toFixed(2) : '0.00';
    const currency = invoice.currency?.toUpperCase() || 'USD';

    await this.createSubscriptionNotification(
      subscription.companyId,
      NotificationType.SUBSCRIPTION_PAYMENT_FAILED,
      'Payment Failed',
      `Payment of ${currency} $${amount} for your ${subscription.plan} plan failed. Please update your payment method to avoid service interruption.`,
      {
        subscriptionUid: subscription.uid,
        planName: subscription.plan,
        amount,
        currency,
        invoiceId: invoice.id,
      },
    );
  }

  /**
   * Create subscription notification for Company Owners
   */
  private async createSubscriptionNotification(
    companyId: number,
    type: NotificationType,
    title: string,
    message: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      // Find all Company Owners for this company
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

      // Create notification for each Company Owner
      const notificationPromises = companyOwners.map((owner) =>
        this.notificationsService.create({
          userUid: owner.uid,
          type,
          title,
          message,
          metadata: metadata || null,
        }),
      );

      await Promise.all(notificationPromises);
      this.logger.log(`Created ${type} notifications for ${companyOwners.length} company owner(s)`);
    } catch (error) {
      // Don't throw - notification failures shouldn't break subscription operations
      this.logger.error(
        `Failed to create subscription notification: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Determine subscription plan from Stripe price ID
   */
  private determinePlanFromPriceId(priceId?: string): SubscriptionPlan {
    if (!priceId) {
      return SubscriptionPlan.FREE;
    }

    const professionalPriceId = this.configService.get<string>('STRIPE_PROFESSIONAL_PRICE_ID');
    const enterprisePriceId = this.configService.get<string>('STRIPE_ENTERPRISE_PRICE_ID');

    if (priceId === professionalPriceId) {
      return SubscriptionPlan.PROFESSIONAL;
    } else if (priceId === enterprisePriceId) {
      return SubscriptionPlan.ENTERPRISE;
    }

    return SubscriptionPlan.FREE;
  }

  /**
   * Determine if a plan change is an upgrade
   */
  private isPlanUpgrade(oldPlan: SubscriptionPlan, newPlan: SubscriptionPlan): boolean {
    const planHierarchy: Record<SubscriptionPlan, number> = {
      [SubscriptionPlan.FREE]: 0,
      [SubscriptionPlan.PROFESSIONAL]: 1,
      [SubscriptionPlan.ENTERPRISE]: 2,
    };

    return planHierarchy[newPlan] > planHierarchy[oldPlan];
  }
}
