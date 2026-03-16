import { Injectable, Logger, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../shared/modules/database/database.service';
import { SubscriptionPlan } from '@prisma/client';
import { PLAN_LIMITS, QuotaResource } from './config/plan-limits.config';
import { QuotaStatusDto, QuotaUsageDto, FeatureAccessDto, PlanLimitsResponseDto } from './dto/quota.dto';

@Injectable()
export class QuotaService {
  private readonly logger = new Logger(QuotaService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Get all plan limits from config — public, no authentication required
   */
  getPlanLimits(): PlanLimitsResponseDto {
    return { plans: PLAN_LIMITS };
  }

  /**
   * Get comprehensive quota status for a company
   */
  async getCompanyQuota(companyId: number): Promise<QuotaStatusDto> {
    const company = await this.databaseService.company.findUnique({
      where: { id: companyId },
      include: {
        subscription: true,
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const plan = company.subscription?.plan || SubscriptionPlan.FREE;
    const limits = PLAN_LIMITS[plan];

    // Get current usage
    const [jobPositionsCount, usersCount, totalStorageMB] = await Promise.all([
      this.getJobPositionsCount(companyId),
      this.getUsersCount(companyId),
      this.getStorageUsageMB(companyId),
    ]);

    // Build quota usage array
    // aiScoringCredits shows 0 used until per-month tracking is implemented
    const quotas: QuotaUsageDto[] = [
      this.buildQuotaUsage('jobPositions', jobPositionsCount, limits.maxJobPositions),
      this.buildQuotaUsage('users', usersCount, limits.maxUsers),
      this.buildQuotaUsage('storage', totalStorageMB, limits.maxStorageMB),
      this.buildQuotaUsage('aiScoringCredits', 0, limits.aiScoringCreditsPerMonth),
    ];

    // Build feature access array
    const features: FeatureAccessDto[] = [
      { feature: 'emailTemplates', enabled: limits.emailTemplatesEnabled },
      { feature: 'analytics', enabled: limits.analyticsEnabled },
    ];

    return {
      companyUid: company.uid,
      plan,
      quotas,
      features,
    };
  }

  /**
   * Check if an action can be performed without exceeding quota
   * Throws PaymentRequiredException if quota exceeded
   */
  async checkQuota(companyId: number, resource: QuotaResource, amount: number = 1): Promise<void> {
    const company = await this.databaseService.company.findUnique({
      where: { id: companyId },
      include: { subscription: true },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const plan = company.subscription?.plan || SubscriptionPlan.FREE;
    const limits = PLAN_LIMITS[plan];

    let currentUsage = 0;
    let limit = 0;
    let resourceName = '';

    switch (resource) {
      case 'jobPositions':
        currentUsage = await this.getJobPositionsCount(companyId);
        limit = limits.maxJobPositions;
        resourceName = 'job positions';
        break;

      case 'candidates':
        // Candidates per position check - requires additional context
        // This is checked separately with jobPositionId
        return;

      case 'users':
        currentUsage = await this.getUsersCount(companyId);
        limit = limits.maxUsers;
        resourceName = 'users';
        break;

      case 'storage':
        currentUsage = await this.getStorageUsageMB(companyId);
        limit = limits.maxStorageMB;
        resourceName = 'storage (MB)';
        break;

      case 'aiScoring':
        if (!limits.aiScoringEnabled) {
          throw new HttpException(`AI Scoring is not available on the ${plan} plan. Please upgrade to Professional or Enterprise.`, HttpStatus.PAYMENT_REQUIRED);
        }
        return;

      case 'emailTemplates':
        if (!limits.emailTemplatesEnabled) {
          throw new HttpException(`Email Templates are not available on the ${plan} plan. Please upgrade to Professional or Enterprise.`, HttpStatus.PAYMENT_REQUIRED);
        }
        return;

      case 'analytics':
        if (!limits.analyticsEnabled) {
          throw new HttpException(`Analytics are not available on the ${plan} plan. Please upgrade to Professional or Enterprise.`, HttpStatus.PAYMENT_REQUIRED);
        }
        return;
    }

    // Check if unlimited (-1)
    if (limit === -1) {
      return; // Unlimited
    }

    // Check if quota would be exceeded
    if (currentUsage + amount > limit) {
      const upgradeMessage =
        plan === SubscriptionPlan.FREE
          ? ' Please upgrade to Professional or Enterprise for higher limits.'
          : plan === SubscriptionPlan.PROFESSIONAL
            ? ' Please upgrade to Enterprise for unlimited access.'
            : '';

      throw new HttpException(
        `Quota exceeded: You have reached the maximum number of ${resourceName} (${limit}) for the ${plan} plan.${upgradeMessage}`,
        HttpStatus.PAYMENT_REQUIRED,
      );
    }
  }

  /**
   * Check if a feature is available for the company's plan
   */
  async canPerformAction(companyId: number, action: QuotaResource): Promise<boolean> {
    try {
      await this.checkQuota(companyId, action);
      return true;
    } catch (error) {
      if (error instanceof HttpException && error.getStatus() === HttpStatus.PAYMENT_REQUIRED) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Check candidates quota for a specific job position
   */
  async checkCandidatesQuota(companyId: number, jobPositionId: number): Promise<void> {
    const company = await this.databaseService.company.findUnique({
      where: { id: companyId },
      include: { subscription: true },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const plan = company.subscription?.plan || SubscriptionPlan.FREE;
    const limits = PLAN_LIMITS[plan];

    // Check if unlimited
    if (limits.maxCandidatesPerPosition === -1) {
      return;
    }

    // Count candidates in hiring processes for this job position
    // Exclude terminal statuses so closed/rejected/cancelled processes don't consume quota
    const candidatesCount = await this.databaseService.hiringProcess.count({
      where: {
        jobPositionId,
        companyId,
        status: { notIn: ['CLOSED', 'REJECTED', 'CANCELLED'] },
      },
    });

    if (candidatesCount >= limits.maxCandidatesPerPosition) {
      const upgradeMessage =
        plan === SubscriptionPlan.FREE
          ? ' Please upgrade to Professional or Enterprise for higher limits.'
          : plan === SubscriptionPlan.PROFESSIONAL
            ? ' Please upgrade to Enterprise for unlimited candidates.'
            : '';

      throw new HttpException(
        `Quota exceeded: This job position has reached the maximum number of candidates (${limits.maxCandidatesPerPosition}) for the ${plan} plan.${upgradeMessage}`,
        HttpStatus.PAYMENT_REQUIRED,
      );
    }
  }

  /**
   * Check storage quota before file upload
   */
  async checkStorageQuota(companyId: number, fileSizeBytes: number): Promise<void> {
    const company = await this.databaseService.company.findUnique({
      where: { id: companyId },
      include: { subscription: true },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const plan = company.subscription?.plan || SubscriptionPlan.FREE;
    const limits = PLAN_LIMITS[plan];

    // Check if unlimited
    if (limits.maxStorageMB === -1) {
      return;
    }

    const currentStorageMB = await this.getStorageUsageMB(companyId);
    const fileSizeMB = fileSizeBytes / (1024 * 1024);

    if (currentStorageMB + fileSizeMB > limits.maxStorageMB) {
      const upgradeMessage =
        plan === SubscriptionPlan.FREE
          ? ' Please upgrade to Professional or Enterprise for more storage.'
          : plan === SubscriptionPlan.PROFESSIONAL
            ? ' Please upgrade to Enterprise for unlimited storage.'
            : '';

      throw new HttpException(
        `Storage quota exceeded: This would exceed your storage limit of ${limits.maxStorageMB} MB for the ${plan} plan.${upgradeMessage}`,
        HttpStatus.PAYMENT_REQUIRED,
      );
    }
  }

  // Private helper methods

  private buildQuotaUsage(resource: string, used: number, limit: number): QuotaUsageDto {
    const percentageUsed = limit === -1 ? 0 : (used / limit) * 100;
    const isExceeded = limit !== -1 && used >= limit;

    return {
      resource,
      used,
      limit,
      percentageUsed: Math.round(percentageUsed * 100) / 100,
      isExceeded,
    };
  }

  private async getJobPositionsCount(companyId: number): Promise<number> {
    return this.databaseService.jobPosition.count({
      where: {
        companyId,
        deletedAt: null,
      },
    });
  }

  private async getUsersCount(companyId: number): Promise<number> {
    return this.databaseService.user.count({
      where: {
        companyId,
        isActive: true,
      },
    });
  }

  private async getStorageUsageMB(companyId: number): Promise<number> {
    // Count each distinct file once per company, even if shared across multiple candidates/jobs.
    // A file belongs to a company if:
    //   (a) it was uploaded by an HR user of that company, OR
    //   (b) it is linked to a candidate who has at least one hiring process at that company.
    // Candidate CVs are deduplicated (same hash = one record), so DISTINCT prevents double-counting
    // when the same file appears in multiple applications within the same company.
    const DOCUMENT_MIMETYPES = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];

    const mimetypePlaceholders = DOCUMENT_MIMETYPES.map((_, i) => `$${i + 2}`).join(', ');

    const result = await this.databaseService.$queryRawUnsafe<[{ total_bytes: bigint }]>(`
      SELECT COALESCE(SUM(f.size), 0) AS total_bytes
      FROM (
        SELECT DISTINCT fu.id, fu.size
        FROM "FileUpload" fu
        WHERE fu.mimetype IN (${mimetypePlaceholders})
          AND (
            -- (a) uploaded by an HR user belonging to this company
            EXISTS (
              SELECT 1 FROM "User" u
              WHERE u.id = fu."uploadedById"
                AND u."companyId" = $1
            )
            OR
            -- (b) linked to a candidate with a hiring process at this company
            EXISTS (
              SELECT 1 FROM "HiringProcess" hp
              WHERE hp."candidateId" = fu."candidateId"
                AND hp."companyId" = $1
            )
          )
      ) f
    `, companyId, ...DOCUMENT_MIMETYPES);

    const totalBytes = Number(result[0]?.total_bytes ?? 0);
    return totalBytes / (1024 * 1024);
  }
}
