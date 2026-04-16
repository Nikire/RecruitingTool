import { Injectable, NotFoundException, InternalServerErrorException, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, QuotaType, SubscriptionPlan } from '@prisma/client';
import { Readable } from 'stream';
import { DatabaseService } from '../shared/modules/database/database.service';
import { PLAN_LIMITS } from '../quota/config/plan-limits.config';
import { CandidateScoreResponseDto, RankedCandidatesResponseDto, RankedCandidateDto, ScoreAnalysisDto } from './dto/candidate-scoring.dto';
import { CompareCandidatesResponseDto, CandidateComparisonSummary, ComparisonAnalysis } from './dto/candidate-comparison.dto';
import { UpdateScoringWeightsDto, ScoringWeightsResponseDto } from './dto/scoring-weights.dto';
import { SseService } from '../sse/sse.service';
import { GeminiService } from './gemini.service';
import { StorageService } from '../storage/storage.service';
import { AiService } from './ai.service';

// Lazy load pdf-parse to avoid DOMMatrix issues in Node.js
type PdfParseResult = { text: string; numpages: number; info: unknown };
type PdfParseFn = (buffer: Buffer) => Promise<PdfParseResult>;
let pdfParseFn: PdfParseFn | null = null;

const loadPdfParse = async (): Promise<PdfParseFn> => {
  if (!pdfParseFn) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pdfParseModule = await import('pdf-parse');
    pdfParseFn = pdfParseModule.default as unknown as PdfParseFn;
  }
  return pdfParseFn;
};

@Injectable()
export class ScoringService {
  private readonly logger = new Logger(ScoringService.name);

  constructor(
    private configService: ConfigService,
    private databaseService: DatabaseService,
    private sseService: SseService,
    private geminiService: GeminiService,
    private storageService: StorageService,
    private aiService: AiService,
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

      // Fetch candidate details with files and notes
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

      // Fetch hiring process with stages, notes, and time logs for this candidate + job
      const hiringProcess = await this.databaseService.hiringProcess.findFirst({
        where: {
          candidateId: candidate.id,
          jobPositionId: jobPosition.id,
        },
        include: {
          stages: {
            where: { deletedAt: null },
            orderBy: { position: 'asc' },
            include: {
              notes: {
                where: { deletedAt: null },
                include: {
                  author: { select: { name: true } },
                },
              },
              timeLogs: {
                orderBy: { enteredAt: 'asc' },
              },
            },
          },
          company: true,
        },
      });

      // Check if score already exists (update existing or create new)
      const existingScore = await this.databaseService.candidateScore.findUnique({
        where: {
          candidateId_jobPositionId: {
            candidateId: candidate.id,
            jobPositionId: jobPosition.id,
          },
        },
      });

      // Extract resume text from candidate files
      const resumeText = await this.extractCandidateResumeText(candidate.files);

      // Fetch company scoring weights (create defaults if not set)
      const weights = await this.getScoringWeights(jobPosition.companyId);

      // Generate AI scoring
      const { scores, analysis } = await this.generateAIScoring(candidate, jobPosition, hiringProcess, resumeText, weights);

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

      // Fetch all candidates with files
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
                where: { deletedAt: null },
                include: {
                  author: { select: { name: true } },
                },
              },
              timeLogs: {
                orderBy: { enteredAt: 'asc' },
              },
            },
          },
        },
      });

      // Build a lookup map: candidateId → hiring process with stages + notes
      const hiringProcessByCandidateId = new Map(hiringProcesses.map((hp) => [hp.candidateId, hp]));

      // Extract resume text for each candidate
      const resumeTextByCandidateId = new Map<number, string>();
      for (const candidate of candidates) {
        const text = await this.extractCandidateResumeText(candidate.files);
        resumeTextByCandidateId.set(candidate.id, text);
      }

      // Generate AI comparison
      const aiComparison = await this.generateAIComparison(candidates, jobPosition, hiringProcessByCandidateId, resumeTextByCandidateId);

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
   * Extract resume/CV text from a candidate's uploaded files.
   * Tries each file in order and returns the text of the first successfully parsed one.
   * Falls back to "No resume available" if no files exist or none can be parsed.
   */
  private async extractCandidateResumeText(files: { s3Key: string; mimetype: string; originalName: string }[]): Promise<string> {
    if (!files || files.length === 0) {
      return 'No resume available';
    }

    // Prefer PDF/DOCX/DOC/TXT files (resume-like)
    const resumeFiles = files.filter((f) => {
      const mime = f.mimetype.toLowerCase();
      const name = f.originalName.toLowerCase();
      return (
        mime.includes('pdf') ||
        mime.includes('word') ||
        mime.includes('document') ||
        mime.includes('text') ||
        name.endsWith('.pdf') ||
        name.endsWith('.docx') ||
        name.endsWith('.doc') ||
        name.endsWith('.txt')
      );
    });

    const filesToTry = resumeFiles.length > 0 ? resumeFiles : files;

    for (const file of filesToTry) {
      try {
        const stream = await this.storageService.downloadFile(file.s3Key);
        const buffer = await this.streamToBuffer(stream);

        const mime = file.mimetype.toLowerCase();
        const name = file.originalName.toLowerCase();

        let text = '';
        if (mime.includes('pdf') || name.endsWith('.pdf')) {
          text = await this.extractTextFromPdf(buffer);
        } else if (mime.includes('word') || mime.includes('document') || name.endsWith('.docx') || name.endsWith('.doc')) {
          text = await this.extractTextFromDocx(buffer);
        } else if (mime.includes('text') || name.endsWith('.txt')) {
          text = buffer.toString('utf-8');
        } else {
          // Try PDF parser as fallback
          try {
            text = await this.extractTextFromPdf(buffer);
          } catch {
            continue;
          }
        }

        if (text && text.trim().length > 0) {
          this.logger.log(`Successfully extracted resume text from file: ${file.originalName} (${text.length} chars)`);
          return text.trim();
        }
      } catch (err) {
        this.logger.warn(`Could not extract text from file ${file.originalName}: ${err.message}`);
      }
    }

    return 'No resume text could be extracted';
  }

  /**
   * Convert a Readable stream to a Buffer
   */
  private streamToBuffer(stream: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }

  /**
   * Extract text from a PDF buffer
   */
  private async extractTextFromPdf(buffer: Buffer): Promise<string> {
    const parsePdf = await loadPdfParse();
    const data = await parsePdf(buffer);
    return data.text;
  }

  /**
   * Extract text from a DOCX buffer
   */
  private async extractTextFromDocx(buffer: Buffer): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  /**
   * Build a human-readable stages history section for the AI prompt.
   * Includes stage status, duration from time logs, and all HR notes with ratings.
   */
  private buildStagesHistorySection(stages: any[]): string {
    if (!stages || stages.length === 0) {
      return 'No stage history available.';
    }

    return stages
      .map((stage, idx) => {
        const lines: string[] = [];
        lines.push(`Stage ${idx + 1}: ${stage.title} (${stage.type})`);
        lines.push(`  Status: ${stage.status}`);

        // Duration from time logs
        if (stage.timeLogs && stage.timeLogs.length > 0) {
          const firstLog = stage.timeLogs[0];
          const lastLog = stage.timeLogs[stage.timeLogs.length - 1];
          const enteredAt = firstLog.enteredAt ? new Date(firstLog.enteredAt).toISOString().slice(0, 10) : null;
          const exitedAt = lastLog.exitedAt ? new Date(lastLog.exitedAt).toISOString().slice(0, 10) : null;

          // Sum durations if available (duration is stored in minutes)
          const totalDurationMinutes = stage.timeLogs.reduce((sum: number, log: any) => sum + (log.duration || 0), 0);

          if (enteredAt) {
            lines.push(`  Entered: ${enteredAt}`);
          }
          if (exitedAt) {
            lines.push(`  Exited: ${exitedAt}`);
          }
          if (totalDurationMinutes > 0) {
            const days = Math.floor(totalDurationMinutes / (60 * 24));
            const hours = Math.floor((totalDurationMinutes % (60 * 24)) / 60);
            if (days > 0) {
              lines.push(`  Time in stage: ${days} day(s)${hours > 0 ? ` ${hours} hour(s)` : ''}`);
            } else {
              lines.push(`  Time in stage: ${hours} hour(s)`);
            }
          }
        }

        // Notes with star ratings
        if (stage.notes && stage.notes.length > 0) {
          lines.push('  HR Evaluator Notes:');
          for (const note of stage.notes) {
            const stars = '★'.repeat(note.rating || 0) + '☆'.repeat(5 - (note.rating || 0));
            const author = note.author?.name || 'Unknown';
            const date = new Date(note.createdAt).toISOString().slice(0, 10);
            lines.push(`    ${stars} [${author}, ${date}]: ${note.content}`);
          }
        } else {
          lines.push('  No notes for this stage.');
        }

        return lines.join('\n');
      })
      .join('\n\n');
  }

  /**
   * Build full job position details section for the AI prompt.
   */
  private buildJobPositionSection(jobPosition: any): string {
    const lines: string[] = [];
    lines.push(`Title: ${jobPosition.title}`);

    if (jobPosition.description) {
      lines.push(`Description: ${jobPosition.description}`);
    }

    if (jobPosition.requirements && jobPosition.requirements.length > 0) {
      lines.push(`Requirements:\n${jobPosition.requirements.map((r: string) => `  - ${r}`).join('\n')}`);
    }

    if (jobPosition.responsibilities && jobPosition.responsibilities.length > 0) {
      lines.push(`Responsibilities:\n${jobPosition.responsibilities.map((r: string) => `  - ${r}`).join('\n')}`);
    }

    if (jobPosition.skills && jobPosition.skills.length > 0) {
      lines.push(`Required Skills: ${jobPosition.skills.join(', ')}`);
    }

    if (jobPosition.experienceLevel) {
      lines.push(`Experience Level: ${jobPosition.experienceLevel}`);
    }

    if (jobPosition.educationLevel) {
      lines.push(`Education Level: ${jobPosition.educationLevel}`);
    }

    if (jobPosition.jobType) {
      lines.push(`Job Type: ${jobPosition.jobType}`);
    }

    if (jobPosition.workLocation) {
      lines.push(`Work Location: ${jobPosition.workLocation}`);
    }

    const locationParts = [jobPosition.city, jobPosition.state, jobPosition.country].filter(Boolean);
    if (locationParts.length > 0) {
      lines.push(`Location: ${locationParts.join(', ')}`);
    }

    if (jobPosition.salaryMin || jobPosition.salaryMax) {
      const currency = jobPosition.salaryCurrency || 'USD';
      const period = jobPosition.salaryPeriod || '';
      const salaryRange =
        jobPosition.salaryMin && jobPosition.salaryMax
          ? `${currency} ${jobPosition.salaryMin.toLocaleString()} - ${jobPosition.salaryMax.toLocaleString()} ${period}`
          : jobPosition.salaryMin
            ? `${currency} ${jobPosition.salaryMin.toLocaleString()}+ ${period}`
            : `Up to ${currency} ${jobPosition.salaryMax?.toLocaleString()} ${period}`;
      lines.push(`Salary: ${salaryRange}`);
    }

    if (jobPosition.benefits && jobPosition.benefits.length > 0) {
      lines.push(`Benefits: ${jobPosition.benefits.join(', ')}`);
    }

    if (jobPosition.tags && jobPosition.tags.length > 0) {
      lines.push(`Tags: ${jobPosition.tags.join(', ')}`);
    }

    return lines.join('\n');
  }

  /**
   * Generate AI-powered scoring using Gemini
   */
  private async generateAIScoring(
    candidate: any,
    jobPosition: any,
    hiringProcess: any,
    resumeText: string,
    weights: { skillsWeight: number; experienceWeight: number; educationWeight: number },
  ): Promise<{
    scores: {
      overall: number;
      skills: number;
      experience: number;
      education: number;
    };
    analysis: ScoreAnalysisDto;
  }> {
    const systemInstruction = `You are an expert HR recruiter and candidate evaluator. Your task is to analyze candidates against job position requirements and provide objective, detailed scoring and analysis. You have access to the candidate's full resume, their hiring stage history, and HR evaluator notes. Always return valid JSON that matches the requested schema exactly. Be fair and thorough in your evaluation. Scores range from 0 to 100 where 0 means completely incompatible and 100 means perfect match.`;

    const jobPositionSection = this.buildJobPositionSection(jobPosition);
    const stagesSection = hiringProcess ? this.buildStagesHistorySection(hiringProcess.stages) : 'No hiring process found for this candidate.';

    const prompt = `You are an expert HR evaluator. Score this candidate's compatibility with the job position on a scale from 0 to 100 across three dimensions.

## JOB POSITION
${jobPositionSection}

## CANDIDATE RESUME / CV
${resumeText}

## HIRING PROCESS STAGES HISTORY
${stagesSection}

## SCORING CRITERIA
Score each dimension from 0 to 100. 0 is a valid score for completely incompatible candidates:
- 0: No compatibility whatsoever
- 1-20: Very poor fit — major gaps in required skills/experience/education
- 21-40: Poor fit — significant mismatches with requirements
- 41-60: Moderate fit — meets some requirements but has notable gaps
- 61-80: Good fit — meets most requirements with only minor gaps
- 81-100: Excellent fit — strong match across all criteria

When HR evaluator notes are present with star ratings (1-5 stars):
- Notes with 4-5 stars should positively influence the overall score
- Notes with 1-2 stars should negatively influence the overall score
- Notes with 3 stars are neutral
- More time spent in a stage (without progression) may indicate difficulty

Please provide a comprehensive evaluation with the following structure:

1. **Skills Score (0-100)**: Rate the candidate's technical and professional skills match for this position based on their resume and HR notes.
2. **Experience Score (0-100)**: Rate the candidate's relevant work experience, progression through hiring stages, and evaluator observations.
3. **Education Score (0-100)**: Rate the candidate's educational qualifications and certifications.
4. **Overall Score (0-100)**: Calculate a weighted overall score (${weights.skillsWeight}% skills, ${weights.experienceWeight}% experience, ${weights.educationWeight}% education), adjusted by HR evaluator notes and ratings. Important: scores CAN be 0 if the candidate is completely incompatible. Do not use 10 as a floor — a score of 0 means zero compatibility.

Additionally, provide detailed analysis:
- **Skills Analysis**: What skills does the candidate have that match or don't match the position?
- **Experience Analysis**: How does their experience align with job requirements, and how did they perform through hiring stages?
- **Education Analysis**: Does their educational background fit the position?
- **Recommendation**: Overall assessment (Strongly Recommend, Recommend, Consider, Not Recommended)
- **Strengths**: List 3-5 key strengths derived from the resume and stage history
- **Concerns**: List any gaps or concerns from the resume and evaluator feedback

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
    "strengths": ["string", "string"],
    "concerns": ["string", "string"]
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

      // Validate and normalize scores (ensure they're within 0-100 range, no minimum clamping)
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
   * Get or create scoring weights for a company.
   * Defaults: 40% skills, 35% experience, 25% education.
   */
  async getScoringWeights(companyId: number): Promise<ScoringWeightsResponseDto> {
    let weights = await this.databaseService.companyScoringWeights.findUnique({ where: { companyId } });
    if (!weights) {
      weights = await this.databaseService.companyScoringWeights.create({
        data: { companyId, skillsWeight: 40, experienceWeight: 35, educationWeight: 25 },
      });
    }
    return {
      uid: weights.uid,
      skillsWeight: weights.skillsWeight,
      experienceWeight: weights.experienceWeight,
      educationWeight: weights.educationWeight,
      updatedAt: weights.updatedAt,
    };
  }

  /**
   * Update scoring weights for a company. Weights must sum to 100.
   */
  async updateScoringWeights(companyId: number, dto: UpdateScoringWeightsDto): Promise<ScoringWeightsResponseDto> {
    const total = dto.skillsWeight + dto.experienceWeight + dto.educationWeight;
    if (total !== 100) {
      throw new BadRequestException(`Weights must sum to 100. Current sum: ${total}`);
    }
    const weights = await this.databaseService.companyScoringWeights.upsert({
      where: { companyId },
      create: { companyId, ...dto },
      update: dto,
    });
    return {
      uid: weights.uid,
      skillsWeight: weights.skillsWeight,
      experienceWeight: weights.experienceWeight,
      educationWeight: weights.educationWeight,
      updatedAt: weights.updatedAt,
    };
  }

  /**
   * Check AI quota for a single candidate scoring operation.
   * If no quota record exists for the company, creates one based on the company's current plan limits.
   */
  private async checkSingleScoringQuota(companyId: number): Promise<void> {
    let quota = await this.databaseService.aIQuota.findUnique({
      where: {
        companyId_quotaType: {
          companyId,
          quotaType: QuotaType.CANDIDATE_SCORING,
        },
      },
    });

    if (!quota) {
      // Look up the company's plan to determine the correct limit
      const company = await this.databaseService.company.findUnique({
        where: { id: companyId },
        include: { subscription: true },
      });

      const plan = company?.subscription?.plan ?? SubscriptionPlan.FREE;
      const limits = PLAN_LIMITS[plan];
      const creditLimit = limits.aiScoringCreditsPerMonth;

      // -1 means unlimited — no quota enforcement needed
      if (creditLimit === -1) {
        return;
      }

      // Create the quota record so subsequent calls can track usage
      const resetDate = new Date();
      resetDate.setMonth(resetDate.getMonth() + 1, 1);
      resetDate.setHours(0, 0, 0, 0);

      quota = await this.databaseService.aIQuota.create({
        data: {
          companyId,
          quotaType: QuotaType.CANDIDATE_SCORING,
          limit: creditLimit,
          used: 0,
          resetDate,
        },
      });

      this.logger.log(`Created AI quota record for company ${companyId} (plan: ${plan}, limit: ${creditLimit})`);
    }

    // -1 means unlimited
    if (quota.limit === -1) {
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
    resumeTextByCandidateId: Map<number, string>,
  ): Promise<{
    candidates: CandidateComparisonSummary[];
    analysis: ComparisonAnalysis;
  }> {
    const systemInstruction = `You are an expert HR recruiter specialized in candidate comparison and evaluation. Your task is to compare multiple candidates for a job position and provide objective, detailed analysis. You have access to each candidate's full resume, hiring stage history, and HR evaluator notes. Always return valid JSON that matches the requested schema exactly. Be thorough, fair, and highlight both strengths and weaknesses for each candidate. Scores range from 0 to 100 where 0 means completely incompatible and 100 means perfect match.`;

    const jobPositionSection = this.buildJobPositionSection(jobPosition);

    // Build candidate profiles for the prompt, including resume text and HR evaluator stage notes
    const candidateProfiles = candidates
      .map((candidate, index) => {
        const hiringProcess = hiringProcessByCandidateId.get(candidate.id);
        const resumeText = resumeTextByCandidateId.get(candidate.id) || 'No resume available';

        // Build stages section
        const stagesSection = hiringProcess ? this.buildStagesHistorySection(hiringProcess.stages) : 'No hiring process found.';

        return `
**Candidate ${index + 1}: ${candidate.name}** (UID: ${candidate.uid})
Email: ${candidate.email}
Source: ${candidate.source || 'Unknown'}

Resume / CV:
${resumeText.length > 3000 ? resumeText.substring(0, 3000) + '\n[Resume truncated for brevity]' : resumeText}

Hiring Stage History:
${stagesSection}
`;
      })
      .join('\n---\n');

    const prompt = `Compare the following candidates for the job position and provide a comprehensive comparative analysis.

## JOB POSITION
${jobPositionSection}

## CANDIDATES TO COMPARE
${candidateProfiles}

IMPORTANT: When a candidate has "HR Evaluator Notes" listed above, these are assessments from the hiring team recorded at specific recruitment stages. Each note includes a 1-5 star rating (★ = 1 star, ★★★★★ = 5 stars) reflecting the evaluator's overall impression at that stage. Factor these evaluator assessments meaningfully into your scoring and analysis — positive notes with high ratings should boost the candidate's scores, while negative notes or low ratings should lower them relative to other candidates. Also consider the time candidates spent in each stage.

Please provide a detailed comparison with the following structure:

1. For each candidate, provide:
   - **Skills Score (0-100)**: Rate the candidate's technical and professional skills match based on resume and HR notes
   - **Experience Score (0-100)**: Rate the candidate's relevant work experience and hiring stage performance
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
      "candidateUid": "string (use actual UID from the profile above)",
      "candidateName": "string",
      "overallScore": number,
      "skillsScore": number,
      "experienceScore": number,
      "educationScore": number,
      "strengths": ["string"],
      "weaknesses": ["string"]
    }
  ],
  "analysis": {
    "summary": "string",
    "topCandidateUid": "string (UID of highest scoring candidate)",
    "topCandidateName": "string",
    "recommendationReason": "string",
    "keyDifferentiators": ["string"],
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

      // Validate and normalize scores (0-100, no minimum clamping)
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
