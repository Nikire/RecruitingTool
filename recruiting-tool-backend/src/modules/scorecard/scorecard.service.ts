import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../shared/modules/database/prisma.service';
import {
  SubmitScorecardDto,
  ScorecardResponseDto,
  CategoryScoreResponseDto,
  CriterionScoreResponseDto,
} from './dto/scorecard.dto';

@Injectable()
export class ScorecardService {
  constructor(private prisma: PrismaService) {}

  async submitScorecard(dto: SubmitScorecardDto, evaluatorId: number): Promise<ScorecardResponseDto> {
    // Resolve template
    const template = await this.prisma.scorecardTemplate.findUnique({
      where: { uid: dto.templateUid },
      include: {
        categories: {
          include: {
            criteria: true,
          },
        },
      },
    });

    if (!template) {
      throw new NotFoundException('Scorecard template not found');
    }

    // Resolve interview
    const interview = await this.prisma.interview.findUnique({
      where: { uid: dto.interviewUid },
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    // Validate that all criteria are scored
    const allCriteria = template.categories.flatMap((cat) => cat.criteria);
    const scoredCriteriaUids = dto.scores.map((s) => s.criterionUid);

    const missingCriteria = allCriteria.filter((c) => !scoredCriteriaUids.includes(c.uid));
    if (missingCriteria.length > 0) {
      throw new BadRequestException('All criteria must be scored');
    }

    // Validate score values
    for (const score of dto.scores) {
      const criterion = allCriteria.find((c) => c.uid === score.criterionUid);
      if (!criterion) {
        throw new BadRequestException(`Invalid criterion UID: ${score.criterionUid}`);
      }
      if (score.score < 0 || score.score > criterion.maxScore) {
        throw new BadRequestException(
          `Score for ${criterion.name} must be between 0 and ${criterion.maxScore}`,
        );
      }
    }

    // Calculate overall score using weighted average
    const overallScore = this.calculateOverallScore(template, dto.scores);

    // Create scorecard with scores
    const scorecard = await this.prisma.scorecard.create({
      data: {
        templateId: template.id,
        interviewId: interview.id,
        evaluatorId,
        overallScore,
        notes: dto.notes,
        scores: {
          create: dto.scores.map((score) => {
            const criterion = allCriteria.find((c) => c.uid === score.criterionUid);
            return {
              criterionId: criterion.id,
              score: score.score,
              notes: score.notes,
            };
          }),
        },
      },
      include: {
        template: {
          include: {
            categories: {
              include: {
                criteria: true,
              },
            },
          },
        },
        interview: true,
        evaluator: true,
        scores: {
          include: {
            scorecard: {
              include: {
                template: {
                  include: {
                    categories: {
                      include: {
                        criteria: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return this.mapScorecardToResponse(scorecard);
  }

  async getScorecardsByInterview(interviewUid: string): Promise<ScorecardResponseDto[]> {
    const interview = await this.prisma.interview.findUnique({
      where: { uid: interviewUid },
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    const scorecards = await this.prisma.scorecard.findMany({
      where: { interviewId: interview.id },
      include: {
        template: {
          include: {
            categories: {
              include: {
                criteria: true,
              },
            },
          },
        },
        interview: true,
        evaluator: true,
        scores: true,
      },
      orderBy: { submittedAt: 'desc' },
    });

    return scorecards.map((scorecard) => this.mapScorecardToResponse(scorecard));
  }

  async getScorecardByUid(uid: string): Promise<ScorecardResponseDto> {
    const scorecard = await this.prisma.scorecard.findUnique({
      where: { uid },
      include: {
        template: {
          include: {
            categories: {
              include: {
                criteria: true,
              },
            },
          },
        },
        interview: true,
        evaluator: true,
        scores: true,
      },
    });

    if (!scorecard) {
      throw new NotFoundException('Scorecard not found');
    }

    return this.mapScorecardToResponse(scorecard);
  }

  private calculateOverallScore(template: any, scores: any[]): number {
    let weightedSum = 0;

    for (const category of template.categories) {
      const categoryScores = category.criteria.map((criterion: any) => {
        const score = scores.find((s) => s.criterionUid === criterion.uid);
        return score ? (score.score / criterion.maxScore) * 100 : 0;
      });

      const categoryAverage = categoryScores.reduce((sum, s) => sum + s, 0) / categoryScores.length;
      weightedSum += (categoryAverage * category.weight) / 100;
    }

    return Math.round(weightedSum * 100) / 100;
  }

  private mapScorecardToResponse(scorecard: any): ScorecardResponseDto {
    // Group scores by category
    const categoryScores: CategoryScoreResponseDto[] = scorecard.template.categories.map((category: any) => {
      const criterionScores: CriterionScoreResponseDto[] = category.criteria.map((criterion: any) => {
        const score = scorecard.scores.find((s: any) => s.criterionId === criterion.id);
        return {
          criterionUid: criterion.uid,
          criterionName: criterion.name,
          score: score?.score || 0,
          maxScore: criterion.maxScore,
          notes: score?.notes,
        };
      });

      return {
        categoryName: category.name,
        weight: category.weight,
        scores: criterionScores,
      };
    });

    return {
      uid: scorecard.uid,
      templateUid: scorecard.template.uid,
      templateName: scorecard.template.name,
      interviewUid: scorecard.interview.uid,
      evaluatorUid: scorecard.evaluator.uid,
      evaluatorName: scorecard.evaluator.name,
      overallScore: scorecard.overallScore,
      notes: scorecard.notes,
      categoryScores,
      submittedAt: scorecard.submittedAt,
      createdAt: scorecard.createdAt,
    };
  }
}
