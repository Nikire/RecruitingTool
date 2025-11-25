import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../shared/modules/database/prisma.service';
import {
  SubmitScorecardDto,
  ScorecardResponseDto,
  CategoryScoreResponseDto,
  CriterionScoreResponseDto,
  ScorecardSummaryDto,
  CategoryConsensusDto,
  CriterionConsensusDto,
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

  async getInterviewSummary(interviewUid: string): Promise<ScorecardSummaryDto> {
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
              orderBy: { order: 'asc' },
            },
          },
        },
        evaluator: true,
        scores: true,
      },
      orderBy: { submittedAt: 'desc' },
    });

    if (scorecards.length === 0) {
      throw new NotFoundException('No scorecards found for this interview');
    }

    // Calculate average overall score and variance
    const overallScores = scorecards.map((s) => s.overallScore);
    const averageOverallScore = this.calculateMean(overallScores);
    const overallVariance = this.calculateVariance(overallScores);

    // Get template (assuming all scorecards use the same template)
    const template = scorecards[0].template;

    // Calculate consensus for each category
    const categoryConsensus: CategoryConsensusDto[] = template.categories.map((category) => {
      const criteriaConsensus: CriterionConsensusDto[] = category.criteria.map((criterion) => {
        // Collect all scores for this criterion across all evaluators
        const evaluatorScores = scorecards.map((scorecard) => {
          const score = scorecard.scores.find((s) => s.criterionId === criterion.id);
          return {
            evaluatorUid: scorecard.evaluator.uid,
            evaluatorName: scorecard.evaluator.name,
            score: score?.score || 0,
            notes: score?.notes,
          };
        });

        const scores = evaluatorScores.map((es) => es.score);
        const averageScore = this.calculateMean(scores);
        const variance = this.calculateVariance(scores);

        return {
          criterionUid: criterion.uid,
          criterionName: criterion.name,
          averageScore: Math.round(averageScore * 100) / 100,
          maxScore: criterion.maxScore,
          variance: Math.round(variance * 100) / 100,
          evaluatorScores,
        };
      });

      // Calculate category average
      const categoryScores = criteriaConsensus.map((c) => c.averageScore);
      const categoryAverage = this.calculateMean(categoryScores);
      const categoryVariance = this.calculateVariance(categoryScores);

      return {
        categoryName: category.name,
        weight: category.weight,
        averageScore: Math.round(categoryAverage * 100) / 100,
        variance: Math.round(categoryVariance * 100) / 100,
        criteria: criteriaConsensus,
      };
    });

    // Identify high variance items (variance > 1.5 or 30% of max score)
    const highVarianceItems = categoryConsensus
      .flatMap((cat) =>
        cat.criteria
          .filter((crit) => crit.variance > 1.5)
          .map((crit) => ({
            criterionName: crit.criterionName,
            variance: crit.variance,
            averageScore: crit.averageScore,
          })),
      )
      .sort((a, b) => b.variance - a.variance)
      .slice(0, 5); // Top 5 high variance items

    // Build evaluator summaries
    const evaluatorScorecards = scorecards.map((scorecard) => ({
      evaluatorUid: scorecard.evaluator.uid,
      evaluatorName: scorecard.evaluator.name,
      overallScore: scorecard.overallScore,
      submittedAt: scorecard.submittedAt,
    }));

    return {
      interviewUid,
      totalEvaluators: scorecards.length,
      averageOverallScore: Math.round(averageOverallScore * 100) / 100,
      variance: Math.round(overallVariance * 100) / 100,
      categoryConsensus,
      highVarianceItems,
      evaluatorScorecards,
    };
  }

  private calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
  }

  private calculateVariance(values: number[]): number {
    if (values.length < 2) return 0;
    const mean = this.calculateMean(values);
    const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
    return this.calculateMean(squaredDiffs);
  }
}
