import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../shared/database/prisma.service';
import { ScoringService } from './scoring.service';
import {
  BatchScoreRequestDto,
  BatchScoreStatusDto,
  BatchScoreResultDto,
  BatchScoreResponseDto,
  BatchStatusEnum,
  BatchPriority,
  BatchScoreSummaryDto,
} from './dto/batch-scoring.dto';
import { CandidateScoreResponseDto } from './dto/candidate-scoring.dto';
import { BatchStatus, QuotaType } from '@prisma/client';

@Injectable()
export class BatchScoringService {
  private readonly logger = new Logger(BatchScoringService.name);
  private processingQueue: Map<string, boolean> = new Map();

  constructor(
    private prisma: PrismaService,
    private scoringService: ScoringService,
  ) {}

  /**
   * Start a batch scoring job
   */
  async startBatchScoring(
    dto: BatchScoreRequestDto,
    companyId: number,
    userId: number,
  ): Promise<BatchScoreResponseDto> {
    try {
      this.logger.log(
        `Starting batch scoring for job position: ${dto.jobPositionUid}`,
      );

      // Find job position
      const jobPosition = await this.prisma.jobPosition.findUnique({
        where: { uid: dto.jobPositionUid },
        include: {
          hiringProcesses: {
            include: {
              candidate: true,
            },
          },
        },
      });

      if (!jobPosition) {
        throw new NotFoundException(
          `Job Position with UID ${dto.jobPositionUid} not found`,
        );
      }

      // Determine which candidates to score
      let candidateUids: string[];

      if (dto.candidateUids && dto.candidateUids.length > 0) {
        // Verify all provided candidate UIDs exist
        candidateUids = dto.candidateUids;
        const candidates = await this.prisma.candidate.findMany({
          where: {
            uid: { in: candidateUids },
          },
        });

        if (candidates.length !== candidateUids.length) {
          throw new BadRequestException(
            'One or more candidate UIDs are invalid or not found',
          );
        }
      } else {
        // Score all candidates for this job position
        const hiringProcesses = jobPosition.hiringProcesses.filter(
          (hp) => hp.candidateId !== null,
        );

        if (hiringProcesses.length === 0) {
          throw new BadRequestException(
            'No candidates found for this job position',
          );
        }

        candidateUids = hiringProcesses
          .map((hp) => hp.candidate?.uid)
          .filter((uid): uid is string => uid !== undefined);
      }

      // Check AI quota before starting
      await this.checkAndConsumeQuota(
        companyId,
        QuotaType.BATCH_SCORING,
        candidateUids.length,
      );

      // Create batch job record
      const batchJob = await this.prisma.batchScoringJob.create({
        data: {
          jobPositionId: jobPosition.id,
          status: BatchStatus.PENDING,
          priority: dto.priority || BatchPriority.NORMAL,
          totalCandidates: candidateUids.length,
          candidateUids: candidateUids,
          errors: null,
        },
      });

      this.logger.log(
        `Batch job created with UID: ${batchJob.uid}, total candidates: ${candidateUids.length}`,
      );

      // Start processing asynchronously
      this.processBatch(batchJob.uid, jobPosition.uid, candidateUids, companyId, userId)
        .catch((error) => {
          this.logger.error(
            `Batch processing failed for job ${batchJob.uid}: ${error.message}`,
            error.stack,
          );
        });

      return {
        batchId: batchJob.uid,
        status: BatchStatusEnum.PENDING,
        totalCandidates: candidateUids.length,
        message:
          'Batch scoring job created successfully and queued for processing',
      };
    } catch (error) {
      this.logger.error(
        `Failed to start batch scoring: ${error.message}`,
        error.stack,
      );

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Failed to start batch scoring: ${error.message}`,
      );
    }
  }

  /**
   * Get batch job status
   */
  async getBatchStatus(batchId: string): Promise<BatchScoreStatusDto> {
    try {
      const batchJob = await this.prisma.batchScoringJob.findUnique({
        where: { uid: batchId },
      });

      if (!batchJob) {
        throw new NotFoundException(`Batch job with ID ${batchId} not found`);
      }

      const progress =
        batchJob.totalCandidates > 0
          ? Math.round(
              (batchJob.processedCount / batchJob.totalCandidates) * 100,
            )
          : 0;

      const errors = batchJob.errors
        ? Array.isArray(batchJob.errors)
          ? batchJob.errors
          : []
        : [];

      return {
        batchId: batchJob.uid,
        status: batchJob.status as BatchStatusEnum,
        totalCandidates: batchJob.totalCandidates,
        processedCandidates: batchJob.processedCount,
        failedCandidates: batchJob.failedCount,
        startedAt: batchJob.startedAt || undefined,
        completedAt: batchJob.completedAt || undefined,
        errors: errors as string[],
        progress,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get batch status: ${error.message}`,
        error.stack,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Failed to get batch status: ${error.message}`,
      );
    }
  }

  /**
   * Get batch job results
   */
  async getBatchResults(batchId: string): Promise<BatchScoreResultDto> {
    try {
      const batchJob = await this.prisma.batchScoringJob.findUnique({
        where: { uid: batchId },
        include: {
          jobPosition: true,
        },
      });

      if (!batchJob) {
        throw new NotFoundException(`Batch job with ID ${batchId} not found`);
      }

      if (batchJob.status === BatchStatus.PENDING || batchJob.status === BatchStatus.PROCESSING) {
        throw new BadRequestException(
          'Batch job is still processing. Please check status endpoint for progress.',
        );
      }

      // Fetch all scores for candidates in this batch
      const candidateUids = batchJob.candidateUids as string[];
      const candidates = await this.prisma.candidate.findMany({
        where: {
          uid: { in: candidateUids },
        },
      });

      const candidateIds = candidates.map((c) => c.id);

      const scores = await this.prisma.candidateScore.findMany({
        where: {
          candidateId: { in: candidateIds },
          jobPositionId: batchJob.jobPositionId,
        },
        include: {
          candidate: true,
          jobPosition: true,
        },
        orderBy: {
          overallScore: 'desc',
        },
      });

      // Map to response DTOs
      const results: CandidateScoreResponseDto[] = scores.map((score) => ({
        uid: score.uid,
        candidateUid: score.candidate.uid,
        jobPositionUid: score.jobPosition.uid,
        overallScore: score.overallScore,
        skillsScore: score.skillsScore,
        experienceScore: score.experienceScore,
        educationScore: score.educationScore,
        analysis: score.analysis as any,
        scoredAt: score.scoredAt,
        createdAt: score.createdAt,
        updatedAt: score.updatedAt,
      }));

      // Calculate summary statistics
      const summary = this.calculateSummary(results);

      const errors = batchJob.errors
        ? Array.isArray(batchJob.errors)
          ? batchJob.errors
          : []
        : [];

      return {
        batchId: batchJob.uid,
        jobPositionUid: batchJob.jobPosition.uid,
        status: batchJob.status as BatchStatusEnum,
        results,
        summary,
        startedAt: batchJob.startedAt || undefined,
        completedAt: batchJob.completedAt || undefined,
        errors: errors as string[],
      };
    } catch (error) {
      this.logger.error(
        `Failed to get batch results: ${error.message}`,
        error.stack,
      );

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Failed to get batch results: ${error.message}`,
      );
    }
  }

  /**
   * Cancel a batch job
   */
  async cancelBatch(batchId: string): Promise<{ message: string }> {
    try {
      const batchJob = await this.prisma.batchScoringJob.findUnique({
        where: { uid: batchId },
      });

      if (!batchJob) {
        throw new NotFoundException(`Batch job with ID ${batchId} not found`);
      }

      if (batchJob.status === BatchStatus.COMPLETED) {
        throw new BadRequestException(
          'Cannot cancel a batch job that has already completed',
        );
      }

      if (batchJob.status === BatchStatus.CANCELLED) {
        throw new BadRequestException('Batch job is already cancelled');
      }

      await this.prisma.batchScoringJob.update({
        where: { uid: batchId },
        data: {
          status: BatchStatus.CANCELLED,
          completedAt: new Date(),
        },
      });

      this.logger.log(`Batch job ${batchId} cancelled successfully`);

      return {
        message: 'Batch job cancelled successfully',
      };
    } catch (error) {
      this.logger.error(
        `Failed to cancel batch job: ${error.message}`,
        error.stack,
      );

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Failed to cancel batch job: ${error.message}`,
      );
    }
  }

  /**
   * Process batch job (runs asynchronously)
   */
  private async processBatch(
    batchJobUid: string,
    jobPositionUid: string,
    candidateUids: string[],
    companyId: number,
    userId: number,
  ): Promise<void> {
    // Prevent duplicate processing
    if (this.processingQueue.get(batchJobUid)) {
      this.logger.warn(`Batch job ${batchJobUid} is already being processed`);
      return;
    }

    this.processingQueue.set(batchJobUid, true);

    try {
      // Update status to processing
      await this.prisma.batchScoringJob.update({
        where: { uid: batchJobUid },
        data: {
          status: BatchStatus.PROCESSING,
          startedAt: new Date(),
        },
      });

      this.logger.log(
        `Started processing batch job ${batchJobUid} with ${candidateUids.length} candidates`,
      );

      const errors: string[] = [];
      let processedCount = 0;
      let failedCount = 0;

      // Process each candidate sequentially to avoid rate limits
      for (const candidateUid of candidateUids) {
        try {
          // Check if job was cancelled
          const currentJob = await this.prisma.batchScoringJob.findUnique({
            where: { uid: batchJobUid },
          });

          if (currentJob?.status === BatchStatus.CANCELLED) {
            this.logger.log(`Batch job ${batchJobUid} was cancelled, stopping processing`);
            break;
          }

          // Score the candidate
          await this.scoringService.scoreCandidate(candidateUid, jobPositionUid);

          // Log AI usage
          await this.logAIUsage(companyId, userId, QuotaType.CANDIDATE_SCORING);

          processedCount++;

          // Update progress
          await this.prisma.batchScoringJob.update({
            where: { uid: batchJobUid },
            data: {
              processedCount,
            },
          });

          this.logger.log(
            `Batch job ${batchJobUid}: Scored candidate ${candidateUid} (${processedCount}/${candidateUids.length})`,
          );

          // Small delay to avoid rate limits (100ms between requests)
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (error) {
          this.logger.error(
            `Failed to score candidate ${candidateUid} in batch ${batchJobUid}: ${error.message}`,
          );
          failedCount++;
          errors.push(
            `Candidate ${candidateUid}: ${error.message || 'Unknown error'}`,
          );
        }
      }

      // Determine final status
      const finalStatus =
        failedCount === candidateUids.length
          ? BatchStatus.FAILED
          : BatchStatus.COMPLETED;

      // Update final status
      await this.prisma.batchScoringJob.update({
        where: { uid: batchJobUid },
        data: {
          status: finalStatus,
          processedCount,
          failedCount,
          errors: errors.length > 0 ? errors : null,
          completedAt: new Date(),
        },
      });

      this.logger.log(
        `Batch job ${batchJobUid} completed with status ${finalStatus}. Processed: ${processedCount}, Failed: ${failedCount}`,
      );
    } catch (error) {
      this.logger.error(
        `Critical error in batch processing ${batchJobUid}: ${error.message}`,
        error.stack,
      );

      // Mark batch as failed
      await this.prisma.batchScoringJob.update({
        where: { uid: batchJobUid },
        data: {
          status: BatchStatus.FAILED,
          errors: [error.message || 'Unknown critical error'],
          completedAt: new Date(),
        },
      });
    } finally {
      this.processingQueue.delete(batchJobUid);
    }
  }

  /**
   * Calculate summary statistics
   */
  private calculateSummary(
    results: CandidateScoreResponseDto[],
  ): BatchScoreSummaryDto {
    if (results.length === 0) {
      return {
        totalScored: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        averageSkillsScore: 0,
        averageExperienceScore: 0,
        averageEducationScore: 0,
      };
    }

    const overallScores = results.map((r) => r.overallScore);
    const skillsScores = results.map((r) => r.skillsScore);
    const experienceScores = results.map((r) => r.experienceScore);
    const educationScores = results.map((r) => r.educationScore);

    const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
    const avg = (arr: number[]) => sum(arr) / arr.length;

    return {
      totalScored: results.length,
      averageScore: Math.round(avg(overallScores) * 100) / 100,
      highestScore: Math.max(...overallScores),
      lowestScore: Math.min(...overallScores),
      averageSkillsScore: Math.round(avg(skillsScores) * 100) / 100,
      averageExperienceScore: Math.round(avg(experienceScores) * 100) / 100,
      averageEducationScore: Math.round(avg(educationScores) * 100) / 100,
    };
  }

  /**
   * Check AI quota before processing
   */
  private async checkAndConsumeQuota(
    companyId: number,
    quotaType: QuotaType,
    count: number,
  ): Promise<void> {
    const quota = await this.prisma.aIQuota.findUnique({
      where: {
        companyId_quotaType: {
          companyId,
          quotaType,
        },
      },
    });

    if (!quota) {
      this.logger.warn(
        `No AI quota found for company ${companyId} and type ${quotaType}. Allowing operation.`,
      );
      return;
    }

    if (quota.used + count > quota.limit) {
      throw new BadRequestException(
        `AI quota exceeded. Used: ${quota.used}, Limit: ${quota.limit}, Requested: ${count}`,
      );
    }

    // Reserve quota
    await this.prisma.aIQuota.update({
      where: {
        companyId_quotaType: {
          companyId,
          quotaType,
        },
      },
      data: {
        used: {
          increment: count,
        },
      },
    });

    this.logger.log(
      `Reserved ${count} quota units for company ${companyId}, type ${quotaType}`,
    );
  }

  /**
   * Log AI usage
   */
  private async logAIUsage(
    companyId: number,
    userId: number,
    operation: QuotaType,
  ): Promise<void> {
    try {
      await this.prisma.aIUsageLog.create({
        data: {
          companyId,
          userId,
          operation,
          tokensUsed: null,
          cost: null,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to log AI usage: ${error.message}`);
    }
  }
}
