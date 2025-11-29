import { Injectable, NotFoundException, InternalServerErrorException, HttpException } from '@nestjs/common';
import { DatabaseService } from '../shared/modules/database/database.service';
import {
  TimeMetricsDto,
  ConversionMetricsDto,
  VolumeMetricsDto,
  OverviewMetricsDto,
  SourceAnalyticsDto,
  DateRangeQueryDto,
  PipelineFunnelDto,
  PipelineStageDto,
  TimeToHireDto,
  TimeToHireTrendDto,
  SourceEffectivenessDto,
  StageDurationDto,
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
    const startDate = queryDto.startDate ? new Date(queryDto.startDate) : new Date(new Date().setDate(endDate.getDate() - 30));

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
      const averageTimeToHire = timeToHireValues.length > 0 ? timeToHireValues.reduce((a, b) => a + b, 0) / timeToHireValues.length : 0;

      // Calculate time to first interview
      const processesWithInterviews = hiringProcesses.filter((hp) => hp.stages.length > 0);
      const timeToFirstInterviewValues = processesWithInterviews.map((hp) => {
        const firstStage = hp.stages[0];
        if (!firstStage) return 0;
        const days = Math.floor((firstStage.createdAt.getTime() - hp.createdAt.getTime()) / (1000 * 60 * 60 * 24));
        return days;
      });
      const timeToFirstInterview = timeToFirstInterviewValues.length > 0 ? timeToFirstInterviewValues.reduce((a, b) => a + b, 0) / timeToFirstInterviewValues.length : 0;

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
        averageTimePerStage: Object.keys(averageTimePerStage).reduce(
          (acc, key) => {
            acc[key] = Math.round(averageTimePerStage[key] * 10) / 10;
            return acc;
          },
          {} as Record<string, number>,
        ),
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
      const reachedInterview = hiringProcesses.filter((hp) => hp.stages.some((s) => s.type === 'INTERVIEW' || s.type === 'TECHNICAL_INTERVIEW')).length;
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
        const averageTimeToHire = data.hiredProcesses > 0 ? data.totalTimeToHire / data.hiredProcesses : 0;

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

  /**
   * Get pipeline funnel data with conversion rates
   */
  async getPipelineFunnel(queryDto: DateRangeQueryDto, user: User): Promise<PipelineFunnelDto> {
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
          stages: [],
          overallConversionRate: 0,
          totalApplications: 0,
          totalHires: 0,
          dateRange: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          },
        };
      }

      // Define pipeline stages
      const pipelineStages = [
        { name: 'Application', key: 'application' },
        { name: 'Screening', key: 'screening' },
        { name: 'Interview', key: 'interview' },
        { name: 'Technical Interview', key: 'technical' },
        { name: 'Final Interview', key: 'final' },
        { name: 'Offer', key: 'offer' },
        { name: 'Hired', key: 'hired' },
      ];

      // Count candidates at each stage
      const stageCounts = {
        application: totalApplications,
        screening: hiringProcesses.filter((hp) => hp.stages.length > 0).length,
        interview: hiringProcesses.filter((hp) => hp.stages.some((s) => s.type === 'INTERVIEW')).length,
        technical: hiringProcesses.filter((hp) => hp.stages.some((s) => s.type === 'TECHNICAL_INTERVIEW')).length,
        final: hiringProcesses.filter((hp) => hp.stages.some((s) => s.type === 'FINAL_INTERVIEW')).length,
        offer: hiringProcesses.filter((hp) => hp.stages.some((s) => s.type === 'OFFER')).length,
        hired: hiringProcesses.filter((hp) => hp.status === HiringProcessStatus.CLOSED).length,
      };

      // Calculate conversion and drop-off rates
      const stages: PipelineStageDto[] = pipelineStages.map((stage, index) => {
        const count = stageCounts[stage.key] || 0;
        const previousCount = index > 0 ? stageCounts[pipelineStages[index - 1].key] || 0 : totalApplications;

        const conversionRate = previousCount > 0 ? (count / previousCount) * 100 : 0;
        const dropOffRate = 100 - conversionRate;

        return {
          stage: stage.name,
          count,
          conversionRate: Math.round(conversionRate * 10) / 10,
          dropOffRate: Math.round(dropOffRate * 10) / 10,
        };
      });

      const totalHires = stageCounts.hired;
      const overallConversionRate = totalApplications > 0 ? (totalHires / totalApplications) * 100 : 0;

      return {
        stages,
        overallConversionRate: Math.round(overallConversionRate * 10) / 10,
        totalApplications,
        totalHires,
        dateRange: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to get pipeline funnel: ${error.message}`);
    }
  }

  /**
   * Get time-to-hire metrics with trend data
   */
  async getTimeToHireAnalytics(queryDto: DateRangeQueryDto, user: User): Promise<TimeToHireDto> {
    try {
      const { startDate, endDate } = this.getDateRange(queryDto);
      const companyId = await this.getCompanyIdForFilter(queryDto, user);

      const where: any = {
        status: HiringProcessStatus.CLOSED,
        updatedAt: {
          gte: startDate,
          lte: endDate,
        },
      };

      if (companyId !== null) {
        where.companyId = companyId;
      }

      // Get all closed/hired processes in date range
      const hiredProcesses = await this.databaseService.hiringProcess.findMany({
        where,
        orderBy: { updatedAt: 'asc' },
      });

      if (hiredProcesses.length === 0) {
        return {
          current: 0,
          previous: 0,
          percentageChange: 0,
          trend: [],
          median: 0,
          fastest: 0,
          slowest: 0,
          dateRange: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          },
        };
      }

      // Calculate time to hire for each process
      const timeToHireValues = hiredProcesses.map((hp) => {
        const days = Math.floor((hp.updatedAt.getTime() - hp.createdAt.getTime()) / (1000 * 60 * 60 * 24));
        return { days, updatedAt: hp.updatedAt };
      });

      // Current average
      const current = timeToHireValues.reduce((sum, val) => sum + val.days, 0) / timeToHireValues.length;

      // Previous period (same duration before startDate)
      const periodDuration = endDate.getTime() - startDate.getTime();
      const previousStartDate = new Date(startDate.getTime() - periodDuration);
      const previousEndDate = new Date(startDate);

      const previousWhere = { ...where, updatedAt: { gte: previousStartDate, lte: previousEndDate } };
      const previousHiredProcesses = await this.databaseService.hiringProcess.findMany({
        where: previousWhere,
      });

      const previousTimeToHire =
        previousHiredProcesses.length > 0
          ? previousHiredProcesses.reduce((sum, hp) => {
              return sum + Math.floor((hp.updatedAt.getTime() - hp.createdAt.getTime()) / (1000 * 60 * 60 * 24));
            }, 0) / previousHiredProcesses.length
          : 0;

      const percentageChange = previousTimeToHire > 0 ? ((current - previousTimeToHire) / previousTimeToHire) * 100 : 0;

      // Median
      const sortedTimes = [...timeToHireValues].map((v) => v.days).sort((a, b) => a - b);
      const median =
        sortedTimes.length % 2 === 0 ? (sortedTimes[sortedTimes.length / 2 - 1] + sortedTimes[sortedTimes.length / 2]) / 2 : sortedTimes[Math.floor(sortedTimes.length / 2)];

      // Fastest and slowest
      const fastest = Math.min(...sortedTimes);
      const slowest = Math.max(...sortedTimes);

      // Trend data (monthly breakdown)
      const trendMap = new Map<string, { total: number; count: number }>();
      timeToHireValues.forEach((val) => {
        const period = `${val.updatedAt.getFullYear()}-${String(val.updatedAt.getMonth() + 1).padStart(2, '0')}`;
        const existing = trendMap.get(period) || { total: 0, count: 0 };
        trendMap.set(period, {
          total: existing.total + val.days,
          count: existing.count + 1,
        });
      });

      const trend: TimeToHireTrendDto[] = Array.from(trendMap.entries())
        .map(([period, data]) => ({
          period,
          averageTimeToHire: Math.round((data.total / data.count) * 10) / 10,
          hiresCount: data.count,
        }))
        .sort((a, b) => a.period.localeCompare(b.period));

      return {
        current: Math.round(current * 10) / 10,
        previous: Math.round(previousTimeToHire * 10) / 10,
        percentageChange: Math.round(percentageChange * 10) / 10,
        trend,
        median: Math.round(median * 10) / 10,
        fastest: Math.round(fastest * 10) / 10,
        slowest: Math.round(slowest * 10) / 10,
        dateRange: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to get time to hire analytics: ${error.message}`);
    }
  }

  /**
   * Get source effectiveness with success rates and quality scores
   */
  async getSourceEffectiveness(queryDto: DateRangeQueryDto, user: User): Promise<SourceEffectivenessDto[]> {
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
          },
          scores: {
            include: {
              jobPosition: true,
            },
          },
        },
      });

      // Group by source
      const sourceMap: Record<
        string,
        {
          totalApplications: number;
          hires: number;
          totalTimeToHire: number;
          hiredCount: number;
          qualityScores: number[];
        }
      > = {};

      candidates.forEach((candidate) => {
        const source = candidate.source || ApplicationSource.OTHER;

        if (!sourceMap[source]) {
          sourceMap[source] = {
            totalApplications: 0,
            hires: 0,
            totalTimeToHire: 0,
            hiredCount: 0,
            qualityScores: [],
          };
        }

        sourceMap[source].totalApplications += 1;

        // Check if hired
        const hiredProcesses = candidate.hiringProcesses.filter((hp) => hp.status === HiringProcessStatus.CLOSED);
        if (hiredProcesses.length > 0) {
          sourceMap[source].hires += 1;

          // Calculate time to hire
          hiredProcesses.forEach((hp) => {
            const days = Math.floor((hp.updatedAt.getTime() - hp.createdAt.getTime()) / (1000 * 60 * 60 * 24));
            sourceMap[source].totalTimeToHire += days;
            sourceMap[source].hiredCount += 1;
          });
        }

        // Add quality scores if available
        if (candidate.scores.length > 0) {
          const avgScore = candidate.scores.reduce((sum, score) => sum + score.overallScore, 0) / candidate.scores.length;
          sourceMap[source].qualityScores.push(avgScore);
        }
      });

      // Convert to DTO array
      const result: SourceEffectivenessDto[] = Object.entries(sourceMap).map(([source, data]) => {
        const successRate = data.totalApplications > 0 ? (data.hires / data.totalApplications) * 100 : 0;
        const averageTimeToHire = data.hiredCount > 0 ? data.totalTimeToHire / data.hiredCount : 0;
        const averageQualityScore = data.qualityScores.length > 0 ? data.qualityScores.reduce((sum, score) => sum + score, 0) / data.qualityScores.length : undefined;

        return {
          source,
          totalApplications: data.totalApplications,
          hires: data.hires,
          successRate: Math.round(successRate * 10) / 10,
          averageTimeToHire: Math.round(averageTimeToHire * 10) / 10,
          averageQualityScore: averageQualityScore ? Math.round(averageQualityScore * 10) / 10 : undefined,
        };
      });

      // Sort by success rate descending
      return result.sort((a, b) => b.successRate - a.successRate);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to get source effectiveness: ${error.message}`);
    }
  }

  /**
   * Get stage duration analysis
   */
  async getStageDuration(queryDto: DateRangeQueryDto, user: User): Promise<StageDurationDto[]> {
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

      // Get all hiring processes with stages
      const hiringProcesses = await this.databaseService.hiringProcess.findMany({
        where,
        include: {
          stages: true,
        },
      });

      // Group stages by type
      const stageTypeMap: Record<
        string,
        {
          durations: number[];
          completedCount: number;
          currentCount: number;
        }
      > = {};

      hiringProcesses.forEach((hp) => {
        hp.stages.forEach((stage) => {
          if (!stageTypeMap[stage.type]) {
            stageTypeMap[stage.type] = {
              durations: [],
              completedCount: 0,
              currentCount: 0,
            };
          }

          // Count current vs completed
          if (stage.status === StageStatus.DONE) {
            stageTypeMap[stage.type].completedCount += 1;
            const days = Math.floor((stage.updatedAt.getTime() - stage.createdAt.getTime()) / (1000 * 60 * 60 * 24));
            stageTypeMap[stage.type].durations.push(days);
          } else if (stage.status === StageStatus.CURRENT || stage.status === StageStatus.OPEN) {
            stageTypeMap[stage.type].currentCount += 1;
          }
        });
      });

      // Convert to DTO array
      const result: StageDurationDto[] = Object.entries(stageTypeMap).map(([stageType, data]) => {
        const durations = data.durations.sort((a, b) => a - b);
        const averageDuration = durations.length > 0 ? durations.reduce((sum, d) => sum + d, 0) / durations.length : 0;

        const medianDuration =
          durations.length > 0
            ? durations.length % 2 === 0
              ? (durations[durations.length / 2 - 1] + durations[durations.length / 2]) / 2
              : durations[Math.floor(durations.length / 2)]
            : 0;

        const fastest = durations.length > 0 ? Math.min(...durations) : 0;
        const slowest = durations.length > 0 ? Math.max(...durations) : 0;

        return {
          stageType,
          averageDuration: Math.round(averageDuration * 10) / 10,
          medianDuration: Math.round(medianDuration * 10) / 10,
          completedCount: data.completedCount,
          currentCount: data.currentCount,
          fastest: Math.round(fastest * 10) / 10,
          slowest: Math.round(slowest * 10) / 10,
        };
      });

      // Sort by average duration descending (identify bottlenecks)
      return result.sort((a, b) => b.averageDuration - a.averageDuration);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to get stage duration: ${error.message}`);
    }
  }
}
