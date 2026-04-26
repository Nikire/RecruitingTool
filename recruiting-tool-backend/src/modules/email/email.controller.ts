import { Body, Controller, HttpCode, Logger, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { EmailService } from './email.service';

@ApiTags('Email')
@Controller('email')
export class EmailController {
  private readonly logger = new Logger(EmailController.name);

  constructor(private readonly emailService: EmailService) {}

  /**
   * Resend webhook endpoint — receives delivery events from Resend.
   * No auth required (Resend calls this from their infrastructure).
   * Route: POST /api/email/webhooks/resend
   */
  @Post('webhooks/resend')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Resend webhook receiver',
    description: 'Receives delivery event webhooks from Resend (email.delivered, email.opened, email.bounced, email.complained). No authentication required.',
  })
  async handleResendWebhook(@Body() body: any): Promise<{ ok: boolean }> {
    await this.emailService.handleResendWebhook(body);
    return { ok: true };
  }
}
