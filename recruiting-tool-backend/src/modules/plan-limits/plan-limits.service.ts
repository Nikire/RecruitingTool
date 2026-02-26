import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../shared/modules/database/database.service';
import { UpdatePlanLimitDto, PlanLimitResponseDto, PlanLimitListResponseDto } from './dto/plan-limit.dto';

/**
 * Internal shape matching the PlanLimit Prisma model.
 * Typed locally so the service compiles before `prisma generate` runs.
 */
interface PlanLimitRecord {
  id: number;
  uid: string;
  planType: string;
  maxJobPositions: number;
  maxCandidatesPerPosition: number;
  maxUsers: number;
  maxStorageMB: number;
  aiScoringEnabled: boolean;
  aiScoringCreditsPerMonth: number;
  emailTemplatesEnabled: boolean;
  analyticsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Default plan limit values sourced from the legacy plan-limits.config.ts.
 * These are used to seed the database on first boot if the PlanLimit table is empty.
 */
const DEFAULT_PLAN_LIMITS: Array<Omit<PlanLimitRecord, 'id' | 'uid' | 'createdAt' | 'updatedAt'>> = [
  {
    planType: 'FREE',
    maxJobPositions: 3,
    maxCandidatesPerPosition: 50,
    maxUsers: 3,
    maxStorageMB: 500,
    aiScoringEnabled: true,
    aiScoringCreditsPerMonth: 20,
    emailTemplatesEnabled: true,
    analyticsEnabled: false,
  },
  {
    planType: 'PROFESSIONAL',
    maxJobPositions: 15,
    maxCandidatesPerPosition: 200,
    maxUsers: 10,
    maxStorageMB: 10000,
    aiScoringEnabled: true,
    aiScoringCreditsPerMonth: 200,
    emailTemplatesEnabled: true,
    analyticsEnabled: true,
  },
  {
    planType: 'ENTERPRISE',
    maxJobPositions: -1,
    maxCandidatesPerPosition: -1,
    maxUsers: -1,
    maxStorageMB: -1,
    aiScoringEnabled: true,
    aiScoringCreditsPerMonth: -1,
    emailTemplatesEnabled: true,
    analyticsEnabled: true,
  },
];

@Injectable()
export class PlanLimitsService {
  private readonly logger = new Logger(PlanLimitsService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Called during application bootstrap.
   * Seeds the PlanLimit table with default values if it is empty.
   * Uses upsert on planType so the operation is fully idempotent.
   */
  async seedDefaults(): Promise<void> {
    const count = await this.databaseService.planLimit.count();

    if (count > 0) {
      this.logger.log(`PlanLimit table already has ${count} record(s). Skipping seed.`);
      return;
    }

    this.logger.log('Seeding default plan limits...');

    for (const defaults of DEFAULT_PLAN_LIMITS) {
      await this.databaseService.planLimit.upsert({
        where: { planType: defaults.planType },
        update: {},
        create: defaults,
      });
    }

    this.logger.log('Default plan limits seeded successfully.');
  }

  /**
   * Return all plan limits sorted by planType.
   */
  async findAll(): Promise<PlanLimitListResponseDto> {
    const records = (await this.databaseService.planLimit.findMany({
      orderBy: { planType: 'asc' },
    })) as PlanLimitRecord[];

    return {
      planLimits: records.map((r) => this.toResponseDto(r)),
    };
  }

  /**
   * Return one plan limit by planType string (e.g. "FREE").
   */
  async findByPlanType(planType: string): Promise<PlanLimitResponseDto> {
    const record = (await this.databaseService.planLimit.findUnique({
      where: { planType: planType.toUpperCase() },
    })) as PlanLimitRecord | null;

    if (!record) {
      throw new NotFoundException(`Plan limit for plan type "${planType}" not found`);
    }

    return this.toResponseDto(record);
  }

  /**
   * Update a plan limit record by uid.
   */
  async update(uid: string, dto: UpdatePlanLimitDto): Promise<PlanLimitResponseDto> {
    const existing = (await this.databaseService.planLimit.findUnique({
      where: { uid },
    })) as PlanLimitRecord | null;

    if (!existing) {
      throw new NotFoundException(`Plan limit with uid "${uid}" not found`);
    }

    const updated = (await this.databaseService.planLimit.update({
      where: { uid },
      data: {
        ...(dto.maxJobPositions !== undefined && { maxJobPositions: dto.maxJobPositions }),
        ...(dto.maxCandidatesPerPosition !== undefined && { maxCandidatesPerPosition: dto.maxCandidatesPerPosition }),
        ...(dto.maxUsers !== undefined && { maxUsers: dto.maxUsers }),
        ...(dto.maxStorageMB !== undefined && { maxStorageMB: dto.maxStorageMB }),
        ...(dto.aiScoringEnabled !== undefined && { aiScoringEnabled: dto.aiScoringEnabled }),
        ...(dto.aiScoringCreditsPerMonth !== undefined && { aiScoringCreditsPerMonth: dto.aiScoringCreditsPerMonth }),
        ...(dto.emailTemplatesEnabled !== undefined && { emailTemplatesEnabled: dto.emailTemplatesEnabled }),
        ...(dto.analyticsEnabled !== undefined && { analyticsEnabled: dto.analyticsEnabled }),
      },
    })) as PlanLimitRecord;

    this.logger.log(`Plan limit for "${updated.planType}" updated by admin (uid: ${uid})`);

    return this.toResponseDto(updated);
  }

  /**
   * Upsert a plan limit record by planType.
   * Creates if missing, updates if present.
   */
  async upsert(planType: string, dto: UpdatePlanLimitDto): Promise<PlanLimitResponseDto> {
    const normalizedPlanType = planType.toUpperCase();

    const existing = (await this.databaseService.planLimit.findUnique({
      where: { planType: normalizedPlanType },
    })) as PlanLimitRecord | null;

    if (existing) {
      return this.update(existing.uid, dto);
    }

    const created = (await this.databaseService.planLimit.create({
      data: {
        planType: normalizedPlanType,
        maxJobPositions: dto.maxJobPositions ?? 0,
        maxCandidatesPerPosition: dto.maxCandidatesPerPosition ?? 0,
        maxUsers: dto.maxUsers ?? 0,
        maxStorageMB: dto.maxStorageMB ?? 0,
        aiScoringEnabled: dto.aiScoringEnabled ?? false,
        aiScoringCreditsPerMonth: dto.aiScoringCreditsPerMonth ?? 0,
        emailTemplatesEnabled: dto.emailTemplatesEnabled ?? false,
        analyticsEnabled: dto.analyticsEnabled ?? false,
      },
    })) as PlanLimitRecord;

    return this.toResponseDto(created);
  }

  // ---------------------------------------------------------------------------
  // Internal helpers — consumed by QuotaService or other internal callers
  // ---------------------------------------------------------------------------

  /**
   * Returns a raw PlanLimit record by planType for internal quota enforcement.
   * Falls back to seeding defaults and retrying once when no DB record exists.
   */
  async getPlanLimitForType(planType: string): Promise<PlanLimitRecord> {
    const record = (await this.databaseService.planLimit.findUnique({
      where: { planType: planType.toUpperCase() },
    })) as PlanLimitRecord | null;

    if (!record) {
      this.logger.warn(`No PlanLimit record found for "${planType}". Triggering seedDefaults and retrying.`);
      await this.seedDefaults();
      const retried = (await this.databaseService.planLimit.findUnique({
        where: { planType: planType.toUpperCase() },
      })) as PlanLimitRecord | null;

      if (!retried) {
        throw new NotFoundException(`Plan limit configuration for plan type "${planType}" is missing from the database.`);
      }

      return retried;
    }

    return record;
  }

  // ---------------------------------------------------------------------------
  // Private mappers
  // ---------------------------------------------------------------------------

  private toResponseDto(record: PlanLimitRecord): PlanLimitResponseDto {
    return {
      uid: record.uid,
      planType: record.planType,
      maxJobPositions: record.maxJobPositions,
      maxCandidatesPerPosition: record.maxCandidatesPerPosition,
      maxUsers: record.maxUsers,
      maxStorageMB: record.maxStorageMB,
      aiScoringEnabled: record.aiScoringEnabled,
      aiScoringCreditsPerMonth: record.aiScoringCreditsPerMonth,
      emailTemplatesEnabled: record.emailTemplatesEnabled,
      analyticsEnabled: record.analyticsEnabled,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
