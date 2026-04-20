import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../shared/modules/database/database.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class AsyncStageReminderService {
  private readonly logger = new Logger(AsyncStageReminderService.name);

  constructor(
    private readonly prisma: DatabaseService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  @Cron('0 9 * * *')
  async sendSubmissionReminders(): Promise<void> {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    this.logger.log('Running async stage submission reminder job...');

    // Find all submitted token IDs so we can exclude them
    const submittedTokenIds = (
      await this.prisma.asyncStageSubmission.findMany({
        select: { tokenId: true },
      })
    ).map((s) => s.tokenId);

    const tokensToRemind = await this.prisma.asyncStageToken.findMany({
      where: {
        usedAt: null,
        revokedAt: null,
        expiresAt: {
          gte: in24h,
          lte: in48h,
        },
        ...(submittedTokenIds.length > 0 ? { id: { notIn: submittedTokenIds } } : {}),
      },
      include: {
        stage: {
          include: {
            JobPosition: {
              include: { company: true },
            },
          },
        },
        hiringProcess: {
          include: { candidate: true },
        },
      },
    });

    this.logger.log(`Found ${tokensToRemind.length} candidates to remind`);

    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');

    for (const tokenRecord of tokensToRemind) {
      const submissionUrl = `${frontendUrl}/submit/${tokenRecord.token}`;
      const formattedDeadline = tokenRecord.expiresAt
        ? tokenRecord.expiresAt.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : undefined;

      try {
        await this.emailService.sendAsyncStageInvitation(tokenRecord.candidateEmail, {
          candidateName: tokenRecord.candidateName,
          jobTitle: tokenRecord.stage.JobPosition?.title ?? '',
          companyName: tokenRecord.stage.JobPosition?.company.name ?? '',
          stageName: tokenRecord.stage.title,
          stageDescription: tokenRecord.stage.description ?? undefined,
          submissionUrl,
          deadline: formattedDeadline,
          isReminder: true,
        });
        this.logger.log(`Sent reminder to ${tokenRecord.candidateEmail} for stage ${tokenRecord.stage.uid}`);
      } catch (err) {
        this.logger.error(`Failed to send reminder to ${tokenRecord.candidateEmail}: ${(err as Error).message}`);
      }
    }
  }
}
