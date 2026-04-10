import { EmailTemplate, emailBaseStyles } from './email-template.interface';

export interface HiredNotificationData {
  candidateName: string;
  jobPosition: string;
  companyName?: string;
  hiringProcessUid: string;
}

export function hiredNotificationTemplate(data: HiredNotificationData): EmailTemplate {
  const subject = `Congratulations! You have been hired for ${data.jobPosition}`;
  const teamName = data.companyName ?? 'The Borderless Team';

  const text = `
Dear ${data.candidateName},

We are thrilled to inform you that you have been selected for the position of ${data.jobPosition}${data.companyName ? ` at ${data.companyName}` : ''}.

Congratulations on successfully completing the hiring process! We are excited to welcome you to the team.

A member of our team will be in touch with you shortly to discuss the next steps and your start date.

Once again, congratulations and welcome aboard!

Best regards,
${teamName}
  `.trim();

  const html = `
    <div style="${emailBaseStyles.container}">
      <div style="${emailBaseStyles.card}">
        <h1 style="${emailBaseStyles.header}">Congratulations!</h1>

        <p style="${emailBaseStyles.text}">Dear <strong>${data.candidateName}</strong>,</p>

        <p style="${emailBaseStyles.text}">
          We are thrilled to inform you that you have been selected for the position of
          <strong>${data.jobPosition}</strong>${data.companyName ? ` at <strong>${data.companyName}</strong>` : ''}.
        </p>

        <div style="background-color: #e8f5e9; border-left: 4px solid #4caf50; padding: 20px; margin: 20px 0; border-radius: 4px;">
          <p style="${emailBaseStyles.text}; margin-bottom: 8px;">
            <span style="font-size: 28px;">🎉</span>
            <strong style="color: #2e7d32; font-size: 16px;"> You've been hired!</strong>
          </p>
          <p style="${emailBaseStyles.text}; margin-bottom: 0; color: #555555;">
            Position: <strong>${data.jobPosition}</strong>
          </p>
          ${data.companyName ? `<p style="${emailBaseStyles.text}; margin-bottom: 0; color: #555555;">Company: <strong>${data.companyName}</strong></p>` : ''}
        </div>

        <p style="${emailBaseStyles.text}">
          Congratulations on successfully completing the hiring process! We are excited to welcome you to the team.
        </p>

        <p style="${emailBaseStyles.text}">
          A member of our team will be in touch with you shortly to discuss the next steps and your start date.
        </p>

        <hr style="${emailBaseStyles.divider}">

        <p style="${emailBaseStyles.text}">
          Once again, congratulations and welcome aboard!
        </p>

        <div style="${emailBaseStyles.footer}">
          <p>Best regards,<br>${teamName}</p>
        </div>
      </div>
    </div>
  `;

  return { subject, text, html };
}
