import { Injectable, NotFoundException, InternalServerErrorException, HttpException } from '@nestjs/common';
import { DatabaseService } from '../shared/modules/database/database.service';
import {
  TimeMetricsDto,
  ConversionMetricsDto,
  VolumeMetricsDto,
  OverviewMetricsDto,
  SourceAnalyticsDto,
  DateRangeQueryDto,
} from './dto/analytics.dto';
import { User, HiringProcessStatus, ApplicationSource, StageStatus } from '@prisma/client';
import { getUserCompanyId } from 'src/utils/company-access.helper';

@Injectable()
export class AnalyticsService {
  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Get date range with defaults (last 30 days if not specified)
   */
  private getDateRange(queryDto: DateRangeQueryDto): { startDate: Date; endDate: Date } {
    const endDate = queryDto.endDate ? new Date(queryDto.endDate) : new Date();
    const startDate = queryDto.startDate
      ? new Date(queryDto.startDate)
      : new Date(new Date().setDate(endDate.getDate() - 30));

    return { startDate, endDate };
  }

  /**
   * Get company ID for filtering (respects user role)
   */
  private async getCompanyIdForFilter(queryDto: DateRangeQueryDto, user: User): Promise<number | null> {
    // If companyUid is provided and user is SUPER_ADMIN, use it
    if (queryDto.companyUid && user.roles.includes('SUPER_ADMIN')) {
      const company = await this.databaseService.company.findUnique({
        where: { uid: queryDto.companyUid },
      });
      if (!company) {
        throw new NotFoundException(`Company ${queryDto.companyUid} not found`);
      }
      return company.id;
    }

    // Otherwise, use user's company (null for SUPER_ADMIN without filter)
    return getUserCompanyId(user);
  }

  /**
   * Calculate time metrics
   */
  async getTimeMetrics(queryDto: DateRangeQueryDto, user: User): Promise<TimeMetricsDto> {
    try {
      const { startDate, endDate } = this.getDateRange(queryDto);
      const companyId = await this.getCompanyIdForFilter(queryDto, user);

      const where: any = {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      };

      if (companyId !== null) {
        where.companyId = companyId;
      }

      // Get all hiring processes in date range
      const hiringProcesses = await this.databaseService.hiringProcess.findMany({
        where,
        include: {
          stages: {
            orderBy: { position: 'asc' },
          },
        },
      });

      // Calculate average time to hire (for CLOSED/completed processes)
      const completedProcesses = hiringProcesses.filter((hp) => hp.status === HiringProcessStatus.CLOSED);
      const timeToHireValues = completedProcesses.map((hp) => {
        const days = Math.floor((hp.updatedAt.getTime() - hp.createdAt.getTime()) / (1000 * 60 * 60 * 24));
        return days;
      });
      const averageTimeToHire =
        timeToHireValues.length > 0 ? timeToHireValues.reduce((a, b) => a + b, 0) / timeToHireValues.length : 0;

      // Calculate time to first interview
      const processesWithInterviews = hiringProcesses.filter((hp) => hp.stages.length > 0);
      const timeToFirstInterviewValues = processesWithInterviews.map((hp) => {
        const firstStage = hp.stages[0];
        if (!firstStage) return 0;
        const days = Math.floor((firstStage.createdAt.getTime() - hp.createdAt.getTime()) / (1000 * 60 * 60 * 24));
        return days;
      });
      const timeToFirstInterview =
        timeToFirstInterviewValues.length > 0
          ? timeToFirstInterviewValues.reduce((a, b) => a + b, 0) / timeToFirstInterviewValues.length
          : 0;

      // Calculate average time per stage type
      const stagesByType: Record<string, number[]> = {};
      hiringProcesses.forEach((hp) => {
        hp.stages.forEach((stage) => {
          if (stage.status === StageStatus.DONE) {
            const days = Math.floor((stage.updatedAt.getTime() - stage.createdAt.getTime()) / (1000 * 60 * 60 * 24));
            if (!stagesByType[stage.type]) {
              stagesByType[stage.type] = [];
            }
            stagesByType[stage.type].push(days);
          }
        });
      });

      const averageTimePerStage: Record<string, number> = {};
      Object.keys(stagesByType).forEach((type) => {
        const times = stagesByType[type];
        averageTimePerStage[type] = times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
      });

      return {
        averageTimeToHire: Math.round(averageTimeToHire * 10) / 10,
        timeToFirstInterview: Math.round(timeToFirstInterview * 10) / 10,
        averageTimePerStage: Object.keys(averageTimePerStage).reduce((acc, key) => {
          acc[key] = Math.round(averageTimePerStage[key] * 10) / 10;
          return acc;
        }, {} as Record<string, number>),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to calculate time metrics: ${error.message}`);
    }
  }

  /**
   * Calculate conversion metrics
   */
  async getConversionMetrics(queryDto: DateRangeQueryDto, user: User): Promise<ConversionMetricsDto> {
    try {
      const { startDate, endDate } = this.getDateRange(queryDto);
      const companyId = await this.getCompanyIdForFilter(queryDto, user);

      const where: any = {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      };

      if (companyId !== null) {
        where.companyId = companyId;
      }

      // Get all hiring processes in date range
      const hiringProcesses = await this.databaseService.hiringProcess.findMany({
        where,
        include: {
          stages: {
            orderBy: { position: 'asc' },
          },
        },
      });

      const totalApplications = hiringProcesses.length;

      if (totalApplications === 0) {
        return {
          applicationToScreeningRate: 0,
          screeningToInterviewRate: 0,
          interviewToOfferRate: 0,
          offerToHiredRate: 0,
          overallConversionRate: 0,
        };
      }

      // Count processes that reached each stage
      const reachedScreening = hiringProcesses.filter((hp) => hp.stages.length > 0).length;
      const reachedInterview = hiringProcesses.filter((hp) =>
        hp.stages.some((s) => s.type === 'INTERVIEW' || s.type === 'TECHNICAL_INTERVIEW'),
      ).length;
      const reachedOffer = hiringProcesses.filter((hp) => hp.stages.some((s) => s.type === 'OFFER')).length;
      const hired = hiringProcesses.filter((hp) => hp.status === HiringProcessStatus.CLOSED).length;

      // Calculate conversion rates
      const applicationToScreeningRate = (reachedScreening / totalApplications) * 100;
      const screeningToInterviewRate = reachedScreening > 0 ? (reachedInterview / reachedScreening) * 100 : 0;
      const interviewToOfferRate = reachedInterview > 0 ? (reachedOffer / reachedInterview) * 100 : 0;
      const offerToHiredRate = reachedOffer > 0 ? (hired / reachedOffer) * 100 : 0;
      const overallConversionRate = (hired / totalApplications) * 100;

      return {
        applicationToScreeningRate: Math.round(applicationToScreeningRate * 10) / 10,
        screeningToInterviewRate: Math.round(screeningToInterviewRate * 10) / 10,
        interviewToOfferRate: Math.round(interviewToOfferRate * 10) / 10,
        offerToHiredRate: Math.round(offerToHiredRate * 10) / 10,
        overallConversionRate: Math.round(overallConversionRate * 10) / 10,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to calculate conversion metrics: ${error.message}`);
    }
  }

  /**
   * Calculate volume metrics
   */
  async getVolumeMetrics(queryDto: DateRangeQueryDto, user: User): Promise<VolumeMetricsDto> {
    try {
      const { startDate, endDate } = this.getDateRange(queryDto);
      const companyId = await this.getCompanyIdForFilter(queryDto, user);

      const where: any = {};
      if (companyId !== null) {
        where.companyId = companyId;
      }

      // Total applications this month (current month)
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      const totalApplicationsThisMonth = await this.databaseService.hiringProcess.count({
        where: {
          ...where,
          createdAt: {
            gte: firstDayOfMonth,
            lte: lastDayOfMonth,
          },
        },
      });

      // Total hired this month
      const totalHiredThisMonth = await this.databaseService.hiringProcess.count({
        where: {
          ...where,
          status: HiringProcessStatus.CLOSED,
          updatedAt: {
            gte: firstDayOfMonth,
            lte: lastDayOfMonth,
          },
        },
      });

      // Total active processes (IN_PROGRESS or OPEN)
      const totalActiveProcesses = await this.databaseService.hiringProcess.count({
        where: {
          ...where,
          status: {
            in: [HiringProcessStatus.OPEN, HiringProcessStatus.IN_PROGRESS],
          },
        },
      });

      // Candidates by source (in the specified date range)
      const candidates = await this.databaseService.candidate.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          source: true,
        },
      });

      const candidatesBySource: Record<string, number> = {};
      candidates.forEach((candidate) => {
        const source = candidate.source || 'OTHER';
        candidatesBySource[source] = (candidatesBySource[source] || 0) + 1;
      });

      return {
        totalApplicationsThisMonth,
        totalHiredThisMonth,
        totalActiveProcesses,
        candidatesBySource,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to calculate volume metrics: ${error.message}`);
    }
  }

  /**
   * Get overview of all metrics
   */
  async getOverviewMetrics(queryDto: DateRangeQueryDto, user: User): Promise<OverviewMetricsDto> {
    try {
      const { startDate, endDate } = this.getDateRange(queryDto);

      const [timeMetrics, conversionMetrics, volumeMetrics] = await Promise.all([
        this.getTimeMetrics(queryDto, user),
        this.getConversionMetrics(queryDto, user),
        this.getVolumeMetrics(queryDto, user),
      ]);

      return {
        timeMetrics,
        conversionMetrics,
        volumeMetrics,
        dateRange: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to get overview metrics: ${error.message}`);
    }
  }

  /**
   * Get source analytics (breakdown by source with conversion rates)
   */
  async getSourceAnalytics(queryDto: DateRangeQueryDto, user: User): Promise<SourceAnalyticsDto[]> {
    try {
      const { startDate, endDate } = this.getDateRange(queryDto);
      const companyId = await this.getCompanyIdForFilter(queryDto, user);

      // Get all candidates in date range
      const candidates = await this.databaseService.candidate.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          hiringProcesses: {
            where: companyId !== null ? { companyId } : {},
            include: {
              stages: true,
            },
          },
        },
      });

      // Group by source
      const sourceMap: Record<
        string,
        {
          count: number;
          hiredCount: number;
          totalTimeToHire: number;
          hiredProcesses: number;
        }
      > = {};

      candidates.forEach((candidate) => {
        const source = candidate.source || ApplicationSource.OTHER;

        if (!sourceMap[source]) {
          sourceMap[source] = {
            count: 0,
            hiredCount: 0,
            totalTimeToHire: 0,
            hiredProcesses: 0,
          };
        }

        sourceMap[source].count += 1;

        // Check if any hiring process for this candidate was closed (hired)
        const hiredProcesses = candidate.hiringProcesses.filter((hp) => hp.status === HiringProcessStatus.CLOSED);
        if (hiredProcesses.length > 0) {
          sourceMap[source].hiredCount += 1;

          // Calculate time to hire for closed processes
          hiredProcesses.forEach((hp) => {
            const days = Math.floor((hp.updatedAt.getTime() - hp.createdAt.getTime()) / (1000 * 60 * 60 * 24));
            sourceMap[source].totalTimeToHire += days;
            sourceMap[source].hiredProcesses += 1;
          });
        }
      });

      // Convert to DTO array
      const result: SourceAnalyticsDto[] = Object.entries(sourceMap).map(([source, data]) => {
        const conversionRate = data.count > 0 ? (data.hiredCount / data.count) * 100 : 0;
        const averageTimeToHire =
          data.hiredProcesses > 0 ? data.totalTimeToHire / data.hiredProcesses : 0;

        return {
          source,
          count: data.count,
          conversionRate: Math.round(conversionRate * 10) / 10,
          averageTimeToHire: Math.round(averageTimeToHire * 10) / 10,
        };
      });

      // Sort by count descending
      return result.sort((a, b) => b.count - a.count);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to get source analytics: ${error.message}`);
    }
  }
}
