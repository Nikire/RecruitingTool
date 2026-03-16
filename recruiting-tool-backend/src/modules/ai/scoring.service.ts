import { Injectable, NotFoundException, InternalServerErrorException, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, QuotaType } from '@prisma/client';
import { DatabaseService } from '../shared/modules/database/database.service';
import { CandidateScoreResponseDto, RankedCandidatesResponseDto, RankedCandidateDto, ScoreAnalysisDto } from './dto/candidate-scoring.dto';
import { CompareCandidatesResponseDto, CandidateComparisonSummary, ComparisonAnalysis } from './dto/candidate-comparison.dto';
import { SseService } from '../sse/sse.service';
import { GeminiService } from './gemini.service';

@Injectable()
export class ScoringService {
  private readonly logger = new Logger(ScoringService.name);

  constructor(
    private configService: ConfigService,
    private databaseService: DatabaseService,
    private sseService: SseService,
    private geminiService: GeminiService,
  ) {
    if (this.geminiService.isConfigured()) {
      this.logger.log('Scoring Service initialized with Gemini AI');
    } else {
      this.logger.warn('Gemini API key not configured. AI scoring features will be disabled.');
    }
  }

  /**
   * Score a candidate for a specific job position using AI
   */
  async scoreCandidate(candidateUid: string, jobPositionUid: string, companyId?: number): Promise<CandidateScoreResponseDto> {
    if (!this.geminiService.isConfigured()) {
      throw new InternalServerErrorException('AI API is not configured. Please set GEMINI_API_KEY in environment variables.');
    }

    // Check AI quota for single scoring before making the AI call
    if (companyId !== undefined) {
      await this.checkSingleScoringQuota(companyId);
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

      // Increment AI quota usage after successful scoring
      if (companyId !== undefined) {
        await this.incrementSingleScoringQuota(companyId);
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
   * Compare multiple candidates for a job position using AI
   */
  async compareCandidates(candidateUids: string[], jobPositionUid: string): Promise<CompareCandidatesResponseDto> {
    if (!this.geminiService.isConfigured()) {
      throw new InternalServerErrorException('AI API is not configured. Please set GEMINI_API_KEY in environment variables.');
    }

    if (candidateUids.length < 2 || candidateUids.length > 5) {
      throw new BadRequestException('Please select between 2 and 5 candidates for comparison');
    }

    try {
      this.logger.log(`Starting comparison of ${candidateUids.length} candidates for job ${jobPositionUid}`);

      // Fetch job position
      const jobPosition = await this.databaseService.jobPosition.findUnique({
        where: { uid: jobPositionUid },
        include: {
          stages: true,
        },
      });

      if (!jobPosition) {
        throw new NotFoundException(`Job Position with UID ${jobPositionUid} not found`);
      }

      // Fetch all candidates
      const candidates = await this.databaseService.candidate.findMany({
        where: {
          uid: {
            in: candidateUids,
          },
        },
        include: {
          files: true,
          notes: true,
        },
      });

      if (candidates.length !== candidateUids.length) {
        throw new NotFoundException('One or more candidates not found');
      }

      // Fetch hiring processes for each candidate for this job position,
      // including their stages and stage notes so the AI can factor in HR evaluator assessments
      const hiringProcesses = await this.databaseService.hiringProcess.findMany({
        where: {
          jobPositionId: jobPosition.id,
          candidateId: { in: candidates.map((c) => c.id) },
        },
        include: {
          stages: {
            where: { deletedAt: null },
            orderBy: { position: 'asc' },
            include: {
              notes: {
                include: {
                  author: { select: { name: true } },
                },
              },
            },
          },
        },
      });

      // Build a lookup map: candidateId → hiring process with stages + notes
      const hiringProcessByCandidateId = new Map(hiringProcesses.map((hp) => [hp.candidateId, hp]));

      // Generate AI comparison
      const aiComparison = await this.generateAIComparison(candidates, jobPosition, hiringProcessByCandidateId);

      // Build response
      const candidatesComparison: CandidateComparisonSummary[] = aiComparison.candidates.map((candidate, index) => ({
        candidateUid: candidate.candidateUid,
        candidateName: candidate.candidateName,
        overallScore: candidate.overallScore,
        skillsScore: candidate.skillsScore,
        experienceScore: candidate.experienceScore,
        educationScore: candidate.educationScore,
        strengths: candidate.strengths,
        weaknesses: candidate.weaknesses,
        rank: index + 1,
      }));

      return {
        jobPositionUid: jobPosition.uid,
        jobPositionTitle: jobPosition.title,
        totalCandidates: candidates.length,
        candidates: candidatesComparison,
        comparisonAnalysis: aiComparison.analysis,
        comparedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Candidate comparison failed: ${error.message}`, error.stack);

      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error;
      }

      throw new InternalServerErrorException(`Failed to compare candidates: ${error.message}`);
    }
  }

  /**
   * Generate AI-powered scoring using Gemini
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
    const systemInstruction = `You are an expert HR recruiter and candidate evaluator. Your task is to analyze candidates against job position requirements and provide objective, detailed scoring and analysis. Always return valid JSON that matches the requested schema exactly. Be fair and thorough in your evaluation.`;

    const prompt = `Analyze the following candidate against the job position requirements and provide a detailed scoring and analysis.

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
}`;

    interface AIScoreResponse {
      scores: {
        skills: number;
        experience: number;
        education: number;
        overall: number;
      };
      analysis: {
        skillsAnalysis: string;
        experienceAnalysis: string;
        educationAnalysis: string;
        recommendation: string;
        strengths: string[];
        concerns: string[];
      };
    }

    try {
      const { data } = await this.geminiService.generateJsonContent<AIScoreResponse>(prompt, systemInstruction);

      // Validate and normalize scores (ensure they're within 0-100 range)
      const normalizeScore = (score: number): number => Math.max(0, Math.min(100, Math.round(score)));

      return {
        scores: {
          skills: normalizeScore(data.scores?.skills || 0),
          experience: normalizeScore(data.scores?.experience || 0),
          education: normalizeScore(data.scores?.education || 0),
          overall: normalizeScore(data.scores?.overall || 0),
        },
        analysis: {
          skillsAnalysis: data.analysis?.skillsAnalysis || 'No analysis available',
          experienceAnalysis: data.analysis?.experienceAnalysis || 'No analysis available',
          educationAnalysis: data.analysis?.educationAnalysis || 'No analysis available',
          recommendation: data.analysis?.recommendation || 'Not Recommended',
          strengths: data.analysis?.strengths || [],
          concerns: data.analysis?.concerns || [],
        },
      };
    } catch (error) {
      this.logger.error(`Gemini AI scoring failed: ${error.message}`, error.stack);
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

  /**
   * Check AI quota for a single candidate scoring operation.
   * If no quota record exists for the company, the operation is allowed.
   */
  private async checkSingleScoringQuota(companyId: number): Promise<void> {
    const quota = await this.databaseService.aIQuota.findUnique({
      where: {
        companyId_quotaType: {
          companyId,
          quotaType: QuotaType.CANDIDATE_SCORING,
        },
      },
    });

    if (!quota) {
      this.logger.warn(`No AI quota record found for company ${companyId} and type CANDIDATE_SCORING. Allowing operation.`);
      return;
    }

    if (quota.used + 1 > quota.limit) {
      throw new BadRequestException('AI scoring quota exceeded for this month');
    }
  }

  /**
   * Increment the used count for single candidate scoring after a successful AI call.
   */
  private async incrementSingleScoringQuota(companyId: number): Promise<void> {
    try {
      await this.databaseService.aIQuota.update({
        where: {
          companyId_quotaType: {
            companyId,
            quotaType: QuotaType.CANDIDATE_SCORING,
          },
        },
        data: {
          used: { increment: 1 },
        },
      });
    } catch (error) {
      // If the quota record was deleted between check and increment, log but do not fail the request
      this.logger.error(`Failed to increment AI quota for company ${companyId}: ${error.message}`);
    }
  }

  /**
   * Generate AI-powered candidate comparison using Gemini
   */
  private async generateAIComparison(
    candidates: any[],
    jobPosition: any,
    hiringProcessByCandidateId: Map<number | null, any>,
  ): Promise<{
    candidates: CandidateComparisonSummary[];
    analysis: ComparisonAnalysis;
  }> {
    const systemInstruction = `You are an expert HR recruiter specialized in candidate comparison and evaluation. Your task is to compare multiple candidates for a job position and provide objective, detailed analysis. Always return valid JSON that matches the requested schema exactly. Be thorough, fair, and highlight both strengths and weaknesses for each candidate.`;

    // Build candidate profiles for the prompt, including HR evaluator stage notes
    const candidateProfiles = candidates
      .map((candidate, index) => {
        const hiringProcess = hiringProcessByCandidateId.get(candidate.id);

        // Build stage notes section if any stages have notes
        let stageNotesSection = '';
        if (hiringProcess?.stages?.length) {
          const stagesWithNotes = hiringProcess.stages.filter((s: any) => s.notes?.length > 0);
          if (stagesWithNotes.length > 0) {
            const noteLines = stagesWithNotes.map((stage: any) => {
              const note = stage.notes[0]; // One note per stage
              const ratingStr = note.rating ? ` (Rating: ${note.rating}/5)` : '';
              return `  - ${stage.title}: "${note.content}"${ratingStr}`;
            });
            stageNotesSection = `\n- HR Evaluator Notes:\n${noteLines.join('\n')}`;
          }
        }

        return `
**Candidate ${index + 1}: ${candidate.name}**
- Email: ${candidate.email}
- Source: ${candidate.source || 'Unknown'}
- Additional Info: ${candidate.sourceDetails || 'No additional info'}
- Number of files: ${candidate.files?.length || 0}
- Number of general notes: ${candidate.notes?.length || 0}${stageNotesSection}
`;
      })
      .join('\n');

    const prompt = `Compare the following candidates for the job position and provide a comprehensive comparative analysis.

**Job Position:**
Title: ${jobPosition.title}
Description: ${jobPosition.description || 'No description provided'}

**Candidates to Compare:**
${candidateProfiles}

IMPORTANT: When a candidate has "HR Evaluator Notes" listed above, these are assessments from the hiring team recorded at specific recruitment stages. Each note may include a 1-5 star rating reflecting the evaluator's overall impression at that stage. Factor these evaluator assessments meaningfully into your scoring and analysis — positive notes with high ratings should boost the candidate's scores, while negative notes or low ratings should lower them relative to other candidates.

Please provide a detailed comparison with the following structure:

1. For each candidate, provide:
   - **Skills Score (0-100)**: Rate the candidate's technical and professional skills match
   - **Experience Score (0-100)**: Rate the candidate's relevant work experience
   - **Education Score (0-100)**: Rate the candidate's educational qualifications
   - **Overall Score (0-100)**: Calculate weighted overall (40% skills, 35% experience, 25% education). Adjust scores to reflect HR evaluator notes and ratings if present.
   - **Strengths**: List 3-5 key strengths specific to this candidate (include evaluator observations if relevant)
   - **Weaknesses**: List 2-4 potential gaps or concerns (include evaluator concerns if relevant)

2. Provide comparative analysis:
   - **Summary**: Brief overview comparing all candidates (mention if HR notes influenced the assessment)
   - **Top Candidate**: Identify the strongest candidate and explain why
   - **Key Differentiators**: List 3-5 factors that distinguish candidates from each other
   - **Final Recommendation**: Detailed hiring recommendation including primary and backup candidates

Return a JSON object with this exact structure (candidates MUST be sorted by overallScore descending):
{
  "candidates": [
    {
      "candidateUid": "string (use actual UID)",
      "candidateName": "string",
      "overallScore": number,
      "skillsScore": number,
      "experienceScore": number,
      "educationScore": number,
      "strengths": ["string", ...],
      "weaknesses": ["string", ...]
    },
    ...
  ],
  "analysis": {
    "summary": "string",
    "topCandidateUid": "string (UID of highest scoring candidate)",
    "topCandidateName": "string",
    "recommendationReason": "string",
    "keyDifferentiators": ["string", ...],
    "finalRecommendation": "string"
  }
}`;

    interface AIComparisonResponse {
      candidates: {
        candidateUid: string;
        candidateName: string;
        overallScore: number;
        skillsScore: number;
        experienceScore: number;
        educationScore: number;
        strengths: string[];
        weaknesses: string[];
      }[];
      analysis: {
        summary: string;
        topCandidateUid: string;
        topCandidateName: string;
        recommendationReason: string;
        keyDifferentiators: string[];
        finalRecommendation: string;
      };
    }

    try {
      const { data } = await this.geminiService.generateJsonContent<AIComparisonResponse>(prompt, systemInstruction);

      // Validate and normalize scores
      const normalizeScore = (score: number): number => Math.max(0, Math.min(100, Math.round(score)));

      // Sort candidates by overall score descending
      const sortedCandidates = (data.candidates || [])
        .map((candidate) => ({
          candidateUid: candidate.candidateUid,
          candidateName: candidate.candidateName,
          overallScore: normalizeScore(candidate.overallScore || 0),
          skillsScore: normalizeScore(candidate.skillsScore || 0),
          experienceScore: normalizeScore(candidate.experienceScore || 0),
          educationScore: normalizeScore(candidate.educationScore || 0),
          strengths: candidate.strengths || [],
          weaknesses: candidate.weaknesses || [],
          rank: 0, // Will be set after sorting
        }))
        .sort((a, b) => b.overallScore - a.overallScore);

      // Find top candidate
      const topCandidate = sortedCandidates[0];

      return {
        candidates: sortedCandidates,
        analysis: {
          summary: data.analysis?.summary || 'No comparison summary available',
          topCandidateUid: topCandidate?.candidateUid || '',
          topCandidateName: topCandidate?.candidateName || '',
          recommendationReason: data.analysis?.recommendationReason || 'No recommendation available',
          keyDifferentiators: data.analysis?.keyDifferentiators || [],
          finalRecommendation: data.analysis?.finalRecommendation || 'No final recommendation available',
        },
      };
    } catch (error) {
      this.logger.error(`Gemini AI comparison failed: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Failed to generate AI comparison: ${error.message}`);
    }
  }
}
