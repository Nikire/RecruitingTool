import { Injectable, NotFoundException, InternalServerErrorException, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import OpenAI from 'openai';
import { DatabaseService } from '../shared/modules/database/database.service';
import { CandidateScoreResponseDto, RankedCandidatesResponseDto, RankedCandidateDto, ScoreAnalysisDto } from './dto/candidate-scoring.dto';
import { SseService } from '../sse/sse.service';

@Injectable()
export class ScoringService {
  private readonly logger = new Logger(ScoringService.name);
  private openai: OpenAI;

  constructor(
    private configService: ConfigService,
    private databaseService: DatabaseService,
    private sseService: SseService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      this.logger.warn('OpenAI API key not configured. AI scoring features will be disabled.');
      this.openai = null;
    } else {
      this.openai = new OpenAI({
        apiKey: apiKey,
      });
    }
  }

  /**
   * Score a candidate for a specific job position using AI
   */
  async scoreCandidate(candidateUid: string, jobPositionUid: string): Promise<CandidateScoreResponseDto> {
    if (!this.openai) {
      throw new InternalServerErrorException('OpenAI API is not configured. Please set OPENAI_API_KEY in environment variables.');
    }

    try {
      this.logger.log(`Starting candidate scoring: ${candidateUid} for job ${jobPositionUid}`);

      // Fetch candidate details
      const candidate = await this.databaseService.candidate.findUnique({
        where: { uid: candidateUid },
        include: {
          files: true,
          notes: true,
          hiringProcesses: {
            include: {
              jobPosition: true,
            },
          },
        },
      });

      if (!candidate) {
        throw new NotFoundException(`Candidate with UID ${candidateUid} not found`);
      }

      // Fetch job position details
      const jobPosition = await this.databaseService.jobPosition.findUnique({
        where: { uid: jobPositionUid },
        include: {
          stages: true,
        },
      });

      if (!jobPosition) {
        throw new NotFoundException(`Job Position with UID ${jobPositionUid} not found`);
      }

      // Check if score already exists (update existing or create new)
      const existingScore = await this.databaseService.candidateScore.findUnique({
        where: {
          candidateId_jobPositionId: {
            candidateId: candidate.id,
            jobPositionId: jobPosition.id,
          },
        },
      });

      // Generate AI scoring
      const { scores, analysis } = await this.generateAIScoring(candidate, jobPosition);

      // Save or update the score
      let savedScore;
      if (existingScore) {
        savedScore = await this.databaseService.candidateScore.update({
          where: { id: existingScore.id },
          data: {
            overallScore: scores.overall,
            skillsScore: scores.skills,
            experienceScore: scores.experience,
            educationScore: scores.education,
            analysis: analysis as unknown as Prisma.JsonValue,
          },
        });
        this.logger.log(`Updated existing score for candidate ${candidateUid} and job ${jobPositionUid}`);
      } else {
        savedScore = await this.databaseService.candidateScore.create({
          data: {
            candidate: { connect: { id: candidate.id } },
            jobPosition: { connect: { id: jobPosition.id } },
            overallScore: scores.overall,
            skillsScore: scores.skills,
            experienceScore: scores.experience,
            educationScore: scores.education,
            analysis: analysis as unknown as Prisma.JsonValue,
          },
        });
        this.logger.log(`Created new score for candidate ${candidateUid} and job ${jobPositionUid}`);
      }

      // Emit SSE event for score updated
      const hiringProcess = await this.databaseService.hiringProcess.findFirst({
        where: {
          candidateId: candidate.id,
          jobPositionId: jobPosition.id,
        },
        include: {
          company: true,
        },
      });

      if (hiringProcess) {
        this.sseService.emitScoreUpdated(
          candidate.uid,
          candidate.name,
          hiringProcess.uid,
          scores.overall,
          'AI',
          jobPosition.title,
          undefined, // userUid - send to all users
          hiringProcess.company?.uid, // companyUid - filter by company
        );
      }

      return this.mapToResponseDto(savedScore);
    } catch (error) {
      this.logger.error(`Candidate scoring failed: ${error.message}`, error.stack);

      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error;
      }

      throw new InternalServerErrorException(`Failed to score candidate: ${error.message}`);
    }
  }

  /**
   * Get score and analysis for a specific candidate and job position
   */
  async getScoreAnalysis(candidateUid: string, jobPositionUid: string): Promise<CandidateScoreResponseDto> {
    try {
      // Find candidate
      const candidate = await this.databaseService.candidate.findUnique({
        where: { uid: candidateUid },
      });

      if (!candidate) {
        throw new NotFoundException(`Candidate with UID ${candidateUid} not found`);
      }

      // Find job position
      const jobPosition = await this.databaseService.jobPosition.findUnique({
        where: { uid: jobPositionUid },
      });

      if (!jobPosition) {
        throw new NotFoundException(`Job Position with UID ${jobPositionUid} not found`);
      }

      // Find score
      const score = await this.databaseService.candidateScore.findUnique({
        where: {
          candidateId_jobPositionId: {
            candidateId: candidate.id,
            jobPositionId: jobPosition.id,
          },
        },
      });

      if (!score) {
        throw new NotFoundException(`No score found for candidate ${candidateUid} and job position ${jobPositionUid}`);
      }

      return this.mapToResponseDto(score);
    } catch (error) {
      this.logger.error(`Failed to get score analysis: ${error.message}`, error.stack);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(`Failed to get score analysis: ${error.message}`);
    }
  }

  /**
   * Get ranked list of candidates for a job position
   */
  async getRankedCandidates(jobPositionUid: string): Promise<RankedCandidatesResponseDto> {
    try {
      // Find job position
      const jobPosition = await this.databaseService.jobPosition.findUnique({
        where: { uid: jobPositionUid },
      });

      if (!jobPosition) {
        throw new NotFoundException(`Job Position with UID ${jobPositionUid} not found`);
      }

      // Fetch all scores for this job position, sorted by overall score descending
      const scores = await this.databaseService.candidateScore.findMany({
        where: {
          jobPositionId: jobPosition.id,
        },
        include: {
          candidate: true,
        },
        orderBy: {
          overallScore: 'desc',
        },
      });

      // Map to ranked candidates
      const rankedCandidates: RankedCandidateDto[] = scores.map((score, index) => ({
        candidateUid: score.candidate.uid,
        candidateName: score.candidate.name,
        candidateEmail: score.candidate.email,
        overallScore: score.overallScore,
        skillsScore: score.skillsScore,
        experienceScore: score.experienceScore,
        educationScore: score.educationScore,
        rank: index + 1,
        scoreUid: score.uid,
        scoredAt: score.scoredAt,
      }));

      return {
        jobPositionUid: jobPosition.uid,
        jobPositionTitle: jobPosition.title,
        totalCandidates: rankedCandidates.length,
        rankedCandidates,
      };
    } catch (error) {
      this.logger.error(`Failed to get ranked candidates: ${error.message}`, error.stack);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(`Failed to get ranked candidates: ${error.message}`);
    }
  }

  /**
   * Generate AI-powered scoring using OpenAI
   */
  private async generateAIScoring(
    candidate: any,
    jobPosition: any,
  ): Promise<{
    scores: {
      overall: number;
      skills: number;
      experience: number;
      education: number;
    };
    analysis: ScoreAnalysisDto;
  }> {
    const model = this.configService.get<string>('OPENAI_MODEL') || 'gpt-4-turbo-preview';

    const prompt = `
You are an expert HR recruiter and candidate evaluator. Analyze the following candidate against the job position requirements and provide a detailed scoring and analysis.

**Job Position:**
Title: ${jobPosition.title}
Description: ${jobPosition.description || 'No description provided'}

**Candidate:**
Name: ${candidate.name}
Email: ${candidate.email}
Source: ${candidate.source || 'Unknown'}
Additional Info: ${candidate.sourceDetails || 'No additional info'}

Please provide a comprehensive evaluation with the following structure:

1. **Skills Score (0-100)**: Rate the candidate's technical and professional skills match for this position.
2. **Experience Score (0-100)**: Rate the candidate's relevant work experience and background.
3. **Education Score (0-100)**: Rate the candidate's educational qualifications and certifications.
4. **Overall Score (0-100)**: Calculate a weighted overall score (40% skills, 35% experience, 25% education).

Additionally, provide detailed analysis:
- **Skills Analysis**: What skills does the candidate have that match or don't match the position?
- **Experience Analysis**: How does their experience align with job requirements?
- **Education Analysis**: Does their educational background fit the position?
- **Recommendation**: Overall assessment and recommendation (Strongly Recommend, Recommend, Consider, Not Recommended)
- **Strengths**: List 3-5 key strengths
- **Concerns**: List any gaps or concerns

Return a JSON object with this exact structure:
{
  "scores": {
    "skills": <number 0-100>,
    "experience": <number 0-100>,
    "education": <number 0-100>,
    "overall": <number 0-100>
  },
  "analysis": {
    "skillsAnalysis": "string",
    "experienceAnalysis": "string",
    "educationAnalysis": "string",
    "recommendation": "string",
    "strengths": ["string", "string", ...],
    "concerns": ["string", "string", ...]
  }
}

IMPORTANT: Return ONLY valid JSON, no additional text or explanation.
`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: 'system',
            content:
              'You are an expert HR recruiter. You evaluate candidates objectively and provide detailed, constructive feedback. You return your analysis as valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.4, // Balanced temperature for consistent but nuanced scoring
        response_format: { type: 'json_object' },
      });

      const responseContent = completion.choices[0].message.content;
      const result = JSON.parse(responseContent);

      // Validate scores are within range
      const validateScore = (score: number): number => {
        return Math.min(100, Math.max(0, score));
      };

      return {
        scores: {
          skills: validateScore(result.scores.skills),
          experience: validateScore(result.scores.experience),
          education: validateScore(result.scores.education),
          overall: validateScore(result.scores.overall),
        },
        analysis: result.analysis,
      };
    } catch (error) {
      this.logger.error(`OpenAI API error during scoring: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Failed to generate AI scoring: ${error.message}`);
    }
  }

  /**
   * Map database model to response DTO
   */
  private mapToResponseDto(score: any): CandidateScoreResponseDto {
    return {
      uid: score.uid,
      candidateUid: score.candidate?.uid,
      jobPositionUid: score.jobPosition?.uid,
      overallScore: score.overallScore,
      skillsScore: score.skillsScore,
      experienceScore: score.experienceScore,
      educationScore: score.educationScore,
      analysis: score.analysis as ScoreAnalysisDto,
      scoredAt: score.scoredAt,
      createdAt: score.createdAt,
      updatedAt: score.updatedAt,
    };
  }
}
