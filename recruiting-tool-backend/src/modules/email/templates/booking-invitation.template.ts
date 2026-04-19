import { EmailTemplate, emailBaseStyles } from './email-template.interface';

export interface BookingInvitationData {
  candidateName: string;
  jobTitle: string;
  bookingUrl: string;
  expiresAt: Date | string;
}

export function bookingInvitationTemplate(data: BookingInvitationData): EmailTemplate {
  const expiresAtDate = typeof data.expiresAt === 'string' ? new Date(data.expiresAt) : data.expiresAt;
  const expiryDateStr = expiresAtDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const subject = `Schedule Your Interview for ${data.jobTitle}`;

  const text = `
Dear ${data.candidateName},

Congratulations! You have been selected to move forward in our hiring process for the position of ${data.jobTitle}.

Please use the link below to choose an interview time that works best for you:
${data.bookingUrl}

This link will expire on ${expiryDateStr}. Please book your slot before then.

Best regards,
The Borderless Team
  `.trim();

  const html = `
    <div style="${emailBaseStyles.container}">
      <div style="${emailBaseStyles.card}">
        <h1 style="${emailBaseStyles.header}">You've Been Invited to Schedule Your Interview</h1>

        <p style="${emailBaseStyles.text}">Dear <strong>${data.candidateName}</strong>,</p>

        <p style="${emailBaseStyles.text}">
          Congratulations! You have been selected to move forward in our hiring process for the position of
          <strong>${data.jobTitle}</strong>.
        </p>

        <p style="${emailBaseStyles.text}">
          Please click the button below to choose an interview time that works best for you.
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${data.bookingUrl}" style="${emailBaseStyles.button}">
            Book Your Interview
          </a>
        </div>

        <p style="${emailBaseStyles.text}">Or copy and paste this link into your browser:</p>
        <p style="color: #666666; font-size: 12px; word-break: break-all;">${data.bookingUrl}</p>

        <hr style="${emailBaseStyles.divider}">

        <div style="${emailBaseStyles.footer}">
          <p>This link will expire on ${expiryDateStr}. Please book your slot before then.</p>
          <p>Best regards,<br>The Borderless Team</p>
        </div>
      </div>
    </div>
  `;

  return { subject, text, html };
}
