import { Injectable, HttpException, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from 'src/modules/shared/modules/database/database.service';
import { CandidateActivityResponseDto } from '../dto/candidate-activity.dto';
import { CandidateActivityType } from '@prisma/client';
import { EntityNotFoundException } from 'src/common/exceptions';

@Injectable()
export class CandidateActivityService {
  constructor(private databaseService: DatabaseService) {}

  /**
   * Log a candidate activity
   * @param candidateId - Internal candidate ID
   * @param type - Type of activity
   * @param description - Description of the activity
   * @param userId - Internal user ID (optional, null for system events)
   * @param metadata - Additional metadata (optional)
   * @returns Promise<CandidateActivityResponseDto>
   */
  async logActivity(
    candidateId: number,
    type: CandidateActivityType,
    description: string,
    userId?: number,
    metadata?: any,
  ): Promise<CandidateActivityResponseDto> {
    try {
      const activity = await this.databaseService.candidateActivity.create({
        data: {
          candidateId,
          type,
          description,
          userId: userId || null,
          metadata: metadata || null,
        },
        include: {
          candidate: true,
          user: true,
        },
      });

      return this.mapActivityToDto(activity);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to log activity: ${error.message}`,
      );
    }
  }

  /**
   * Get all activities for a specific candidate
   * @param candidateUid - Candidate UID
   * @returns Promise<CandidateActivityResponseDto[]>
   */
  async getCandidateActivities(candidateUid: string): Promise<CandidateActivityResponseDto[]> {
    try {
      const candidate = await this.databaseService.candidate.findUnique({
        where: { uid: candidateUid },
      });

      if (!candidate) {
        throw new EntityNotFoundException('Candidate', candidateUid);
      }

      const activities = await this.databaseService.candidateActivity.findMany({
        where: { candidateId: candidate.id },
        orderBy: { createdAt: 'desc' },
        include: {
          candidate: true,
          user: true,
        },
      });

      return activities.map((activity) => this.mapActivityToDto(activity));
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to get candidate activities: ${error.message}`,
      );
    }
  }

  /**
   * Map CandidateActivity entity to DTO
   */
  private mapActivityToDto(activity: any): CandidateActivityResponseDto {
    return {
      uid: activity.uid,
      candidateUid: activity.candidate.uid,
      type: activity.type,
      description: activity.description,
      metadata: activity.metadata,
      userUid: activity.user?.uid || null,
      userName: activity.user?.name || null,
      createdAt: activity.createdAt,
    };
  }
}
