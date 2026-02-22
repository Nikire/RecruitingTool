import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { BatchSummaryDto } from './dto/batch-summary.dto';

@Injectable()
export class InternalService {
  private readonly logger = new Logger(InternalService.name);
  private readonly developerEmail = 'erikpastuszek@gmail.com';

  constructor(
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async sendBatchSummary(dto: BatchSummaryDto): Promise<{ message: string }> {
    const subject = `Batch Complete: ${dto.batchName}`;
    const { text, html } = this.buildBatchSummaryEmail(dto);

    this.logger.log(`Sending batch summary email for "${dto.batchName}" to ${this.developerEmail}`);

    await this.emailService['sendEmail'](this.developerEmail, subject, text, html, 'INTERNAL_BATCH_SUMMARY');

    return { message: 'Notification sent successfully' };
  }

  private buildBatchSummaryEmail(dto: BatchSummaryDto): { text: string; html: string } {
    const { batchName, issues, testingChecklist, additionalNotes } = dto;

    // Plain-text version
    const issueLines = issues.map((i) => `  #${i.number} — ${i.title} [${i.status}]`).join('\n');
    const checklistLines = testingChecklist.map((item) => `  [ ] ${item}`).join('\n');
    const notesSection = additionalNotes ? `\nAdditional Notes\n----------------\n${additionalNotes}\n` : '';

    const text = [
      `Batch Complete — ${batchName}`,
      '',
      'Completed Issues',
      '----------------',
      issueLines,
      '',
      'Testing Checklist',
      '-----------------',
      checklistLines,
      notesSection,
      'Borderless Dev Team',
    ]
      .join('\n')
      .trim();

    // HTML version
    const issueRows = issues
      .map(
        (i, idx) => `
        <tr style="background-color: ${idx % 2 === 0 ? '#f9f9f9' : '#ffffff'};">
          <td style="padding: 10px 14px; border-bottom: 1px solid #e0e0e0; color: #555; font-size: 14px;">#${i.number}</td>
          <td style="padding: 10px 14px; border-bottom: 1px solid #e0e0e0; font-size: 14px;">${this.escapeHtml(i.title)}</td>
          <td style="padding: 10px 14px; border-bottom: 1px solid #e0e0e0;">
            <span style="background-color: #e8f5e9; color: #2e7d32; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase;">${this.escapeHtml(i.status)}</span>
          </td>
        </tr>`,
      )
      .join('');

    const checklistItems = testingChecklist
      .map(
        (item) => `
        <li style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; display: flex; align-items: flex-start; gap: 10px; font-size: 14px; color: #333;">
          <span style="display: inline-block; width: 18px; height: 18px; border: 2px solid #1976d2; border-radius: 3px; flex-shrink: 0; margin-top: 1px;"></span>
          ${this.escapeHtml(item)}
        </li>`,
      )
      .join('');

    const notesHtml = additionalNotes
      ? `
      <div style="margin-top: 32px;">
        <h2 style="margin: 0 0 12px; font-size: 16px; font-weight: 700; color: #333; border-bottom: 2px solid #e0e0e0; padding-bottom: 8px;">Additional Notes</h2>
        <p style="margin: 0; font-size: 14px; color: #555; white-space: pre-wrap; background-color: #fffde7; border-left: 4px solid #f9a825; padding: 12px 16px; border-radius: 0 4px 4px 0;">${this.escapeHtml(additionalNotes)}</p>
      </div>`
      : '';

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Batch Complete: ${this.escapeHtml(batchName)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); max-width: 600px; width: 100%;">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1976d2, #1565c0); padding: 28px 32px;">
              <p style="margin: 0 0 4px; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 1px;">Borderless Dev</p>
              <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff; line-height: 1.3;">Batch Complete</h1>
              <p style="margin: 6px 0 0; font-size: 15px; color: rgba(255,255,255,0.85);">${this.escapeHtml(batchName)}</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px;">

              <!-- Completed Issues -->
              <h2 style="margin: 0 0 16px; font-size: 16px; font-weight: 700; color: #333; border-bottom: 2px solid #e0e0e0; padding-bottom: 8px;">Completed Issues</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-radius: 6px; overflow: hidden; border: 1px solid #e0e0e0;">
                <thead>
                  <tr style="background-color: #f5f5f5;">
                    <th style="padding: 10px 14px; text-align: left; font-size: 12px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e0e0e0; width: 60px;">#</th>
                    <th style="padding: 10px 14px; text-align: left; font-size: 12px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e0e0e0;">Title</th>
                    <th style="padding: 10px 14px; text-align: left; font-size: 12px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e0e0e0; width: 100px;">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${issueRows}
                </tbody>
              </table>

              <!-- Testing Checklist -->
              <div style="margin-top: 32px;">
                <h2 style="margin: 0 0 16px; font-size: 16px; font-weight: 700; color: #333; border-bottom: 2px solid #e0e0e0; padding-bottom: 8px;">Testing Checklist</h2>
                <ul style="margin: 0; padding: 0; list-style: none;">
                  ${checklistItems}
                </ul>
              </div>

              ${notesHtml}

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; border-top: 1px solid #e0e0e0; padding: 20px 32px; text-align: center;">
              <p style="margin: 0; font-size: 13px; color: #999;">Borderless Dev Team</p>
              <p style="margin: 4px 0 0; font-size: 11px; color: #bbb;">This is an automated notification from the internal API.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    return { text, html };
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
