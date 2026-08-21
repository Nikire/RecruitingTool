import { Injectable, InternalServerErrorException, HttpException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../shared/modules/database/database.service';
import {
  AdminStatsResponseDto,
  UserStatsResponseDto,
  CompanyStatsResponseDto,
  RecentActivityResponseDto,
  UsersByRoleDto,
  RecentLoginDto,
  RevenueStatsResponseDto,
  PlanDistributionItemDto,
  StatusDistributionItemDto,
  MonthlySignupItemDto,
  CompanyQuotaItemDto,
  QuotaOverviewResponseDto,
  QuotaOverviewSummaryDto,
  QuotaResourceUsageDto,
  CompanyHealthItemDto,
  CompanyHealthResponseDto,
  CompanyHealthSummaryDto,
  RiskTier,
  TrialCompanyItemDto,
  TrialOverviewResponseDto,
  TrialOverviewSummaryDto,
  ConversionReadiness,
  ChangePlanDto,
  ChangeStatusDto,
  ExtendTrialDto,
  SubscriptionAuditLogItemDto,
  UpdatedSubscriptionDto,
  DemoBookingAdminItemDto,
  DemoBookingListResponseDto,
  SetDemoOutcomeDto,
  LinkDemoProspectDto,
  EmailDeliverabilityStatsDto,
  EmailDeliverabilityPerTypeDto,
  RecentBounceDto,
  EmailDeliverabilityPerTypeItemDto,
  PipelineAnalyticsResponseDto,
  PlatformStatsDto,
  MonthlyApplicationItemDto,
  ApplicationSourceItemDto,
  CreateReleaseNoteDto,
  UpdateReleaseNoteDto,
  ReleaseNoteAdminItemDto,
  ReleaseNoteListResponseDto,
  OutreachTemplateOverrideDto,
  UpsertOutreachTemplateDto,
} from './dto/admin-stats.dto';
import { PLAN_LIMITS } from '../quota/config/plan-limits.config';
import { DemoOutcome, QuotaType, SubscriptionPlan } from '@prisma/client';

/**
 * One company's four health signals plus the derived score/tier.
 *
 * Identical to `CompanyHealthItemDto` except that it also carries the numeric
 * `companyId`. That field exists only so background jobs can write a snapshot row
 * without a second uid -> id lookup per company. It is stripped before anything is
 * returned from a controller — never put `companyId` on an external DTO.
 */
export interface CompanyHealthSignalRow extends CompanyHealthItemDto {
  companyId: number;
}

@Injectable()
export class AdminService {
  constructor(private databaseService: DatabaseService) {}

  async getOverviewStats(): Promise<AdminStatsResponseDto> {
    try {
      const [userStats, companyStats, candidateStats, jobPositionStats, hiringProcessStats, recentActivity] = await Promise.all([
        this.getUserStats(),
        this.getCompanyStats(),
        this.getCandidateStats(),
        this.getJobPositionStats(),
        this.getHiringProcessStats(),
        this.getRecentActivity(),
      ]);

      return {
        ...userStats,
        ...companyStats,
        ...candidateStats,
        ...jobPositionStats,
        ...hiringProcessStats,
        ...recentActivity,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to get overview stats: ${error.message}`);
    }
  }

  async getUserStats(): Promise<UserStatsResponseDto> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [totalUsers, activeUsers, inactiveUsers, usersByRoleRaw, newUsersThisMonth] = await Promise.all([
        this.databaseService.user.count(),
        this.databaseService.user.count({ where: { isActive: true } }),
        this.databaseService.user.count({ where: { isActive: false } }),
        this.databaseService.user.groupBy({
          by: ['roles'],
          _count: {
            id: true,
          },
        }),
        this.databaseService.user.count({
          where: {
            createdAt: {
              gte: startOfMonth,
            },
          },
        }),
      ]);

      // Process usersByRole - flatten the roles array
      const roleCountMap: Record<string, number> = {};
      usersByRoleRaw.forEach((group) => {
        group.roles.forEach((role) => {
          roleCountMap[role] = (roleCountMap[role] || 0) + group._count.id;
        });
      });

      const usersByRole: UsersByRoleDto[] = Object.entries(roleCountMap).map(([role, count]) => ({
        role,
        count,
      }));

      return {
        totalUsers,
        activeUsers,
        inactiveUsers,
        usersByRole,
        newUsersThisMonth,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to get user stats: ${error.message}`);
    }
  }

  async getCompanyStats(): Promise<CompanyStatsResponseDto> {
    try {
      const [totalCompanies, activeCompanies] = await Promise.all([
        this.databaseService.company.count(),
        this.databaseService.company.count({
          where: {
            users: {
              some: {
                isActive: true,
              },
            },
          },
        }),
      ]);

      return {
        totalCompanies,
        activeCompanies,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to get company stats: ${error.message}`);
    }
  }

  private async getCandidateStats(): Promise<{
    totalCandidates: number;
    candidatesThisMonth: number;
  }> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [totalCandidates, candidatesThisMonth] = await Promise.all([
        this.databaseService.candidate.count(),
        this.databaseService.candidate.count({
          where: {
            createdAt: {
              gte: startOfMonth,
            },
          },
        }),
      ]);

      return {
        totalCandidates,
        candidatesThisMonth,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to get candidate stats: ${error.message}`);
    }
  }

  private async getJobPositionStats(): Promise<{
    totalJobPositions: number;
    openJobPositions: number;
    closedJobPositions: number;
  }> {
    try {
      const [totalJobPositions, openJobPositions, closedJobPositions] = await Promise.all([
        this.databaseService.jobPosition.count(),
        this.databaseService.jobPosition.count({
          where: { status: 'OPEN' },
        }),
        this.databaseService.jobPosition.count({
          where: { status: 'CLOSED' },
        }),
      ]);

      return {
        totalJobPositions,
        openJobPositions,
        closedJobPositions,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to get job position stats: ${error.message}`);
    }
  }

  private async getHiringProcessStats(): Promise<{
    totalHiringProcesses: number;
    activeHiringProcesses: number;
  }> {
    try {
      const [totalHiringProcesses, activeHiringProcesses] = await Promise.all([
        this.databaseService.hiringProcess.count(),
        this.databaseService.hiringProcess.count({
          where: {
            status: {
              in: ['OPEN', 'IN_PROGRESS'],
            },
          },
        }),
      ]);

      return {
        totalHiringProcesses,
        activeHiringProcesses,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to get hiring process stats: ${error.message}`);
    }
  }

  async getRevenueStats(): Promise<RevenueStatsResponseDto> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

      // Plan pricing in USD
      const PLAN_PRICES: Record<string, number> = {
        FREE: 0,
        PROFESSIONAL: 49,
        ENTERPRISE: 149,
      };

      // Run all queries in parallel
      const [activeSubscriptions, trialingCount, pastDueCount, canceledThisMonthCount, totalCount, planGroupBy, statusGroupBy, allCompanies, lastMonthActiveSubscriptions] =
        await Promise.all([
          // Active subscriptions for MRR calculation
          this.databaseService.subscription.findMany({
            where: { status: 'ACTIVE' },
            select: { plan: true },
          }),
          // Trialing count
          this.databaseService.subscription.count({ where: { status: 'TRIALING' } }),
          // Past due count
          this.databaseService.subscription.count({ where: { status: 'PAST_DUE' } }),
          // Canceled this month
          this.databaseService.subscription.count({
            where: {
              status: 'CANCELED',
              updatedAt: { gte: startOfMonth },
            },
          }),
          // Total subscriptions
          this.databaseService.subscription.count(),
          // Plan distribution
          this.databaseService.subscription.groupBy({
            by: ['plan'],
            _count: { id: true },
          }),
          // Status distribution
          this.databaseService.subscription.groupBy({
            by: ['status'],
            _count: { id: true },
          }),
          // All companies with createdAt for monthly signups (last 6 months)
          this.databaseService.company.findMany({
            where: {
              createdAt: {
                gte: new Date(now.getFullYear(), now.getMonth() - 5, 1),
              },
            },
            select: { createdAt: true },
          }),
          // Last month active subscriptions for MRR growth
          this.databaseService.subscription.findMany({
            where: {
              status: 'ACTIVE',
              createdAt: { lte: endOfLastMonth },
              updatedAt: { lte: endOfLastMonth },
            },
            select: { plan: true },
          }),
        ]);

      // Calculate current MRR
      const currentMrr = activeSubscriptions.reduce((sum, sub) => {
        return sum + (PLAN_PRICES[sub.plan] ?? 0);
      }, 0);

      // Calculate last month MRR (rough estimate based on active subs created before end of last month)
      const lastMonthMrr = lastMonthActiveSubscriptions.reduce((sum, sub) => {
        return sum + (PLAN_PRICES[sub.plan] ?? 0);
      }, 0);

      // Calculate MRR growth percentage
      const mrrGrowth = lastMonthMrr === 0 ? (currentMrr > 0 ? 100 : 0) : parseFloat((((currentMrr - lastMonthMrr) / lastMonthMrr) * 100).toFixed(1));

      // Plan distribution
      const planDistribution: PlanDistributionItemDto[] = planGroupBy.map((g) => ({
        plan: g.plan,
        count: g._count.id,
      }));

      // Status distribution
      const statusDistribution: StatusDistributionItemDto[] = statusGroupBy.map((g) => ({
        status: g.status,
        count: g._count.id,
      }));

      // Monthly signups — last 6 months
      const monthlyMap: Record<string, number> = {};
      // Initialize all 6 months with 0
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthlyMap[key] = 0;
      }
      // Count companies per month
      allCompanies.forEach((c) => {
        const d = c.createdAt;
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (key in monthlyMap) {
          monthlyMap[key] = (monthlyMap[key] ?? 0) + 1;
        }
      });
      const monthlySignups: MonthlySignupItemDto[] = Object.entries(monthlyMap).map(([month, count]) => ({
        month,
        count,
      }));

      return {
        mrr: currentMrr,
        mrrGrowth,
        activeCompanies: activeSubscriptions.length,
        trialingCompanies: trialingCount,
        pastDueCompanies: pastDueCount,
        canceledThisMonth: canceledThisMonthCount,
        totalCompanies: totalCount,
        planDistribution,
        statusDistribution,
        monthlySignups,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to get revenue stats: ${error.message}`);
    }
  }

  async getRecentActivity(): Promise<RecentActivityResponseDto> {
    try {
      // Get recent LOGIN activity logs (last 10)
      const recentLoginLogs = await this.databaseService.userActivityLog.findMany({
        where: {
          action: 'LOGIN',
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
        include: {
          user: {
            select: {
              uid: true,
              name: true,
            },
          },
        },
      });

      const recentLogins: RecentLoginDto[] = recentLoginLogs.map((log) => ({
        userUid: log.user.uid,
        userName: log.user.name,
        loginAt: log.createdAt.toISOString(),
      }));

      return {
        recentLogins,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to get recent activity: ${error.message}`);
    }
  }

  // ─── Quota Overview ──────────────────────────────────────────────────────────

  async getQuotaOverview(page: number, limit: number, planFilter?: string, statusFilter?: string): Promise<QuotaOverviewResponseDto> {
    try {
      // Fetch all companies with their subscriptions, user counts, job position counts, and AI quotas
      const allCompanies = await this.databaseService.company.findMany({
        select: {
          uid: true,
          name: true,
          subscription: {
            select: {
              plan: true,
              status: true,
            },
          },
          _count: {
            select: {
              users: { where: { isActive: true } },
              jobPositions: { where: { deletedAt: null, status: { not: 'CLOSED' as any } } },
            },
          },
          aiQuotas: {
            where: {
              quotaType: QuotaType.CANDIDATE_SCORING,
            },
            select: {
              used: true,
              limit: true,
            },
          },
        },
      });

      // Build quota items for each company
      const allItems: CompanyQuotaItemDto[] = allCompanies.map((company) => {
        const plan = (company.subscription?.plan ?? 'FREE') as SubscriptionPlan;
        const subscriptionStatus = company.subscription?.status ?? 'ACTIVE';
        const planLimits = PLAN_LIMITS[plan];

        const jobPositionsUsed = company._count.jobPositions;
        const usersUsed = company._count.users;
        const aiQuotaRecord = company.aiQuotas[0];
        const aiCreditsUsed = aiQuotaRecord?.used ?? 0;
        // Use the AIQuota record limit if available, fall back to plan limit
        const aiCreditsLimit = aiQuotaRecord?.limit ?? planLimits.aiScoringCreditsPerMonth;

        const jobPositions = this.buildResourceUsage(jobPositionsUsed, planLimits.maxJobPositions);
        const users = this.buildResourceUsage(usersUsed, planLimits.maxUsers);
        const aiCredits = this.buildResourceUsage(aiCreditsUsed, aiCreditsLimit);

        const healthStatus = this.computeHealthStatus([jobPositions, users, aiCredits]);

        return {
          uid: company.uid,
          name: company.name,
          plan,
          subscriptionStatus,
          jobPositions,
          users,
          aiCredits,
          healthStatus,
        };
      });

      // Apply plan filter
      let filtered = planFilter ? allItems.filter((item) => item.plan === planFilter) : allItems;

      // Apply health status filter
      if (statusFilter) {
        filtered = filtered.filter((item) => item.healthStatus === statusFilter);
      }

      // Sort: EXCEEDED → CRITICAL → WARNING → OK, then by highest job position %
      const statusOrder: Record<string, number> = { EXCEEDED: 0, CRITICAL: 1, WARNING: 2, OK: 3 };
      filtered.sort((a, b) => {
        const statusDiff = (statusOrder[a.healthStatus] ?? 99) - (statusOrder[b.healthStatus] ?? 99);
        if (statusDiff !== 0) return statusDiff;
        return b.jobPositions.percentage - a.jobPositions.percentage;
      });

      // Compute summary from full unfiltered list
      const summary: QuotaOverviewSummaryDto = {
        totalCompanies: allItems.length,
        okCount: allItems.filter((i) => i.healthStatus === 'OK').length,
        warningCount: allItems.filter((i) => i.healthStatus === 'WARNING').length,
        criticalCount: allItems.filter((i) => i.healthStatus === 'CRITICAL').length,
        exceededCount: allItems.filter((i) => i.healthStatus === 'EXCEEDED').length,
      };

      // Paginate
      const total = filtered.length;
      const offset = (page - 1) * limit;
      const paginated = filtered.slice(offset, offset + limit);

      return {
        companies: paginated,
        total,
        page,
        limit,
        summary,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to get quota overview: ${error.message}`);
    }
  }

  // ─── Trial & Conversion Tracker ─────────────────────────────────────────────

  async getTrialOverview(page: number, limit: number, readiness?: string, planFilter?: string): Promise<TrialOverviewResponseDto> {
    try {
      const now = new Date();

      // Fetch all companies that are FREE or TRIALING
      const companies = await this.databaseService.company.findMany({
        select: {
          id: true,
          uid: true,
          name: true,
          createdAt: true,
          subscription: {
            select: {
              plan: true,
              status: true,
            },
          },
        },
        where: {
          OR: [{ subscription: { plan: 'FREE' } }, { subscription: { status: 'TRIALING' } }],
        },
      });

      // Compute activation metrics for each company in parallel
      const allItems: TrialCompanyItemDto[] = await Promise.all(
        companies.map(async (company) => {
          const [jobPositionsCreated, candidatesAdded, applicationsReceived, hiringProcessesStarted, teamMembersInvited, prospectRecord] = await Promise.all([
            // Signal 1: job positions created ≥ 1
            this.databaseService.jobPosition.count({
              where: { companyId: company.id },
            }),
            // Signal 2: candidates added ≥ 5
            this.databaseService.candidate.count({
              where: { companyId: company.id },
            }),
            // Signal 3: applications received ≥ 3 (non-deleted)
            this.databaseService.application.count({
              where: {
                jobPosition: { companyId: company.id },
                deletedAt: null,
              },
            }),
            // Signal 4: hiring processes started ≥ 1
            this.databaseService.hiringProcess.count({
              where: { companyId: company.id },
            }),
            // Signal 5: team members (active users) ≥ 2
            this.databaseService.user.count({
              where: { companyId: company.id, isActive: true },
            }),
            // Check for outreach record
            this.databaseService.prospectCompany.findFirst({
              where: { linkedCompanyId: company.id },
              select: { uid: true },
            }),
          ]);

          // Compute activation score (5 signals × 20pts each)
          let activationScore = 0;
          if (jobPositionsCreated >= 1) activationScore += 20;
          if (candidatesAdded >= 5) activationScore += 20;
          if (applicationsReceived >= 3) activationScore += 20;
          if (hiringProcessesStarted >= 1) activationScore += 20;
          if (teamMembersInvited >= 2) activationScore += 20;

          // Determine readiness tier
          let conversionReadiness: ConversionReadiness;
          if (activationScore >= 70) conversionReadiness = 'HOT';
          else if (activationScore >= 40) conversionReadiness = 'WARM';
          else conversionReadiness = 'COLD';

          // Days on platform
          const diffMs = now.getTime() - company.createdAt.getTime();
          const daysOnPlatform = Math.floor(diffMs / (1000 * 60 * 60 * 24));

          return {
            uid: company.uid,
            name: company.name,
            plan: company.subscription?.plan ?? 'FREE',
            subscriptionStatus: company.subscription?.status ?? 'ACTIVE',
            daysOnPlatform,
            activationScore,
            conversionReadiness,
            jobPositionsCreated,
            candidatesAdded,
            applicationsReceived,
            hiringProcessesStarted,
            teamMembersInvited,
            hasOutreachRecord: !!prospectRecord,
            prospectCompanyUid: prospectRecord?.uid ?? null,
          };
        }),
      );

      // Sort by activationScore descending (hottest first)
      allItems.sort((a, b) => b.activationScore - a.activationScore);

      // Compute summary from full unfiltered list
      const summary: TrialOverviewSummaryDto = {
        hotCount: allItems.filter((i) => i.conversionReadiness === 'HOT').length,
        warmCount: allItems.filter((i) => i.conversionReadiness === 'WARM').length,
        coldCount: allItems.filter((i) => i.conversionReadiness === 'COLD').length,
      };

      // Apply readiness filter
      let filtered = readiness ? allItems.filter((i) => i.conversionReadiness === readiness) : allItems;

      // Apply plan filter: "FREE" → plan=FREE, "TRIALING" → status=TRIALING
      if (planFilter === 'FREE') {
        filtered = filtered.filter((i) => i.plan === 'FREE');
      } else if (planFilter === 'TRIALING') {
        filtered = filtered.filter((i) => i.subscriptionStatus === 'TRIALING');
      }

      // Paginate
      const total = filtered.length;
      const offset = (page - 1) * limit;
      const paginated = filtered.slice(offset, offset + limit);

      return {
        companies: paginated,
        total,
        page,
        limit,
        summary,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to get trial overview: ${error.message}`);
    }
  }

  private buildResourceUsage(used: number, limit: number): QuotaResourceUsageDto {
    // -1 means unlimited (Enterprise plan)
    if (limit === -1) {
      return { used, limit, percentage: 0 };
    }
    const percentage = limit === 0 ? 0 : parseFloat(((used / limit) * 100).toFixed(2));
    return { used, limit, percentage };
  }

  private computeHealthStatus(resources: QuotaResourceUsageDto[]): 'OK' | 'WARNING' | 'CRITICAL' | 'EXCEEDED' {
    // Filter out unlimited resources (limit === -1)
    const limited = resources.filter((r) => r.limit !== -1);

    if (limited.some((r) => r.percentage >= 100)) return 'EXCEEDED';
    if (limited.some((r) => r.percentage >= 90)) return 'CRITICAL';
    if (limited.some((r) => r.percentage >= 70)) return 'WARNING';
    return 'OK';
  }

  // ─── Subscription Lifecycle Manager ─────────────────────────────────────────

  private async findSubscriptionByCompanyUid(companyUid: string) {
    const company = await this.databaseService.company.findUnique({
      where: { uid: companyUid },
      select: { id: true },
    });
    if (!company) {
      throw new HttpException(`Company not found: ${companyUid}`, 404);
    }
    const subscription = await this.databaseService.subscription.findUnique({
      where: { companyId: company.id },
    });
    if (!subscription) {
      throw new HttpException(`Subscription not found for company: ${companyUid}`, 404);
    }
    return subscription;
  }

  async changePlan(companyUid: string, dto: ChangePlanDto, adminUserId: number): Promise<UpdatedSubscriptionDto> {
    try {
      const subscription = await this.findSubscriptionByCompanyUid(companyUid);
      const previousPlan = subscription.plan;

      const updated = await this.databaseService.subscription.update({
        where: { id: subscription.id },
        data: { plan: dto.plan as any },
      });

      await this.databaseService.auditLog.create({
        data: {
          action: 'PLAN_CHANGE',
          entityType: 'Subscription',
          entityId: subscription.id,
          entityUid: subscription.uid,
          userId: adminUserId,
          metadata: { previousPlan, newPlan: dto.plan, note: dto.note ?? null },
        },
      });

      return {
        uid: updated.uid,
        plan: updated.plan,
        status: updated.status,
        trialEnd: updated.trialEnd,
        currentPeriodStart: updated.currentPeriodStart,
        currentPeriodEnd: updated.currentPeriodEnd,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(`Failed to change plan: ${error.message}`);
    }
  }

  async changeStatus(companyUid: string, dto: ChangeStatusDto, adminUserId: number): Promise<UpdatedSubscriptionDto> {
    try {
      const subscription = await this.findSubscriptionByCompanyUid(companyUid);
      const previousStatus = subscription.status;

      const updated = await this.databaseService.subscription.update({
        where: { id: subscription.id },
        data: { status: dto.status as any },
      });

      await this.databaseService.auditLog.create({
        data: {
          action: 'STATUS_CHANGE',
          entityType: 'Subscription',
          entityId: subscription.id,
          entityUid: subscription.uid,
          userId: adminUserId,
          metadata: { previousStatus, newStatus: dto.status, note: dto.note ?? null },
        },
      });

      return {
        uid: updated.uid,
        plan: updated.plan,
        status: updated.status,
        trialEnd: updated.trialEnd,
        currentPeriodStart: updated.currentPeriodStart,
        currentPeriodEnd: updated.currentPeriodEnd,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(`Failed to change status: ${error.message}`);
    }
  }

  async extendTrial(companyUid: string, dto: ExtendTrialDto, adminUserId: number): Promise<UpdatedSubscriptionDto> {
    try {
      const subscription = await this.findSubscriptionByCompanyUid(companyUid);
      const previousTrialEnd = subscription.trialEnd;
      const baseDate = subscription.trialEnd ? new Date(subscription.trialEnd) : new Date();
      const newTrialEnd = new Date(baseDate.getTime() + dto.days * 24 * 60 * 60 * 1000);

      const updated = await this.databaseService.subscription.update({
        where: { id: subscription.id },
        data: { trialEnd: newTrialEnd },
      });

      await this.databaseService.auditLog.create({
        data: {
          action: 'TRIAL_EXTENDED',
          entityType: 'Subscription',
          entityId: subscription.id,
          entityUid: subscription.uid,
          userId: adminUserId,
          metadata: {
            previousTrialEnd: previousTrialEnd ? previousTrialEnd.toISOString() : null,
            newTrialEnd: newTrialEnd.toISOString(),
            daysAdded: dto.days,
            note: dto.note ?? null,
          },
        },
      });

      return {
        uid: updated.uid,
        plan: updated.plan,
        status: updated.status,
        trialEnd: updated.trialEnd,
        currentPeriodStart: updated.currentPeriodStart,
        currentPeriodEnd: updated.currentPeriodEnd,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(`Failed to extend trial: ${error.message}`);
    }
  }

  async getSubscriptionAuditLog(companyUid: string): Promise<SubscriptionAuditLogItemDto[]> {
    try {
      const subscription = await this.findSubscriptionByCompanyUid(companyUid);

      const logs = await this.databaseService.auditLog.findMany({
        where: {
          entityType: 'Subscription',
          entityUid: subscription.uid,
        },
        orderBy: { timestamp: 'desc' },
        include: {
          user: {
            select: { name: true },
          },
        },
      });

      return logs.map((log) => ({
        uid: log.uid,
        action: log.action,
        timestamp: log.timestamp,
        metadata: log.metadata as Record<string, unknown> | null,
        adminName: log.user.name,
      }));
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(`Failed to get audit log: ${error.message}`);
    }
  }

  // ─── Company Health Monitor ──────────────────────────────────────────────────

  /** Tier ordering, best to worst. Index doubles as the severity rank. */
  private static readonly HEALTH_TIER_ORDER: RiskTier[] = ['HEALTHY', 'AT_RISK', 'CHURNING', 'CRITICAL'];

  /**
   * Rank a tier so two readings can be compared. Higher number == worse health.
   * Returns -1 for an unknown/absent tier so callers can treat it as "no reading".
   */
  static rankHealthTier(tier: RiskTier | string | null | undefined): number {
    return AdminService.HEALTH_TIER_ORDER.indexOf(tier as RiskTier);
  }

  /**
   * Compute the four health signals for EVERY company.
   *
   * Previously this was a `company.findMany()` with no take/skip followed by four
   * awaited queries inside `Promise.all(companies.map(...))` — 1 + 4N round trips, so
   * 801 queries at 200 companies, all executed before pagination threw most of the
   * result away. The nightly snapshot job runs this unattended, which turns that cost
   * from a one-off page load into a recurring one.
   *
   * It is now a fixed handful of queries regardless of company count: one company
   * scan, three `groupBy` aggregates keyed by companyId, and one bounded lookup that
   * maps the job positions which received applications this month back to their owner.
   */
  async collectCompanyHealthSignals(now: Date = new Date()): Promise<CompanyHealthSignalRow[]> {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [companies, loginRows, openPositionRows, applicationRows, hiringRows] = await Promise.all([
      this.databaseService.company.findMany({
        select: {
          id: true,
          uid: true,
          name: true,
          subscription: {
            select: {
              plan: true,
              status: true,
            },
          },
        },
      }),
      // Signal 1: most recent lastLoginAt of any user, per company.
      this.databaseService.user.groupBy({
        by: ['companyId'],
        where: { companyId: { not: null }, lastLoginAt: { not: null } },
        _max: { lastLoginAt: true },
      }),
      // Signal 2: open job positions, per company.
      this.databaseService.jobPosition.groupBy({
        by: ['companyId'],
        where: { status: 'OPEN' },
        _count: { _all: true },
      }),
      // Signal 3 (part 1): applications this month, per job position. Grouping straight
      // to companyId is not possible — Application has no companyId, only a nullable
      // jobPositionId — so ownership is resolved below.
      this.databaseService.application.groupBy({
        by: ['jobPositionId'],
        where: {
          createdAt: { gte: startOfMonth },
          deletedAt: null,
          jobPositionId: { not: null },
        },
        _count: { _all: true },
      }),
      // Signal 4: hiring processes touched this month, per company.
      this.databaseService.hiringProcess.groupBy({
        by: ['companyId'],
        where: { updatedAt: { gte: startOfMonth } },
        _count: { _all: true },
      }),
    ]);

    // Signal 3 (part 2): map the job positions that actually received an application
    // this month back to their company. Bounded by "positions with activity this
    // month", not by the total number of positions in the database.
    const activeJobPositionIds = applicationRows.map((row) => row.jobPositionId).filter((id): id is number => id !== null);

    const jobPositionOwners = activeJobPositionIds.length
      ? await this.databaseService.jobPosition.findMany({
          where: { id: { in: activeJobPositionIds } },
          select: { id: true, companyId: true },
        })
      : [];

    const ownerByJobPositionId = new Map<number, number>(jobPositionOwners.map((jp) => [jp.id, jp.companyId]));

    const lastLoginByCompanyId = new Map<number, Date | null>();
    for (const row of loginRows) {
      if (row.companyId !== null) lastLoginByCompanyId.set(row.companyId, row._max.lastLoginAt);
    }

    const openPositionsByCompanyId = new Map<number, number>();
    for (const row of openPositionRows) {
      openPositionsByCompanyId.set(row.companyId, row._count._all);
    }

    const applicationsByCompanyId = new Map<number, number>();
    for (const row of applicationRows) {
      if (row.jobPositionId === null) continue;
      const companyId = ownerByJobPositionId.get(row.jobPositionId);
      if (companyId === undefined) continue;
      applicationsByCompanyId.set(companyId, (applicationsByCompanyId.get(companyId) ?? 0) + row._count._all);
    }

    const hiringByCompanyId = new Map<number, number>();
    for (const row of hiringRows) {
      hiringByCompanyId.set(row.companyId, row._count._all);
    }

    return companies.map((company) => {
      const lastLoginAt = lastLoginByCompanyId.get(company.id) ?? null;
      const activeJobPositions = openPositionsByCompanyId.get(company.id) ?? 0;
      const applicationsThisMonth = applicationsByCompanyId.get(company.id) ?? 0;
      const hiringActivitiesThisMonth = hiringByCompanyId.get(company.id) ?? 0;

      let lastLoginDaysAgo: number | null = null;
      let loginSignal = 0;
      if (lastLoginAt) {
        lastLoginDaysAgo = Math.floor((now.getTime() - lastLoginAt.getTime()) / (1000 * 60 * 60 * 24));
        if (lastLoginDaysAgo <= 7) loginSignal = 25;
        else if (lastLoginDaysAgo <= 14) loginSignal = 15;
        else if (lastLoginDaysAgo <= 30) loginSignal = 5;
        else loginSignal = 0;
      }

      let jobSignal = 0;
      if (activeJobPositions >= 3) jobSignal = 25;
      else if (activeJobPositions >= 1) jobSignal = 15;

      let appsSignal = 0;
      if (applicationsThisMonth >= 10) appsSignal = 25;
      else if (applicationsThisMonth >= 5) appsSignal = 15;
      else if (applicationsThisMonth >= 1) appsSignal = 5;

      let hiringSignal = 0;
      if (hiringActivitiesThisMonth >= 5) hiringSignal = 25;
      else if (hiringActivitiesThisMonth >= 1) hiringSignal = 10;

      const healthScore = loginSignal + jobSignal + appsSignal + hiringSignal;

      let riskTier: RiskTier;
      if (healthScore >= 80) riskTier = 'HEALTHY';
      else if (healthScore >= 50) riskTier = 'AT_RISK';
      else if (healthScore >= 20) riskTier = 'CHURNING';
      else riskTier = 'CRITICAL';

      return {
        companyId: company.id,
        uid: company.uid,
        name: company.name,
        plan: company.subscription?.plan ?? 'FREE',
        subscriptionStatus: company.subscription?.status ?? 'ACTIVE',
        healthScore,
        riskTier,
        lastLoginDaysAgo,
        activeJobPositions,
        applicationsThisMonth,
        hiringActivitiesThisMonth,
      };
    });
  }

  async getCompanyHealthScores(page: number, limit: number, riskTier?: string): Promise<CompanyHealthResponseDto> {
    try {
      const rows = await this.collectCompanyHealthSignals();

      // Projected field by field rather than spread, so the numeric companyId carried
      // by CompanyHealthSignalRow can never leak into an external payload by accident.
      const allItems: CompanyHealthItemDto[] = rows.map((row) => ({
        uid: row.uid,
        name: row.name,
        plan: row.plan,
        subscriptionStatus: row.subscriptionStatus,
        healthScore: row.healthScore,
        riskTier: row.riskTier,
        lastLoginDaysAgo: row.lastLoginDaysAgo,
        activeJobPositions: row.activeJobPositions,
        applicationsThisMonth: row.applicationsThisMonth,
        hiringActivitiesThisMonth: row.hiringActivitiesThisMonth,
      }));

      // Sort by healthScore ascending (most at-risk first)
      allItems.sort((a, b) => a.healthScore - b.healthScore);

      // Compute summary from full unfiltered list
      const summary: CompanyHealthSummaryDto = {
        healthyCount: allItems.filter((i) => i.riskTier === 'HEALTHY').length,
        atRiskCount: allItems.filter((i) => i.riskTier === 'AT_RISK').length,
        churningCount: allItems.filter((i) => i.riskTier === 'CHURNING').length,
        criticalCount: allItems.filter((i) => i.riskTier === 'CRITICAL').length,
      };

      // Apply optional risk tier filter
      const filtered = riskTier ? allItems.filter((i) => i.riskTier === riskTier) : allItems;

      // Paginate
      const total = filtered.length;
      const offset = (page - 1) * limit;
      const paginated = filtered.slice(offset, offset + limit);

      return {
        companies: paginated,
        total,
        page,
        limit,
        summary,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to get company health scores: ${error.message}`);
    }
  }

  // ─── Demo Booking Manager ─────────────────────────────────────────────────

  async getDemoBookings(page: number, limit: number, outcome?: string): Promise<DemoBookingListResponseDto> {
    try {
      const skip = (page - 1) * limit;
      const whereClause = outcome ? { outcome: outcome as DemoOutcome } : {};

      const [demos, total, summaryData] = await Promise.all([
        this.databaseService.demoBookingToken.findMany({
          where: whereClause,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          include: {
            slots: {
              where: { selectedAt: { not: null } },
              orderBy: { selectedAt: 'asc' },
              take: 1,
            },
          },
        }),
        this.databaseService.demoBookingToken.count({ where: whereClause }),
        this.databaseService.demoBookingToken.groupBy({
          by: ['outcome'],
          _count: { outcome: true },
        }),
      ]);

      const summaryMap: Record<string, number> = {};
      summaryData.forEach((item) => {
        summaryMap[item.outcome] = item._count.outcome;
      });

      const items: DemoBookingAdminItemDto[] = demos.map((demo) => ({
        uid: demo.uid,
        prospectEmail: demo.prospectEmail,
        prospectName: demo.prospectName,
        prospectCompany: demo.prospectCompany,
        scheduledAt: demo.scheduledAt ?? demo.slots[0]?.startTime ?? null,
        outcome: demo.outcome,
        outcomeNotes: demo.outcomeNotes,
        linkedProspectUid: demo.linkedProspectUid,
        createdAt: demo.createdAt,
        usedAt: demo.usedAt,
      }));

      return {
        demos: items,
        total,
        page,
        limit,
        summary: {
          pending: summaryMap['PENDING'] ?? 0,
          completed: summaryMap['COMPLETED'] ?? 0,
          noShow: summaryMap['NO_SHOW'] ?? 0,
          rescheduled: summaryMap['RESCHEDULED'] ?? 0,
          canceled: summaryMap['CANCELED'] ?? 0,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(`Failed to get demo bookings: ${error.message}`);
    }
  }

  async setDemoOutcome(uid: string, dto: SetDemoOutcomeDto): Promise<DemoBookingAdminItemDto> {
    try {
      const existing = await this.databaseService.demoBookingToken.findUnique({ where: { uid } });
      if (!existing) throw new NotFoundException(`Demo booking with uid ${uid} not found`);

      const updated = await this.databaseService.demoBookingToken.update({
        where: { uid },
        data: {
          outcome: dto.outcome as DemoOutcome,
          ...(dto.notes !== undefined ? { outcomeNotes: dto.notes } : {}),
        },
        include: {
          slots: {
            where: { selectedAt: { not: null } },
            orderBy: { selectedAt: 'asc' },
            take: 1,
          },
        },
      });

      return {
        uid: updated.uid,
        prospectEmail: updated.prospectEmail,
        prospectName: updated.prospectName,
        prospectCompany: updated.prospectCompany,
        scheduledAt: updated.scheduledAt ?? updated.slots[0]?.startTime ?? null,
        outcome: updated.outcome,
        outcomeNotes: updated.outcomeNotes,
        linkedProspectUid: updated.linkedProspectUid,
        createdAt: updated.createdAt,
        usedAt: updated.usedAt,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(`Failed to update demo outcome: ${error.message}`);
    }
  }

  async linkDemoProspect(uid: string, dto: LinkDemoProspectDto): Promise<DemoBookingAdminItemDto> {
    try {
      const existing = await this.databaseService.demoBookingToken.findUnique({ where: { uid } });
      if (!existing) throw new NotFoundException(`Demo booking with uid ${uid} not found`);

      const prospect = await this.databaseService.prospectCompany.findUnique({ where: { uid: dto.prospectUid } });
      if (!prospect) throw new NotFoundException(`ProspectCompany with uid ${dto.prospectUid} not found`);

      const updated = await this.databaseService.demoBookingToken.update({
        where: { uid },
        data: { linkedProspectUid: dto.prospectUid },
        include: {
          slots: {
            where: { selectedAt: { not: null } },
            orderBy: { selectedAt: 'asc' },
            take: 1,
          },
        },
      });

      return {
        uid: updated.uid,
        prospectEmail: updated.prospectEmail,
        prospectName: updated.prospectName,
        prospectCompany: updated.prospectCompany,
        scheduledAt: updated.scheduledAt ?? updated.slots[0]?.startTime ?? null,
        outcome: updated.outcome,
        outcomeNotes: updated.outcomeNotes,
        linkedProspectUid: updated.linkedProspectUid,
        createdAt: updated.createdAt,
        usedAt: updated.usedAt,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(`Failed to link prospect to demo: ${error.message}`);
    }
  }

  // ─── Email Deliverability ─────────────────────────────────────────────────

  async getEmailDeliverabilityStats(): Promise<EmailDeliverabilityStatsDto> {
    try {
      const [totalSent, delivered, opened, bounced, spam, failed, recentBouncesRaw] = await Promise.all([
        this.databaseService.emailLog.count(),
        this.databaseService.emailLog.count({ where: { deliveryStatus: 'DELIVERED' } }),
        this.databaseService.emailLog.count({ where: { deliveryStatus: 'OPENED' } }),
        this.databaseService.emailLog.count({ where: { deliveryStatus: 'BOUNCED' } }),
        this.databaseService.emailLog.count({ where: { deliveryStatus: 'SPAM' } }),
        this.databaseService.emailLog.count({ where: { deliveryStatus: 'FAILED' } }),
        this.databaseService.emailLog.findMany({
          where: { deliveryStatus: 'BOUNCED' },
          orderBy: { bouncedAt: 'desc' },
          take: 10,
          select: { uid: true, recipientEmail: true, subject: true, bouncedAt: true, bounceType: true, emailType: true },
        }),
      ]);

      const deliveryRate = totalSent > 0 ? Math.round(((delivered + opened) / totalSent) * 10000) / 100 : 0;
      const openRate = delivered + opened > 0 ? Math.round((opened / (delivered + opened)) * 10000) / 100 : 0;
      const bounceRate = totalSent > 0 ? Math.round((bounced / totalSent) * 10000) / 100 : 0;

      const recentBounces: RecentBounceDto[] = recentBouncesRaw.map((r) => ({
        uid: r.uid,
        recipientEmail: r.recipientEmail,
        subject: r.subject,
        bouncedAt: r.bouncedAt ? r.bouncedAt.toISOString() : null,
        bounceType: r.bounceType,
        emailType: r.emailType,
      }));

      return { totalSent, delivered, opened, bounced, spam, failed, deliveryRate, openRate, bounceRate, recentBounces };
    } catch (error) {
      throw new InternalServerErrorException(`Failed to fetch email deliverability stats: ${error.message}`);
    }
  }

  async getEmailDeliverabilityPerType(): Promise<EmailDeliverabilityPerTypeDto> {
    try {
      const rows = await this.databaseService.emailLog.groupBy({
        by: ['emailType', 'deliveryStatus'],
        _count: { _all: true },
      });

      // Aggregate by emailType
      const typeMap = new Map<string, { total: number; delivered: number; opened: number; bounced: number }>();

      for (const row of rows) {
        const entry = typeMap.get(row.emailType) ?? { total: 0, delivered: 0, opened: 0, bounced: 0 };
        entry.total += row._count._all;

        if (row.deliveryStatus === 'DELIVERED') entry.delivered += row._count._all;
        else if (row.deliveryStatus === 'OPENED') entry.opened += row._count._all;
        else if (row.deliveryStatus === 'BOUNCED') entry.bounced += row._count._all;

        typeMap.set(row.emailType, entry);
      }

      const perType: EmailDeliverabilityPerTypeItemDto[] = Array.from(typeMap.entries())
        .map(([emailType, stats]) => ({
          emailType,
          total: stats.total,
          delivered: stats.delivered,
          opened: stats.opened,
          bounced: stats.bounced,
          bounceRate: stats.total > 0 ? Math.round((stats.bounced / stats.total) * 10000) / 100 : 0,
        }))
        .sort((a, b) => b.bounceRate - a.bounceRate);

      return { perType };
    } catch (error) {
      throw new InternalServerErrorException(`Failed to fetch email deliverability per type: ${error.message}`);
    }
  }

  // ─── Pipeline Analytics ─────────────────────────────────────────────────────

  async getPipelineAnalytics(): Promise<PipelineAnalyticsResponseDto> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

      const [
        totalApplications,
        applicationsThisMonth,
        applicationsLastMonth,
        totalInterviews,
        interviewsThisMonth,
        openPositions,
        totalPositions,
        closedProcesses,
        totalActiveCompanies,
        applicationsBySource,
        monthlyApplicationsRaw,
      ] = await Promise.all([
        this.databaseService.application.count({ where: { deletedAt: null } }),
        this.databaseService.application.count({ where: { deletedAt: null, createdAt: { gte: startOfMonth } } }),
        this.databaseService.application.count({ where: { deletedAt: null, createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
        this.databaseService.interview.count({ where: { deletedAt: null } }),
        this.databaseService.interview.count({ where: { deletedAt: null, createdAt: { gte: startOfMonth } } }),
        this.databaseService.jobPosition.count({ where: { status: 'OPEN' } }),
        this.databaseService.jobPosition.count(),
        this.databaseService.hiringProcess.findMany({ where: { status: 'CLOSED' }, select: { createdAt: true, updatedAt: true } }),
        this.databaseService.company.count({ where: { subscription: { status: { in: ['ACTIVE', 'TRIALING'] } } } }),
        this.databaseService.application.groupBy({ by: ['applicationSource'], _count: { id: true }, where: { deletedAt: null } }),
        this.databaseService.application.findMany({
          where: { deletedAt: null, createdAt: { gte: sixMonthsAgo } },
          select: { createdAt: true },
          orderBy: { createdAt: 'asc' },
        }),
      ]);

      // Average time to hire in days
      let avgTimeToHireDays = 0;
      if (closedProcesses.length > 0) {
        const totalDays = closedProcesses.reduce((sum, p) => {
          const diffMs = p.updatedAt.getTime() - p.createdAt.getTime();
          return sum + diffMs / (1000 * 60 * 60 * 24);
        }, 0);
        avgTimeToHireDays = Math.round(totalDays / closedProcesses.length);
      }

      // Conversion rate: closed processes / total positions
      const conversionRate = parseFloat(((closedProcesses.length / Math.max(totalPositions, 1)) * 100).toFixed(1));

      // Month-over-month growth for applications
      const applicationsLastMonthGrowth = parseFloat((((applicationsThisMonth - applicationsLastMonth) / Math.max(applicationsLastMonth, 1)) * 100).toFixed(1));

      // Build monthly applications map for last 6 months (fill missing with 0)
      const monthlyMap: Record<string, number> = {};
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthlyMap[key] = 0;
      }
      monthlyApplicationsRaw.forEach((app) => {
        const d = app.createdAt;
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (key in monthlyMap) {
          monthlyMap[key] = (monthlyMap[key] ?? 0) + 1;
        }
      });
      const monthlyApplications: MonthlyApplicationItemDto[] = Object.entries(monthlyMap).map(([month, count]) => ({ month, count }));

      // Application sources sorted by count desc
      const applicationSources: ApplicationSourceItemDto[] = applicationsBySource
        .map((g) => ({ source: g.applicationSource, count: g._count.id }))
        .sort((a, b) => b.count - a.count);

      const platformStats: PlatformStatsDto = {
        totalApplications,
        applicationsThisMonth,
        applicationsLastMonthGrowth,
        totalInterviews,
        interviewsThisMonth,
        openPositions,
        totalPositions,
        closedPositions: totalPositions - openPositions,
        avgTimeToHireDays,
        conversionRate,
        totalActiveCompanies,
      };

      return { platformStats, monthlyApplications, applicationSources };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(`Failed to get pipeline analytics: ${error.message}`);
    }
  }

  // ─── Release Notes ───────────────────────────────────────────────────────────

  async getReleaseNotes(page: number, limit: number, published?: string): Promise<ReleaseNoteListResponseDto> {
    try {
      const skip = (page - 1) * limit;
      const where: Record<string, unknown> = {};

      if (published === 'true') where.isPublished = true;
      else if (published === 'false') where.isPublished = false;

      const [notes, total] = await Promise.all([
        this.databaseService.releaseNote.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          include: { _count: { select: { seenBy: true } } },
        }),
        this.databaseService.releaseNote.count({ where }),
      ]);

      return {
        notes: notes.map((n) => ({
          uid: n.uid,
          title: n.title,
          body: n.body,
          version: n.version ?? null,
          targetTier: n.targetTier,
          isPublished: n.isPublished,
          publishedAt: n.publishedAt ?? null,
          createdAt: n.createdAt,
          seenCount: n._count.seenBy,
        })),
        total,
        page,
        limit,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(`Failed to get release notes: ${error.message}`);
    }
  }

  async createReleaseNote(dto: CreateReleaseNoteDto): Promise<ReleaseNoteAdminItemDto> {
    try {
      const note = await this.databaseService.releaseNote.create({
        data: {
          title: dto.title,
          body: dto.body,
          version: dto.version ?? null,
          targetTier: dto.targetTier ?? 'all',
          isPublished: dto.isPublished ?? false,
          publishedAt: dto.isPublished ? new Date() : null,
        },
        include: { _count: { select: { seenBy: true } } },
      });

      return {
        uid: note.uid,
        title: note.title,
        body: note.body,
        version: note.version ?? null,
        targetTier: note.targetTier,
        isPublished: note.isPublished,
        publishedAt: note.publishedAt ?? null,
        createdAt: note.createdAt,
        seenCount: note._count.seenBy,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(`Failed to create release note: ${error.message}`);
    }
  }

  async updateReleaseNote(uid: string, dto: UpdateReleaseNoteDto): Promise<ReleaseNoteAdminItemDto> {
    try {
      const existing = await this.databaseService.releaseNote.findUnique({ where: { uid } });
      if (!existing) throw new NotFoundException(`Release note not found: ${uid}`);

      const data: Record<string, unknown> = {};
      if (dto.title !== undefined) data.title = dto.title;
      if (dto.body !== undefined) data.body = dto.body;
      if (dto.version !== undefined) data.version = dto.version;
      if (dto.targetTier !== undefined) data.targetTier = dto.targetTier;
      if (dto.isPublished !== undefined) {
        data.isPublished = dto.isPublished;
        if (dto.isPublished && !existing.publishedAt) {
          data.publishedAt = new Date();
        } else if (!dto.isPublished) {
          data.publishedAt = null;
        }
      }

      const note = await this.databaseService.releaseNote.update({
        where: { uid },
        data,
        include: { _count: { select: { seenBy: true } } },
      });

      return {
        uid: note.uid,
        title: note.title,
        body: note.body,
        version: note.version ?? null,
        targetTier: note.targetTier,
        isPublished: note.isPublished,
        publishedAt: note.publishedAt ?? null,
        createdAt: note.createdAt,
        seenCount: note._count.seenBy,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(`Failed to update release note: ${error.message}`);
    }
  }

  async togglePublishReleaseNote(uid: string): Promise<ReleaseNoteAdminItemDto> {
    try {
      const existing = await this.databaseService.releaseNote.findUnique({ where: { uid } });
      if (!existing) throw new NotFoundException(`Release note not found: ${uid}`);

      const newPublished = !existing.isPublished;
      const note = await this.databaseService.releaseNote.update({
        where: { uid },
        data: {
          isPublished: newPublished,
          publishedAt: newPublished ? (existing.publishedAt ?? new Date()) : null,
        },
        include: { _count: { select: { seenBy: true } } },
      });

      return {
        uid: note.uid,
        title: note.title,
        body: note.body,
        version: note.version ?? null,
        targetTier: note.targetTier,
        isPublished: note.isPublished,
        publishedAt: note.publishedAt ?? null,
        createdAt: note.createdAt,
        seenCount: note._count.seenBy,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(`Failed to toggle release note publish: ${error.message}`);
    }
  }

  async deleteReleaseNote(uid: string): Promise<void> {
    try {
      const existing = await this.databaseService.releaseNote.findUnique({ where: { uid } });
      if (!existing) throw new NotFoundException(`Release note not found: ${uid}`);
      await this.databaseService.releaseNote.delete({ where: { uid } });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(`Failed to delete release note: ${error.message}`);
    }
  }

  // ─── Outreach Template Overrides ─────────────────────────────────────────────

  async getOutreachTemplateOverrides(): Promise<OutreachTemplateOverrideDto[]> {
    try {
      const overrides = await this.databaseService.outreachTemplateOverride.findMany();
      return overrides.map((o) => ({
        templateId: o.templateId,
        lang: o.lang,
        variantIndex: o.variantIndex,
        subject: o.subject ?? undefined,
        body: o.body,
      }));
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(`Failed to get outreach template overrides: ${error.message}`);
    }
  }

  async upsertOutreachTemplateOverride(dto: UpsertOutreachTemplateDto): Promise<OutreachTemplateOverrideDto> {
    try {
      const override = await this.databaseService.outreachTemplateOverride.upsert({
        where: { templateId_lang_variantIndex: { templateId: dto.templateId, lang: dto.lang, variantIndex: dto.variantIndex } },
        create: { templateId: dto.templateId, lang: dto.lang, variantIndex: dto.variantIndex, subject: dto.subject, body: dto.body },
        update: { subject: dto.subject, body: dto.body },
      });
      return {
        templateId: override.templateId,
        lang: override.lang,
        variantIndex: override.variantIndex,
        subject: override.subject ?? undefined,
        body: override.body,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(`Failed to upsert outreach template override: ${error.message}`);
    }
  }

  async deleteOutreachTemplateOverride(templateId: number, lang: string, variantIndex: number): Promise<void> {
    try {
      await this.databaseService.outreachTemplateOverride.deleteMany({
        where: { templateId, lang, variantIndex },
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(`Failed to delete outreach template override: ${error.message}`);
    }
  }
}
