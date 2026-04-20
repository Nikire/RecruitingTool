import { EmailTemplate, emailBaseStyles } from './email-template.interface';

export interface AsyncStageInvitationData {
  candidateName: string;
  jobTitle: string;
  companyName: string;
  stageName: string;
  stageDescription?: string;
  submissionUrl: string;
  deadline?: string; // formatted date string
  hrName?: string;
  isReminder?: boolean;
}

export function asyncStageInvitationTemplate(data: AsyncStageInvitationData): EmailTemplate {
  const subject = data.isReminder ? `Reminder: Submit your ${data.stageName} materials` : `Action Required: ${data.stageName} — ${data.jobTitle}`;

  const text = `
Hi ${data.candidateName},

You have been invited to complete the following stage for the ${data.jobTitle} position at ${data.companyName}.

Stage: ${data.stageName}
${data.stageDescription ? `\nDescription:\n${data.stageDescription}\n` : ''}
${data.deadline ? `Deadline: ${data.deadline}\n` : ''}
Submit your work here: ${data.submissionUrl}

IMPORTANT: This link is single-use. Once you submit, it cannot be reused.

Best regards,
${data.hrName || 'The Borderless Team'}
  `.trim();

  const descriptionBlock = data.stageDescription
    ? `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;border-radius:8px;overflow:hidden;border:1px solid #bfdbfe;">
        <tr>
          <td style="background:#eff6ff;padding:12px 20px;border-bottom:1px solid #bfdbfe;">
            <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#325CE7;">Stage Description</p>
          </td>
        </tr>
        <tr>
          <td style="background:#ffffff;padding:20px;">
            <p style="margin:0;font-size:14px;color:#475569;line-height:1.7;">${data.stageDescription}</p>
          </td>
        </tr>
      </table>`
    : '';

  const deadlineBlock = data.deadline
    ? `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
        <tr>
          <td>
            <span style="display:inline-block;background:#fff7ed;color:#c2410c;border:1px solid #fed7aa;border-radius:20px;padding:6px 16px;font-size:13px;font-weight:700;">
              ⏰ Deadline: ${data.deadline}
            </span>
          </td>
        </tr>
      </table>`
    : '';

  const html = `
    <div style="${emailBaseStyles.container}">
      <div style="${emailBaseStyles.card}">
        <h1 style="${emailBaseStyles.header}">Action Required: ${data.stageName}</h1>

        <p style="${emailBaseStyles.text}">Hi <strong>${data.candidateName}</strong>,</p>

        <p style="${emailBaseStyles.text}">
          You have been invited to complete the following stage for the
          <strong>${data.jobTitle}</strong> position at <strong>${data.companyName}</strong>.
          Please review the details below and submit your work using the link provided.
        </p>

        ${descriptionBlock}

        ${deadlineBlock}

        <div style="text-align: center; margin: 28px 0;">
          <a
            href="${data.submissionUrl}"
            style="${emailBaseStyles.button}"
          >Submit Your Work →</a>
        </div>

        <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;border-radius:8px;overflow:hidden;border:1px solid #e2e8f0;">
          <tr>
            <td style="background:#f8faff;padding:14px 18px;border-left:4px solid #f59e0b;">
              <p style="margin:0;font-size:13px;color:#92400e;line-height:1.6;">
                <strong>Important:</strong> This link is single-use. Once you submit, it cannot be reused.
              </p>
            </td>
          </tr>
        </table>

        <hr style="${emailBaseStyles.divider}">

        <div style="${emailBaseStyles.footer}">
          <p>Best regards,<br>${data.hrName || 'The Borderless Team'}</p>
        </div>
      </div>
    </div>
  `;

  return { subject, text, html };
}
