import { Injectable, InternalServerErrorException, HttpException } from '@nestjs/common';
import { DatabaseService } from '../shared/modules/database/database.service';
import { AdminStatsResponseDto, UserStatsResponseDto, CompanyStatsResponseDto, RecentActivityResponseDto, UsersByRoleDto, RecentLoginDto } from './dto/admin-stats.dto';

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
