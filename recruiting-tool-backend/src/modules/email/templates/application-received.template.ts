import { EmailTemplate, emailBaseStyles } from './email-template.interface';

export interface ApplicationReceivedData {
  candidateName: string;
  jobPosition: string;
  companyName?: string;
  applicationUid: string;
  appliedDate?: string | Date;
}

export function applicationReceivedTemplate(data: ApplicationReceivedData): EmailTemplate {
  const subject = `Application Received: ${data.jobPosition}${data.companyName ? ` at ${data.companyName}` : ''}`;

  const text = `
Dear ${data.candidateName},

Thank you for applying for the position of ${data.jobPosition}${data.companyName ? ` at ${data.companyName}` : ''}.

We have successfully received your application.

Application Reference: ${data.applicationUid}

Our team will carefully review your application and qualifications. We will get back to you soon with next steps.

Thank you for your interest in joining our team!

Best regards,
The Recruiting Team
  `.trim();

  const html = `
    <div style="${emailBaseStyles.container}">
      <div style="${emailBaseStyles.card}">
        <h1 style="${emailBaseStyles.header}">Application Received</h1>

        <p style="${emailBaseStyles.text}">Dear <strong>${data.candidateName}</strong>,</p>

        <p style="${emailBaseStyles.text}">
          Thank you for applying for the position of <strong>${data.jobPosition}</strong>${data.companyName ? ` at <strong>${data.companyName}</strong>` : ''}.
        </p>

        <div style="background-color: #e3f2fd; border-left: 4px solid #1976d2; padding: 15px; margin: 20px 0;">
          <p style="${emailBaseStyles.text}; margin-bottom: 5px;">
            <strong>Application Status:</strong> <span style="color: #2e7d32;">Received</span>
          </p>
          <p style="${emailBaseStyles.text}; margin-bottom: 0;">
            <strong>Reference:</strong> <code style="background-color: #ffffff; padding: 2px 6px; border-radius: 3px;">${data.applicationUid}</code>
          </p>
        </div>

        <p style="${emailBaseStyles.text}">
          Our team will carefully review your application and qualifications. We will get back to you soon with next steps.
        </p>

        <hr style="${emailBaseStyles.divider}">

        <p style="${emailBaseStyles.text}">
          Thank you for your interest in joining our team!
        </p>

        <div style="${emailBaseStyles.footer}">
          <p>Best regards,<br>The Recruiting Team</p>
        </div>
      </div>
    </div>
  `;

  return { subject, text, html };
}
