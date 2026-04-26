import { Injectable, InternalServerErrorException, HttpException } from '@nestjs/common';
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
} from './dto/admin-stats.dto';

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
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
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
}
