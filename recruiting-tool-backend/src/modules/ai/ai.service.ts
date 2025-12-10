import { Injectable, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as mammoth from 'mammoth';
import { ParseResumeResponseDto, ParsedResumeDataDto } from './dto/parse-resume.dto';

// Lazy load pdf-parse to avoid DOMMatrix issues in Node.js
// This defers loading until the function is actually called
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
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private configService: ConfigService) {
    this.logger.warn('AI features are currently disabled. Gemini integration will be added in the future.');
  }

  /**
   * Parse a resume from a file URL and extract structured data using AI
   */
  async parseResume(fileUrl: string): Promise<ParseResumeResponseDto> {
    throw new InternalServerErrorException('AI API is not configured. Gemini integration will be added in the future.');

    try {
      this.logger.log(`Starting resume parsing for file: ${fileUrl}`);

      // Step 1: Extract text from the file
      const rawText = await this.extractTextFromFile(fileUrl);

      if (!rawText || rawText.trim().length === 0) {
        throw new BadRequestException('Could not extract text from the resume file');
      }

      // Step 2: Analyze with AI
      const parsedData = await this.analyzeResumeWithAI(rawText);

      // Step 3: Calculate confidence score based on completeness
      const confidence = this.calculateConfidence(parsedData);

      this.logger.log(`Resume parsing completed with confidence: ${confidence}%`);

      return {
        success: true,
        parsedData,
        confidence,
        rawText,
      };
    } catch (error) {
      this.logger.error(`Resume parsing failed: ${error.message}`, error.stack);

      if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error;
      }

      throw new InternalServerErrorException(`Failed to parse resume: ${error.message}`);
    }
  }

  /**
   * Extract text from a file (supports PDF, DOCX, TXT)
   */
  private async extractTextFromFile(fileUrl: string): Promise<string> {
    try {
      // Download the file
      const response = await axios.get(fileUrl, {
        responseType: 'arraybuffer',
      });

      const buffer = Buffer.from(response.data);
      const contentType = response.headers['content-type'] || '';

      // Determine file type and extract text accordingly
      if (contentType.includes('pdf') || fileUrl.toLowerCase().endsWith('.pdf')) {
        return await this.extractTextFromPdf(buffer);
      } else if (contentType.includes('word') || contentType.includes('document') || fileUrl.toLowerCase().endsWith('.docx') || fileUrl.toLowerCase().endsWith('.doc')) {
        return await this.extractTextFromDocx(buffer);
      } else if (contentType.includes('text') || fileUrl.toLowerCase().endsWith('.txt')) {
        return buffer.toString('utf-8');
      } else {
        throw new BadRequestException('Unsupported file format. Please upload PDF, DOCX, or TXT files.');
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to download or process file: ${error.message}`);
    }
  }

  /**
   * Extract text from PDF buffer
   */
  private async extractTextFromPdf(buffer: Buffer): Promise<string> {
    try {
      const parsePdf = await loadPdfParse();
      const data = await parsePdf(buffer);
      return data.text;
    } catch (error) {
      throw new BadRequestException(`Failed to parse PDF: ${(error as Error).message}`);
    }
  }

  /**
   * Extract text from DOCX buffer
   */
  private async extractTextFromDocx(buffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (error) {
      throw new BadRequestException(`Failed to parse DOCX: ${error.message}`);
    }
  }

  /**
   * Analyze resume text with AI and extract structured data
   */
  private async analyzeResumeWithAI(text: string): Promise<ParsedResumeDataDto> {
    throw new InternalServerErrorException('AI analysis is not configured. Gemini integration will be added in the future.');

    const prompt = `
You are a professional resume parser. Analyze the following resume text and extract structured information.
Return a JSON object with the following structure (use null for missing fields):

{
  "fullName": "string or null",
  "email": "string or null",
  "phone": "string or null",
  "skills": ["array of skill strings"],
  "experience": [
    {
      "company": "string",
      "title": "string",
      "startDate": "YYYY-MM format or null",
      "endDate": "YYYY-MM format or null (use 'Present' if currently employed)",
      "description": "string or null"
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string or null",
      "graduationDate": "YYYY-MM format or null"
    }
  ],
  "summary": "professional summary or null",
  "languages": ["array of language strings or empty array"],
  "certifications": ["array of certification strings or empty array"]
}

Resume text:
${text}

IMPORTANT: Return ONLY valid JSON, no additional text or explanation.
`;

    // AI integration code removed - will be replaced with Gemini
  }

  /**
   * Calculate confidence score based on data completeness
   */
  private calculateConfidence(data: ParsedResumeDataDto): number {
    let score = 0;
    let maxScore = 0;

    // Essential fields (higher weight)
    maxScore += 20;
    if (data.fullName) score += 20;

    maxScore += 20;
    if (data.email) score += 20;

    maxScore += 15;
    if (data.phone) score += 15;

    // Important fields (medium weight)
    maxScore += 15;
    if (data.skills && data.skills.length > 0) score += 15;

    maxScore += 15;
    if (data.experience && data.experience.length > 0) score += 15;

    maxScore += 10;
    if (data.education && data.education.length > 0) score += 10;

    // Optional fields (lower weight)
    maxScore += 5;
    if (data.summary) score += 5;

    const confidence = Math.round((score / maxScore) * 100);
    return Math.min(100, Math.max(0, confidence));
  }
}
