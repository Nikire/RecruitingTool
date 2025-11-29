import { Injectable, Logger } from '@nestjs/common';
import { CandidateCreatedWebhookDto, InterviewScheduledWebhookDto, StageChangedWebhookDto, ApplicationStatusChangedWebhookDto } from './dto/webhook.dto';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  /**
   * Process candidate created webhook
   * This can be used by n8n to trigger workflows when a new candidate is created
   */
  async processCandidateCreated(data: CandidateCreatedWebhookDto): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Processing candidate created webhook for: ${data.candidateName}`);

    // Log the webhook data for debugging (development only)
    if (process.env.NODE_ENV === 'development') {
      this.logger.debug(`Candidate UID: ${data.candidateUid}`);
      this.logger.debug(`Candidate Email: ${data.candidateEmail}`);
    }

    // Here you can add any additional processing logic
    // For example: send to analytics, update external systems, etc.

    return {
      success: true,
      message: `Candidate created webhook processed for ${data.candidateName}`,
    };
  }

  /**
   * Process interview scheduled webhook
   * This can be used by n8n to trigger workflows when an interview is scheduled
   */
  async processInterviewScheduled(data: InterviewScheduledWebhookDto): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Processing interview scheduled webhook for: ${data.candidateName}`);

    if (process.env.NODE_ENV === 'development') {
      this.logger.debug(`Interview UID: ${data.interviewUid}`);
      this.logger.debug(`Scheduled at: ${data.scheduledAt}`);
      this.logger.debug(`Interview type: ${data.interviewType}`);
    }

    // Example use cases for n8n:
    // - Send calendar invites
    // - Send reminder emails 24h before
    // - Update external calendars
    // - Notify Slack/Teams channels
    // - Update CRM systems

    return {
      success: true,
      message: `Interview scheduled webhook processed for ${data.candidateName}`,
    };
  }

  /**
   * Process stage changed webhook
   * This can be used by n8n to trigger workflows when a candidate moves between stages
   */
  async processStageChanged(data: StageChangedWebhookDto): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Processing stage changed webhook for: ${data.candidateName}`);

    if (process.env.NODE_ENV === 'development') {
      this.logger.debug(`Previous stage: ${data.previousStage}`);
      this.logger.debug(`New stage: ${data.newStage}`);
    }

    // Example use cases for n8n:
    // - Send stage-specific emails to candidates
    // - Update analytics dashboards
    // - Trigger stage-specific tasks
    // - Notify hiring managers
    // - Update external systems (CRM, ATS, etc.)

    return {
      success: true,
      message: `Stage changed webhook processed for ${data.candidateName}`,
    };
  }

  /**
   * Process application status changed webhook
   * This can be used by n8n to trigger workflows when application status changes
   */
  async processApplicationStatusChanged(data: ApplicationStatusChangedWebhookDto): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Processing application status changed webhook for: ${data.candidateName}`);

    if (process.env.NODE_ENV === 'development') {
      this.logger.debug(`Previous status: ${data.previousStatus}`);
      this.logger.debug(`New status: ${data.newStatus}`);
    }

    // Example use cases for n8n:
    // - Send acceptance/rejection emails
    // - Trigger onboarding workflows
    // - Update HR systems
    // - Send offer letters
    // - Schedule orientation meetings

    return {
      success: true,
      message: `Application status changed webhook processed for ${data.candidateName}`,
    };
  }

  /**
   * Get webhook statistics and health check
   */
  async getWebhookHealth(): Promise<{
    status: string;
    webhooksAvailable: string[];
  }> {
    return {
      status: 'healthy',
      webhooksAvailable: ['candidate-created', 'interview-scheduled', 'stage-changed', 'application-status-changed'],
    };
  }
}
