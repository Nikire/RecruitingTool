import { Injectable, Logger, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { DatabaseService } from '../shared/modules/database/database.service';
import { CreateCustomPlanDto, UpdateCustomPlanDto, CustomPlanResponseDto, CustomPlanListResponseDto, StripeSyncResponseDto, StripeConfigResponseDto } from './dto/custom-plan.dto';

/**
 * Internal shape matching Prisma CustomPlan model + company relation.
 */
interface CustomPlanRecord {
  id: number;
  uid: string;
  companyId: number | null;
  name: string;
  isCustom: boolean;
  maxUsers: number;
  maxJobPositions: number;
  maxCandidatesPerPosition: number;
  maxStorageMB: number;
  aiScoringCreditsPerMonth: number;
  emailTemplatesEnabled: boolean;
  analyticsEnabled: boolean;
  monthlyPrice: number;
  annualPrice: number;
  currency: string;
  stripeProductId: string | null;
  stripePriceId: string | null;
  stripeAnnualPriceId: string | null;
  monthlyPaymentLink: string | null;
  annualPaymentLink: string | null;
  stripeIsTestMode: boolean | null;
  createdAt: Date;
  updatedAt: Date;
  company: { uid: string; name: string } | null;
}

@Injectable()
export class CustomPlansService {
  private readonly logger = new Logger(CustomPlansService.name);
  private readonly stripe: Stripe | null = null;
  private readonly stripeEnabled: boolean = false;

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (apiKey) {
      this.stripe = new Stripe(apiKey, { apiVersion: '2026-02-25.clover' });
      this.stripeEnabled = true;
      this.logger.log('Stripe integration available for custom plans');
    } else {
      this.logger.warn('STRIPE_SECRET_KEY not set — Stripe sync for custom plans will be disabled');
    }
  }

  // ---------------------------------------------------------------------------
  // Stripe configuration (test mode detection)
  // ---------------------------------------------------------------------------

  getStripeConfig(): StripeConfigResponseDto {
    const apiKey = this.configService.get<string>('STRIPE_SECRET_KEY') ?? '';
    return {
      stripeEnabled: this.stripeEnabled,
      isTestMode: apiKey.startsWith('sk_test_'),
    };
  }

  // ---------------------------------------------------------------------------
  // CRUD operations
  // ---------------------------------------------------------------------------

  async findAll(): Promise<CustomPlanListResponseDto> {
    const records = (await this.databaseService.customPlan.findMany({
      include: { company: { select: { uid: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    })) as CustomPlanRecord[];

    return { customPlans: records.map((r) => this.toResponseDto(r)) };
  }

  async findOne(uid: string): Promise<CustomPlanResponseDto> {
    const record = await this.findByUid(uid);
    return this.toResponseDto(record);
  }

  async create(dto: CreateCustomPlanDto): Promise<CustomPlanResponseDto> {
    let companyId: number | null = null;

    if (dto.companyUid) {
      const company = await this.databaseService.company.findUnique({
        where: { uid: dto.companyUid },
        select: { id: true },
      });
      if (!company) {
        throw new NotFoundException(`Company with uid "${dto.companyUid}" not found`);
      }
      companyId = company.id;
    }

    const created = (await this.databaseService.customPlan.create({
      data: {
        name: dto.name,
        companyId,
        maxUsers: dto.maxUsers ?? 10,
        maxJobPositions: dto.maxJobPositions ?? 10,
        maxCandidatesPerPosition: dto.maxCandidatesPerPosition ?? 100,
        maxStorageMB: dto.maxStorageMB ?? 5000,
        aiScoringCreditsPerMonth: dto.aiScoringCreditsPerMonth ?? 100,
        emailTemplatesEnabled: dto.emailTemplatesEnabled ?? true,
        analyticsEnabled: dto.analyticsEnabled ?? true,
        monthlyPrice: dto.monthlyPrice ?? 0,
        annualPrice: dto.annualPrice ?? 0,
        currency: dto.currency ?? 'USD',
      },
      include: { company: { select: { uid: true, name: true } } },
    })) as CustomPlanRecord;

    this.logger.log(`Custom plan created: "${created.name}" (uid: ${created.uid})`);
    return this.toResponseDto(created);
  }

  async update(uid: string, dto: UpdateCustomPlanDto): Promise<CustomPlanResponseDto> {
    await this.findByUid(uid); // Ensure it exists

    const updated = (await this.databaseService.customPlan.update({
      where: { uid },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.maxUsers !== undefined && { maxUsers: dto.maxUsers }),
        ...(dto.maxJobPositions !== undefined && { maxJobPositions: dto.maxJobPositions }),
        ...(dto.maxCandidatesPerPosition !== undefined && { maxCandidatesPerPosition: dto.maxCandidatesPerPosition }),
        ...(dto.maxStorageMB !== undefined && { maxStorageMB: dto.maxStorageMB }),
        ...(dto.aiScoringCreditsPerMonth !== undefined && { aiScoringCreditsPerMonth: dto.aiScoringCreditsPerMonth }),
        ...(dto.emailTemplatesEnabled !== undefined && { emailTemplatesEnabled: dto.emailTemplatesEnabled }),
        ...(dto.analyticsEnabled !== undefined && { analyticsEnabled: dto.analyticsEnabled }),
        ...(dto.monthlyPrice !== undefined && { monthlyPrice: dto.monthlyPrice }),
        ...(dto.annualPrice !== undefined && { annualPrice: dto.annualPrice }),
        ...(dto.currency !== undefined && { currency: dto.currency }),
      },
      include: { company: { select: { uid: true, name: true } } },
    })) as CustomPlanRecord;

    this.logger.log(`Custom plan updated: "${updated.name}" (uid: ${uid})`);
    return this.toResponseDto(updated);
  }

  async remove(uid: string): Promise<void> {
    await this.findByUid(uid); // Ensure it exists

    await this.databaseService.customPlan.delete({ where: { uid } });
    this.logger.log(`Custom plan deleted (uid: ${uid})`);
  }

  // ---------------------------------------------------------------------------
  // Assign plan to a company
  // ---------------------------------------------------------------------------

  async assignToCompany(uid: string, companyUid: string): Promise<CustomPlanResponseDto> {
    await this.findByUid(uid);

    const company = await this.databaseService.company.findUnique({
      where: { uid: companyUid },
      select: { id: true },
    });
    if (!company) {
      throw new NotFoundException(`Company with uid "${companyUid}" not found`);
    }

    const updated = (await this.databaseService.customPlan.update({
      where: { uid },
      data: { companyId: company.id },
      include: { company: { select: { uid: true, name: true } } },
    })) as CustomPlanRecord;

    this.logger.log(`Custom plan "${uid}" assigned to company "${companyUid}"`);
    return this.toResponseDto(updated);
  }

  // ---------------------------------------------------------------------------
  // Stripe sync
  // ---------------------------------------------------------------------------

  async syncToStripe(uid: string): Promise<StripeSyncResponseDto> {
    if (!this.stripeEnabled || !this.stripe) {
      throw new BadRequestException('Stripe is not configured on this server. Set STRIPE_SECRET_KEY to enable Stripe sync.');
    }

    const record = await this.findByUid(uid);

    let stripeProductId = record.stripeProductId;
    let stripePriceId: string;
    let stripeAnnualPriceId: string;
    let monthlyPaymentLink: string;
    let annualPaymentLink: string;

    // Create or reuse the Stripe product
    if (!stripeProductId) {
      try {
        const product = await this.stripe.products.create({
          name: record.name,
          metadata: { customPlanUid: record.uid },
        });
        stripeProductId = product.id;
        this.logger.log(`Stripe product created: ${stripeProductId} for custom plan "${record.uid}"`);
      } catch (err) {
        this.logger.error('Failed to create Stripe product', err);
        throw new InternalServerErrorException('Failed to create Stripe product');
      }
    }

    // Always create new Stripe prices (prices are immutable in Stripe)
    try {
      const monthlyPrice = await this.stripe.prices.create({
        product: stripeProductId,
        unit_amount: record.monthlyPrice,
        currency: record.currency.toLowerCase(),
        recurring: { interval: 'month' },
        metadata: { customPlanUid: record.uid, billingInterval: 'month' },
      });
      stripePriceId = monthlyPrice.id;
      this.logger.log(`Stripe monthly price created: ${stripePriceId} for custom plan "${record.uid}"`);

      const annualPrice = await this.stripe.prices.create({
        product: stripeProductId,
        unit_amount: record.annualPrice,
        currency: record.currency.toLowerCase(),
        recurring: { interval: 'year' },
        metadata: { customPlanUid: record.uid, billingInterval: 'year' },
      });
      stripeAnnualPriceId = annualPrice.id;
      this.logger.log(`Stripe annual price created: ${stripeAnnualPriceId} for custom plan "${record.uid}"`);
    } catch (err) {
      this.logger.error('Failed to create Stripe prices', err);
      throw new InternalServerErrorException('Failed to create Stripe prices');
    }

    // Create Stripe Payment Links (shareable checkout URLs for customers)
    try {
      const monthlyLink = await this.stripe.paymentLinks.create({
        line_items: [{ price: stripePriceId, quantity: 1 }],
      });
      monthlyPaymentLink = monthlyLink.url;
      this.logger.log(`Stripe monthly payment link created: ${monthlyPaymentLink} for custom plan "${record.uid}"`);

      const annualLink = await this.stripe.paymentLinks.create({
        line_items: [{ price: stripeAnnualPriceId, quantity: 1 }],
      });
      annualPaymentLink = annualLink.url;
      this.logger.log(`Stripe annual payment link created: ${annualPaymentLink} for custom plan "${record.uid}"`);
    } catch (err) {
      this.logger.error('Failed to create Stripe payment links', err);
      throw new InternalServerErrorException('Failed to create Stripe payment links');
    }

    const isTestMode = (this.configService.get<string>('STRIPE_SECRET_KEY') ?? '').startsWith('sk_test_');

    // Persist all Stripe IDs, payment links, and test mode flag in a single update
    const finalRecord = (await this.databaseService.customPlan.update({
      where: { uid },
      data: { stripeProductId, stripePriceId, stripeAnnualPriceId, monthlyPaymentLink, annualPaymentLink, stripeIsTestMode: isTestMode },
      include: { company: { select: { uid: true, name: true } } },
    })) as CustomPlanRecord;

    return {
      customPlan: this.toResponseDto(finalRecord),
      stripeProductId,
      stripePriceId,
      stripeAnnualPriceId,
      monthlyPaymentLink,
      annualPaymentLink,
      isTestMode,
    };
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private async findByUid(uid: string): Promise<CustomPlanRecord> {
    const record = (await this.databaseService.customPlan.findUnique({
      where: { uid },
      include: { company: { select: { uid: true, name: true } } },
    })) as CustomPlanRecord | null;

    if (!record) {
      throw new NotFoundException(`Custom plan with uid "${uid}" not found`);
    }

    return record;
  }

  private toResponseDto(record: CustomPlanRecord): CustomPlanResponseDto {
    return {
      uid: record.uid,
      name: record.name,
      isCustom: record.isCustom,
      companyUid: record.company?.uid ?? null,
      companyName: record.company?.name ?? null,
      maxUsers: record.maxUsers,
      maxJobPositions: record.maxJobPositions,
      maxCandidatesPerPosition: record.maxCandidatesPerPosition,
      maxStorageMB: record.maxStorageMB,
      aiScoringCreditsPerMonth: record.aiScoringCreditsPerMonth,
      emailTemplatesEnabled: record.emailTemplatesEnabled,
      analyticsEnabled: record.analyticsEnabled,
      monthlyPrice: record.monthlyPrice,
      annualPrice: record.annualPrice,
      currency: record.currency,
      stripeProductId: record.stripeProductId,
      stripePriceId: record.stripePriceId,
      stripeAnnualPriceId: record.stripeAnnualPriceId,
      monthlyPaymentLink: record.monthlyPaymentLink,
      annualPaymentLink: record.annualPaymentLink,
      stripeIsTestMode: record.stripeIsTestMode,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
