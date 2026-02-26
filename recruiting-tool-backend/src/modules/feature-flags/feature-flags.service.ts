import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../shared/modules/database/database.service';
import { FeatureFlagResponseDto, FeatureFlagListResponseDto, UpdateFeatureFlagDto } from './dto/feature-flag.dto';

/**
 * Internal shape matching the FeatureFlag Prisma model.
 * Typed locally so the service compiles before `prisma generate` runs.
 */
interface FeatureFlagRecord {
  id: number;
  uid: string;
  key: string;
  planType: string;
  enabled: boolean;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Canonical feature keys supported by the flag system.
 */
const FEATURE_KEYS = ['ai_screening', 'bulk_import', 'advanced_analytics', 'custom_branding', 'api_access', 'priority_support'] as const;

type FeatureKey = (typeof FEATURE_KEYS)[number];

/**
 * Default feature flag matrix — 4 plan tiers × 6 feature keys.
 * Used to seed the FeatureFlag table on first boot if it is empty.
 */
const DEFAULT_FEATURE_FLAGS: Array<{
  key: FeatureKey;
  planType: string;
  enabled: boolean;
  description: string;
}> = [
  // FREE — all features disabled
  { key: 'ai_screening', planType: 'FREE', enabled: false, description: 'AI-powered resume screening and candidate ranking' },
  { key: 'bulk_import', planType: 'FREE', enabled: false, description: 'Bulk import candidates via CSV or spreadsheet' },
  { key: 'advanced_analytics', planType: 'FREE', enabled: false, description: 'Advanced analytics dashboard with hiring KPIs and trends' },
  { key: 'custom_branding', planType: 'FREE', enabled: false, description: 'Custom branding and white-label career portal' },
  { key: 'api_access', planType: 'FREE', enabled: false, description: 'Programmatic API access for integrations' },
  { key: 'priority_support', planType: 'FREE', enabled: false, description: 'Priority customer support with SLA guarantees' },

  // STARTER — bulk_import only
  { key: 'ai_screening', planType: 'STARTER', enabled: false, description: 'AI-powered resume screening and candidate ranking' },
  { key: 'bulk_import', planType: 'STARTER', enabled: true, description: 'Bulk import candidates via CSV or spreadsheet' },
  { key: 'advanced_analytics', planType: 'STARTER', enabled: false, description: 'Advanced analytics dashboard with hiring KPIs and trends' },
  { key: 'custom_branding', planType: 'STARTER', enabled: false, description: 'Custom branding and white-label career portal' },
  { key: 'api_access', planType: 'STARTER', enabled: false, description: 'Programmatic API access for integrations' },
  { key: 'priority_support', planType: 'STARTER', enabled: false, description: 'Priority customer support with SLA guarantees' },

  // PROFESSIONAL — bulk_import, advanced_analytics, custom_branding
  { key: 'ai_screening', planType: 'PROFESSIONAL', enabled: false, description: 'AI-powered resume screening and candidate ranking' },
  { key: 'bulk_import', planType: 'PROFESSIONAL', enabled: true, description: 'Bulk import candidates via CSV or spreadsheet' },
  { key: 'advanced_analytics', planType: 'PROFESSIONAL', enabled: true, description: 'Advanced analytics dashboard with hiring KPIs and trends' },
  { key: 'custom_branding', planType: 'PROFESSIONAL', enabled: true, description: 'Custom branding and white-label career portal' },
  { key: 'api_access', planType: 'PROFESSIONAL', enabled: false, description: 'Programmatic API access for integrations' },
  { key: 'priority_support', planType: 'PROFESSIONAL', enabled: false, description: 'Priority customer support with SLA guarantees' },

  // ENTERPRISE — all features enabled
  { key: 'ai_screening', planType: 'ENTERPRISE', enabled: true, description: 'AI-powered resume screening and candidate ranking' },
  { key: 'bulk_import', planType: 'ENTERPRISE', enabled: true, description: 'Bulk import candidates via CSV or spreadsheet' },
  { key: 'advanced_analytics', planType: 'ENTERPRISE', enabled: true, description: 'Advanced analytics dashboard with hiring KPIs and trends' },
  { key: 'custom_branding', planType: 'ENTERPRISE', enabled: true, description: 'Custom branding and white-label career portal' },
  { key: 'api_access', planType: 'ENTERPRISE', enabled: true, description: 'Programmatic API access for integrations' },
  { key: 'priority_support', planType: 'ENTERPRISE', enabled: true, description: 'Priority customer support with SLA guarantees' },
];

@Injectable()
export class FeatureFlagsService {
  private readonly logger = new Logger(FeatureFlagsService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Typed accessor for the featureFlag Prisma delegate.
   * Cast to `any` here because `prisma generate` may not have run yet in the
   * current environment — the FeatureFlag model will be present at runtime
   * after the migration is deployed and generate is executed inside Docker.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private get ff(): any {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.databaseService as any).featureFlag;
  }

  /**
   * Called during application bootstrap.
   * Seeds the FeatureFlag table with default values if it is empty.
   * Uses upsert on [key, planType] so the operation is fully idempotent.
   */
  async seedDefaults(): Promise<void> {
    const count = (await this.ff.count()) as number;

    if (count > 0) {
      this.logger.log(`FeatureFlag table already has ${count} record(s). Skipping seed.`);
      return;
    }

    this.logger.log('Seeding default feature flags...');

    for (const defaults of DEFAULT_FEATURE_FLAGS) {
      await this.ff.upsert({
        where: { key_planType: { key: defaults.key, planType: defaults.planType } },
        update: {},
        create: {
          key: defaults.key,
          planType: defaults.planType,
          enabled: defaults.enabled,
          description: defaults.description,
        },
      });
    }

    this.logger.log(`Default feature flags seeded successfully (${DEFAULT_FEATURE_FLAGS.length} records).`);
  }

  /**
   * Return all feature flags ordered by key then planType.
   */
  async findAll(): Promise<FeatureFlagListResponseDto> {
    const records = (await this.ff.findMany({
      orderBy: [{ key: 'asc' }, { planType: 'asc' }],
    })) as FeatureFlagRecord[];

    return {
      featureFlags: records.map((r) => this.toResponseDto(r)),
    };
  }

  /**
   * Return all feature flags for a specific plan type.
   */
  async findByPlanType(planType: string): Promise<FeatureFlagListResponseDto> {
    const normalizedPlanType = planType.toUpperCase();

    const records = (await this.ff.findMany({
      where: { planType: normalizedPlanType },
      orderBy: { key: 'asc' },
    })) as FeatureFlagRecord[];

    return {
      featureFlags: records.map((r) => this.toResponseDto(r)),
    };
  }

  /**
   * Return all plan-type variants for a specific feature key.
   */
  async findByKey(key: string): Promise<FeatureFlagListResponseDto> {
    const records = (await this.ff.findMany({
      where: { key: key.toLowerCase() },
      orderBy: { planType: 'asc' },
    })) as FeatureFlagRecord[];

    return {
      featureFlags: records.map((r) => this.toResponseDto(r)),
    };
  }

  /**
   * Check whether a specific feature is enabled for a given plan type.
   * Returns false if the flag record does not exist (safe default).
   */
  async isEnabled(key: string, planType: string): Promise<boolean> {
    const record = (await this.ff.findUnique({
      where: { key_planType: { key: key.toLowerCase(), planType: planType.toUpperCase() } },
    })) as FeatureFlagRecord | null;

    if (!record) {
      this.logger.warn(`FeatureFlag not found for key="${key}" planType="${planType}". Returning false.`);
      return false;
    }

    return record.enabled;
  }

  /**
   * Toggle the enabled state of a single feature flag by uid.
   */
  async toggle(uid: string, dto: UpdateFeatureFlagDto): Promise<FeatureFlagResponseDto> {
    const existing = (await this.ff.findUnique({
      where: { uid },
    })) as FeatureFlagRecord | null;

    if (!existing) {
      throw new NotFoundException(`Feature flag with uid "${uid}" not found`);
    }

    const updated = (await this.ff.update({
      where: { uid },
      data: { enabled: dto.enabled },
    })) as FeatureFlagRecord;

    this.logger.log(`Feature flag key="${updated.key}" planType="${updated.planType}" toggled to enabled=${dto.enabled} (uid: ${uid})`);

    return this.toResponseDto(updated);
  }

  // ---------------------------------------------------------------------------
  // Private mappers
  // ---------------------------------------------------------------------------

  private toResponseDto(record: FeatureFlagRecord): FeatureFlagResponseDto {
    return {
      uid: record.uid,
      key: record.key,
      planType: record.planType,
      enabled: record.enabled,
      description: record.description,
      updatedAt: record.updatedAt,
    };
  }
}
