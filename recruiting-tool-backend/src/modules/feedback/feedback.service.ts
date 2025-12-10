import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { DatabaseService } from '../shared/modules/database/database.service';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import { CreateFeedbackDto, FeedbackResponseDto } from './dto';

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  constructor(
    private databaseService: DatabaseService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  /**
   * Create a new feedback submission
   */
  async create(dto: CreateFeedbackDto, userUid: string): Promise<FeedbackResponseDto> {
    this.logger.log(`Creating feedback from user ${userUid}`);

    // Find user by UID
    const user = await this.databaseService.user.findUnique({
      where: { uid: userUid },
      include: {
        company: {
          select: {
            id: true,
            uid: true,
            name: true,
            users: {
              where: {
                OR: [
                  { roles: { has: 'SUPER_ADMIN' } },
                  { roles: { has: 'ADMIN' } },
                ],
              },
              select: {
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with UID ${userUid} not found`);
    }

    if (!user.company) {
      throw new NotFoundException(`User does not belong to a company`);
    }

    // Create feedback
    const feedback = await this.databaseService.feedback.create({
      data: {
        content: dto.content,
        category: dto.category,
        rating: dto.rating,
        userId: user.id,
        companyId: user.company.id,
      },
      include: {
        user: {
          select: {
            uid: true,
            name: true,
          },
        },
        company: {
          select: {
            uid: true,
            name: true,
          },
        },
      },
    });

    // Send email notification to admins (async, don't wait)
    this.sendAdminNotification(user, feedback, user.company).catch((error) => {
      this.logger.error(`Failed to send admin notification: ${error.message}`);
    });

    return this.mapToResponseDto(feedback);
  }

  /**
   * Get all feedback for a company (admin only)
   */
  async findAll(companyUid: string): Promise<FeedbackResponseDto[]> {
    this.logger.log(`Fetching feedback for company ${companyUid}`);

    const company = await this.databaseService.company.findUnique({
      where: { uid: companyUid },
    });

    if (!company) {
      throw new NotFoundException(`Company with UID ${companyUid} not found`);
    }

    const feedback = await this.databaseService.feedback.findMany({
      where: { companyId: company.id },
      include: {
        user: {
          select: {
            uid: true,
            name: true,
          },
        },
        company: {
          select: {
            uid: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return feedback.map(this.mapToResponseDto);
  }

  /**
   * Get user's own feedback submissions
   */
  async findUserFeedback(userUid: string): Promise<FeedbackResponseDto[]> {
    this.logger.log(`Fetching feedback for user ${userUid}`);

    const user = await this.databaseService.user.findUnique({
      where: { uid: userUid },
    });

    if (!user) {
      throw new NotFoundException(`User with UID ${userUid} not found`);
    }

    const feedback = await this.databaseService.feedback.findMany({
      where: { userId: user.id },
      include: {
        user: {
          select: {
            uid: true,
            name: true,
          },
        },
        company: {
          select: {
            uid: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return feedback.map(this.mapToResponseDto);
  }

  /**
   * Send email notification to company admins
   */
  private async sendAdminNotification(user: any, feedback: any, company: any): Promise<void> {
    const emailsEnabled = this.configService.get<string>('SMTP_ENABLED', 'false') === 'true';

    if (!emailsEnabled) {
      this.logger.log('SMTP disabled - skipping admin notification');
      return;
    }

    // Get admin emails from company
    const adminEmails = company.users.map((u: any) => u.email).filter((email: string) => email);

    if (adminEmails.length === 0) {
      this.logger.warn(`No admin emails found for company ${company.name}`);
      return;
    }

    const categoryLabel =
      feedback.category === 'FEATURE_REQUEST'
        ? 'Feature Request'
        : feedback.category === 'BUG_REPORT'
        ? 'Bug Report'
        : 'General Feedback';

    const subject = `New Feedback Received: ${categoryLabel}`;

    const text = `
New Feedback Submission

Company: ${company.name}
From: ${user.name}
Category: ${categoryLabel}
${feedback.rating ? `Rating: ${feedback.rating}/5` : ''}

Feedback:
${feedback.content}

Submitted: ${new Date().toLocaleString()}
    `.trim();

    const html = `
      <h2>New Feedback Submission</h2>
      <p><strong>Company:</strong> ${company.name}</p>
      <p><strong>From:</strong> ${user.name}</p>
      <p><strong>Category:</strong> <span style="color: ${this.getCategoryColor(feedback.category)};">${categoryLabel}</span></p>
      ${feedback.rating ? `<p><strong>Rating:</strong> ${'⭐'.repeat(feedback.rating)} (${feedback.rating}/5)</p>` : ''}
      <hr/>
      <h3>Feedback:</h3>
      <p style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${feedback.content}</p>
      <hr/>
      <p style="color: #666; font-size: 12px;">Submitted: ${new Date().toLocaleString()}</p>
    `;

    // Send to all admins
    for (const email of adminEmails) {
      try {
        await this.emailService['sendEmail'](email, subject, text, html, 'FEEDBACK_NOTIFICATION', feedback.uid);
        this.logger.log(`Feedback notification sent to ${email}`);
      } catch (error) {
        this.logger.error(`Failed to send feedback notification to ${email}: ${error.message}`);
      }
    }
  }

  /**
   * Get color for feedback category
   */
  private getCategoryColor(category: string): string {
    switch (category) {
      case 'FEATURE_REQUEST':
        return '#2196F3'; // Blue
      case 'BUG_REPORT':
        return '#F44336'; // Red
      case 'GENERAL':
        return '#4CAF50'; // Green
      default:
        return '#757575'; // Gray
    }
  }

  /**
   * Map Prisma feedback to response DTO
   */
  private mapToResponseDto(feedback: any): FeedbackResponseDto {
    return {
      uid: feedback.uid,
      content: feedback.content,
      category: feedback.category,
      rating: feedback.rating,
      userUid: feedback.user.uid,
      userName: feedback.user.name,
      companyUid: feedback.company.uid,
      companyName: feedback.company.name,
      createdAt: feedback.createdAt,
      updatedAt: feedback.updatedAt,
    };
  }
}
