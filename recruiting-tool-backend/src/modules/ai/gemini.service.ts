import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerateContentResult } from '@google/generative-ai';

/**
 * Rate limit configuration for Gemini API
 * Free tier: 15 requests per minute (RPM), 1500 requests per day
 * Paid tier: 360 RPM, unlimited requests per day
 */
interface RateLimitConfig {
  requestsPerMinute: number;
  minDelayBetweenRequests: number; // in milliseconds
  maxRetries: number;
  baseBackoffMs: number; // base delay for exponential backoff
}

interface TokenUsage {
  promptTokens: number;
  candidatesTokens: number;
  totalTokens: number;
}

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private genAI: GoogleGenerativeAI | null = null;
  private rateLimitConfig: RateLimitConfig;
  private requestTimestamps: number[] = [];
  private totalTokensUsed = 0;
  private requestCount = 0;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');

    if (!apiKey) {
      this.logger.warn('Gemini API key not configured. AI scoring features will be disabled.');
      this.genAI = null;
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.logger.log('Gemini AI service initialized successfully');
    }

    // Configure rate limits (conservative settings for free tier)
    const tier = this.configService.get<string>('GEMINI_TIER') || 'free';
    this.rateLimitConfig = this.getRateLimitConfig(tier);

    this.logger.log(`Gemini rate limit config: ${JSON.stringify(this.rateLimitConfig)}`);
  }

  /**
   * Get rate limit configuration based on tier
   */
  private getRateLimitConfig(tier: string): RateLimitConfig {
    if (tier === 'paid') {
      return {
        requestsPerMinute: 360,
        minDelayBetweenRequests: 167, // ~360 RPM = 1 request per 167ms
        maxRetries: 5,
        baseBackoffMs: 1000,
      };
    }

    // Free tier (conservative to avoid hitting limits)
    return {
      requestsPerMinute: 12, // Conservative: 12 RPM instead of 15
      minDelayBetweenRequests: 5000, // 5 seconds between requests
      maxRetries: 3,
      baseBackoffMs: 2000,
    };
  }

  /**
   * Check if API is configured
   */
  isConfigured(): boolean {
    return this.genAI !== null;
  }

  /**
   * Generate content using Gemini with rate limiting and retry logic
   */
  async generateContent(prompt: string, systemInstruction?: string): Promise<{ content: string; tokenUsage: TokenUsage }> {
    if (!this.genAI) {
      throw new InternalServerErrorException('Gemini API is not configured. Please set GEMINI_API_KEY in environment variables.');
    }

    const model = this.configService.get<string>('GEMINI_MODEL') || 'gemini-1.5-flash';

    let lastError: Error;

    for (let attempt = 1; attempt <= this.rateLimitConfig.maxRetries; attempt++) {
      try {
        // Wait for rate limit
        await this.waitForRateLimit();

        // Get the model
        const generativeModel = this.genAI.getGenerativeModel({
          model: model,
          systemInstruction: systemInstruction,
        });

        this.logger.log(`Gemini API request attempt ${attempt}/${this.rateLimitConfig.maxRetries}`);

        // Generate content
        const result: GenerateContentResult = await generativeModel.generateContent(prompt);
        const response = result.response;

        // Extract content
        const content = response.text();

        // Track token usage
        const tokenUsage: TokenUsage = {
          promptTokens: response.usageMetadata?.promptTokenCount || 0,
          candidatesTokens: response.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: response.usageMetadata?.totalTokenCount || 0,
        };

        this.totalTokensUsed += tokenUsage.totalTokens;
        this.requestCount++;

        this.logger.log(`Gemini API success (attempt ${attempt}). Tokens: ${tokenUsage.totalTokens}, Total used: ${this.totalTokensUsed}, Total requests: ${this.requestCount}`);

        // Record successful request timestamp
        this.recordRequest();

        return { content, tokenUsage };
      } catch (error) {
        lastError = error;
        const errorMessage = error.message || 'Unknown error';

        this.logger.warn(`Gemini API error (attempt ${attempt}/${this.rateLimitConfig.maxRetries}): ${errorMessage}`);

        // Check if it's a rate limit error
        if (this.isRateLimitError(error)) {
          const backoffDelay = this.calculateExponentialBackoff(attempt);
          this.logger.log(`Rate limit hit. Backing off for ${backoffDelay}ms`);
          await this.sleep(backoffDelay);
          continue;
        }

        // Check if it's a retriable error
        if (this.isRetriableError(error)) {
          if (attempt < this.rateLimitConfig.maxRetries) {
            const backoffDelay = this.calculateExponentialBackoff(attempt);
            this.logger.log(`Transient error. Retrying after ${backoffDelay}ms`);
            await this.sleep(backoffDelay);
            continue;
          }
        }

        // Non-retriable error, throw immediately
        this.logger.error(`Gemini API non-retriable error: ${errorMessage}`, error.stack);
        throw new InternalServerErrorException(`Gemini API error: ${errorMessage}`);
      }
    }

    // All retries exhausted
    this.logger.error(`Gemini API failed after ${this.rateLimitConfig.maxRetries} attempts: ${lastError.message}`);
    throw new InternalServerErrorException(`Gemini API failed after ${this.rateLimitConfig.maxRetries} retries: ${lastError.message}`);
  }

  /**
   * Generate structured JSON content using Gemini
   */
  async generateJsonContent<T>(prompt: string, systemInstruction?: string): Promise<{ data: T; tokenUsage: TokenUsage }> {
    if (!this.genAI) {
      throw new InternalServerErrorException('Gemini API is not configured. Please set GEMINI_API_KEY in environment variables.');
    }

    const model = this.configService.get<string>('GEMINI_MODEL') || 'gemini-1.5-flash';

    let lastError: Error;

    for (let attempt = 1; attempt <= this.rateLimitConfig.maxRetries; attempt++) {
      try {
        // Wait for rate limit
        await this.waitForRateLimit();

        // Get the model with JSON response schema
        const generativeModel = this.genAI.getGenerativeModel({
          model: model,
          systemInstruction: systemInstruction,
          generationConfig: {
            responseMimeType: 'application/json',
          },
        });

        this.logger.log(`Gemini API JSON request attempt ${attempt}/${this.rateLimitConfig.maxRetries}`);

        // Generate content
        const result: GenerateContentResult = await generativeModel.generateContent(prompt);
        const response = result.response;

        // Extract and parse JSON content
        const content = response.text();
        const data = JSON.parse(content) as T;

        // Track token usage
        const tokenUsage: TokenUsage = {
          promptTokens: response.usageMetadata?.promptTokenCount || 0,
          candidatesTokens: response.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: response.usageMetadata?.totalTokenCount || 0,
        };

        this.totalTokensUsed += tokenUsage.totalTokens;
        this.requestCount++;

        this.logger.log(
          `Gemini API JSON success (attempt ${attempt}). Tokens: ${tokenUsage.totalTokens}, Total used: ${this.totalTokensUsed}, Total requests: ${this.requestCount}`,
        );

        // Record successful request timestamp
        this.recordRequest();

        return { data, tokenUsage };
      } catch (error) {
        lastError = error;
        const errorMessage = error.message || 'Unknown error';

        // Check if it's a JSON parsing error
        if (error instanceof SyntaxError) {
          this.logger.error(`Gemini API returned invalid JSON: ${errorMessage}`);
          throw new InternalServerErrorException('Gemini API returned invalid JSON response');
        }

        this.logger.warn(`Gemini API JSON error (attempt ${attempt}/${this.rateLimitConfig.maxRetries}): ${errorMessage}`);

        // Check if it's a rate limit error
        if (this.isRateLimitError(error)) {
          const backoffDelay = this.calculateExponentialBackoff(attempt);
          this.logger.log(`Rate limit hit. Backing off for ${backoffDelay}ms`);
          await this.sleep(backoffDelay);
          continue;
        }

        // Check if it's a retriable error
        if (this.isRetriableError(error)) {
          if (attempt < this.rateLimitConfig.maxRetries) {
            const backoffDelay = this.calculateExponentialBackoff(attempt);
            this.logger.log(`Transient error. Retrying after ${backoffDelay}ms`);
            await this.sleep(backoffDelay);
            continue;
          }
        }

        // Non-retriable error, throw immediately
        this.logger.error(`Gemini API non-retriable error: ${errorMessage}`, error.stack);
        throw new InternalServerErrorException(`Gemini API error: ${errorMessage}`);
      }
    }

    // All retries exhausted
    this.logger.error(`Gemini API failed after ${this.rateLimitConfig.maxRetries} attempts: ${lastError.message}`);
    throw new InternalServerErrorException(`Gemini API failed after ${this.rateLimitConfig.maxRetries} retries: ${lastError.message}`);
  }

  /**
   * Wait for rate limit before making request
   */
  private async waitForRateLimit(): Promise<void> {
    // Clean old timestamps (older than 1 minute)
    const oneMinuteAgo = Date.now() - 60000;
    this.requestTimestamps = this.requestTimestamps.filter((ts) => ts > oneMinuteAgo);

    // Check if we're at the rate limit
    if (this.requestTimestamps.length >= this.rateLimitConfig.requestsPerMinute) {
      const oldestTimestamp = this.requestTimestamps[0];
      const waitTime = 60000 - (Date.now() - oldestTimestamp) + 100; // Add 100ms buffer

      if (waitTime > 0) {
        this.logger.log(`Rate limit reached. Waiting ${waitTime}ms before next request`);
        await this.sleep(waitTime);
      }
    }

    // Also enforce minimum delay between requests
    if (this.requestTimestamps.length > 0) {
      const lastTimestamp = this.requestTimestamps[this.requestTimestamps.length - 1];
      const timeSinceLastRequest = Date.now() - lastTimestamp;

      if (timeSinceLastRequest < this.rateLimitConfig.minDelayBetweenRequests) {
        const waitTime = this.rateLimitConfig.minDelayBetweenRequests - timeSinceLastRequest;
        this.logger.log(`Enforcing minimum delay: waiting ${waitTime}ms`);
        await this.sleep(waitTime);
      }
    }
  }

  /**
   * Record request timestamp for rate limiting
   */
  private recordRequest(): void {
    this.requestTimestamps.push(Date.now());
  }

  /**
   * Check if error is a rate limit error
   */
  private isRateLimitError(error: any): boolean {
    const errorMessage = error.message || '';
    const errorCode = error.status || error.code || 0;

    // Common rate limit indicators
    return (
      errorCode === 429 ||
      errorCode === 'RESOURCE_EXHAUSTED' ||
      errorMessage.includes('rate limit') ||
      errorMessage.includes('quota exceeded') ||
      errorMessage.includes('too many requests') ||
      errorMessage.includes('RESOURCE_EXHAUSTED')
    );
  }

  /**
   * Check if error is retriable (transient)
   */
  private isRetriableError(error: any): boolean {
    const errorMessage = error.message || '';
    const errorCode = error.status || error.code || 0;

    // Retriable error codes and messages
    const retriableCodes = [500, 502, 503, 504, 'INTERNAL', 'UNAVAILABLE', 'DEADLINE_EXCEEDED'];

    return (
      retriableCodes.includes(errorCode) ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('network') ||
      errorMessage.includes('connection') ||
      errorMessage.includes('INTERNAL') ||
      errorMessage.includes('UNAVAILABLE')
    );
  }

  /**
   * Calculate exponential backoff delay
   */
  private calculateExponentialBackoff(attempt: number): number {
    // Exponential backoff: baseDelay * 2^(attempt - 1) + jitter
    const delay = this.rateLimitConfig.baseBackoffMs * Math.pow(2, attempt - 1);
    const jitter = Math.random() * 1000; // Add random jitter up to 1 second
    return Math.min(delay + jitter, 60000); // Cap at 60 seconds
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get usage statistics
   */
  getUsageStats(): { totalTokens: number; totalRequests: number; estimatedCost: number } {
    // Gemini pricing (approximate):
    // Free tier: $0
    // Paid tier: $0.00025 per 1K characters (prompt) + $0.0005 per 1K characters (response)
    // Rough estimate: $0.001 per 1K tokens
    const estimatedCost = (this.totalTokensUsed / 1000) * 0.001;

    return {
      totalTokens: this.totalTokensUsed,
      totalRequests: this.requestCount,
      estimatedCost,
    };
  }

  /**
   * Reset usage statistics
   */
  resetUsageStats(): void {
    this.totalTokensUsed = 0;
    this.requestCount = 0;
    this.logger.log('Usage statistics reset');
  }
}
