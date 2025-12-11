import { Injectable } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { DatabaseService } from '../shared/modules/database/database.service';

@Injectable()
export class BusinessMetricsService {
  constructor(
    private readonly metricsService: MetricsService,
    private readonly databaseService: DatabaseService,
  ) {}

  /**
   * Update all business metrics by querying the database
   */
  async updateAllMetrics(): Promise<void> {
    await Promise.all([
      this.updateApplicationMetrics(),
      this.updateJobPositionMetrics(),
      this.updateCandidateMetrics(),
      this.updateInterviewMetrics(),
      this.updateActiveUserMetrics(),
      this.updateDatabaseMetrics(),
    ]);
  }

  /**
   * Update application metrics
   */
  private async updateApplicationMetrics(): Promise<void> {
    try {
      const applications: any = await this.databaseService.application.groupBy({
        by: ['status'],
        _count: true,
      });

      for (const app of applications) {
        this.metricsService.updateApplicationsCount(app.status, app._count);
      }
    } catch (error) {
      console.error('Error updating application metrics:', error);
    }
  }

  /**
   * Update job position metrics
   */
  private async updateJobPositionMetrics(): Promise<void> {
    try {
      const jobPositions: any = await this.databaseService.jobPosition.groupBy({
        by: ['status'],
        _count: true,
      });

      for (const job of jobPositions) {
        this.metricsService.updateJobPositionsCount(job.status, job._count);
      }
    } catch (error) {
      console.error('Error updating job position metrics:', error);
    }
  }

  /**
   * Update candidate metrics
   */
  private async updateCandidateMetrics(): Promise<void> {
    try {
      const count = await this.databaseService.candidate.count();
      this.metricsService.updateCandidatesCount(count);
    } catch (error) {
      console.error('Error updating candidate metrics:', error);
    }
  }

  /**
   * Update interview metrics
   */
  private async updateInterviewMetrics(): Promise<void> {
    try {
      const interviews: any = await this.databaseService.interview.groupBy({
        by: ['status'],
        _count: true,
      });

      for (const interview of interviews) {
        this.metricsService.updateInterviewsCount(interview.status, interview._count);
      }
    } catch (error) {
      console.error('Error updating interview metrics:', error);
    }
  }

  /**
   * Update active user metrics
   */
  private async updateActiveUserMetrics(): Promise<void> {
    try {
      // Count total active users instead of grouping by role (roles is an array field)
      const activeUserCount = await this.databaseService.user.count({
        where: {
          isActive: true,
        },
      });

      this.metricsService.updateActiveUsersCount('all', activeUserCount);
    } catch (error) {
      console.error('Error updating active user metrics:', error);
    }
  }

  /**
   * Update database connection metrics
   */
  private async updateDatabaseMetrics(): Promise<void> {
    try {
      const poolStats = await this.databaseService.getConnectionPoolStats();
      this.metricsService.recordDbConnections(poolStats.active, poolStats.idle);
    } catch (error) {
      console.error('Error updating database metrics:', error);
    }
  }

  /**
   * Get business metrics summary in a readable format
   */
  async getBusinessMetricsSummary() {
    await this.updateAllMetrics();

    const [applications, jobPositions, candidates, interviews, users]: [any, any, number, any, any] = await Promise.all([
      this.databaseService.application.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.databaseService.jobPosition.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.databaseService.candidate.count(),
      this.databaseService.interview.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.databaseService.user.count({
        where: { isActive: true },
      }),
    ]);

    return {
      timestamp: new Date().toISOString(),
      applications: {
        total: applications.reduce((sum: number, app: any) => sum + app._count, 0),
        byStatus: applications.reduce(
          (acc: Record<string, number>, app: any) => {
            acc[app.status] = app._count;
            return acc;
          },
          {} as Record<string, number>,
        ),
      },
      jobPositions: {
        total: jobPositions.reduce((sum: number, job: any) => sum + job._count, 0),
        byStatus: jobPositions.reduce(
          (acc: Record<string, number>, job: any) => {
            acc[job.status] = job._count;
            return acc;
          },
          {} as Record<string, number>,
        ),
      },
      candidates,
      interviews: {
        total: interviews.reduce((sum: number, interview: any) => sum + interview._count, 0),
        byStatus: interviews.reduce(
          (acc: Record<string, number>, interview: any) => {
            acc[interview.status] = interview._count;
            return acc;
          },
          {} as Record<string, number>,
        ),
      },
      activeUsers: {
        total: users as number,
      },
    };
  }
}
