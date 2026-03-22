import { EmailTemplate, emailBaseStyles } from './email-template.interface';

export interface StageAdvancementData {
  candidateName: string;
  jobPosition: string;
  companyName?: string;
  previousStage?: string;
  newStage: string;
  hiringProcessUid: string;
}

export function stageAdvancementTemplate(data: StageAdvancementData): EmailTemplate {
  const subject = `Update on your application for ${data.jobPosition}`;

  const text = `
Dear ${data.candidateName},

We have an update on your application for the position of ${data.jobPosition}${data.companyName ? ` at ${data.companyName}` : ''}.

Your application has moved to the next stage: ${data.newStage}.
${data.previousStage ? `\nPrevious stage: ${data.previousStage}` : ''}

Our team will be in touch with you shortly with more details.

Thank you for your interest in joining our team.

Best regards,
${data.companyName ?? 'The Borderless Team'}
  `.trim();

  const html = `
    <div style="${emailBaseStyles.container}">
      <div style="${emailBaseStyles.card}">
        <h1 style="${emailBaseStyles.header}">Application Update</h1>

        <p style="${emailBaseStyles.text}">Dear <strong>${data.candidateName}</strong>,</p>

        <p style="${emailBaseStyles.text}">
          We have an update on your application for the position of
          <strong>${data.jobPosition}</strong>${data.companyName ? ` at <strong>${data.companyName}</strong>` : ''}.
        </p>

        <div style="background-color: #f5f5f5; border-left: 4px solid #1976d2; padding: 20px; margin: 20px 0; border-radius: 4px;">
          <p style="${emailBaseStyles.text}; margin-bottom: 8px;">
            <span style="font-size: 22px;">🎯</span>
            <strong> New stage:</strong>
            <span style="color: #1976d2; font-weight: bold;"> ${data.newStage}</span>
          </p>
          ${
            data.previousStage
              ? `<p style="${emailBaseStyles.text}; margin-bottom: 0; color: #888888;">
            Previous stage: ${data.previousStage}
          </p>`
              : ''
          }
        </div>

        <p style="${emailBaseStyles.text}">
          Our team will be in touch with you shortly with more details about this stage.
        </p>

        <hr style="${emailBaseStyles.divider}">

        <p style="${emailBaseStyles.text}">
          Thank you for your interest in joining our team.
        </p>

        <div style="${emailBaseStyles.footer}">
          <p>Best regards,<br>${data.companyName ?? 'The Borderless Team'}</p>
        </div>
      </div>
    </div>
  `;

  return { subject, text, html };
}
