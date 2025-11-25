import { EmailTemplate, emailBaseStyles } from './email-template.interface';

export interface PasswordResetData {
  userName: string;
  resetLink: string;
  expirationTime?: string;
}

export function passwordResetTemplate(data: PasswordResetData): EmailTemplate {
  const expirationText = data.expirationTime || '1 hour';

  const subject = 'Password Reset Request';

  const text = `
Dear ${data.userName},

We received a request to reset your password. Click the link below to create a new password:

${data.resetLink}

This link will expire in ${expirationText}. If you did not request a password reset, please ignore this email or contact support if you have concerns.

For security reasons, please do not share this link with anyone.

Best regards,
The Recruiting Team
  `.trim();

  const html = `
    <div style="${emailBaseStyles.container}">
      <div style="${emailBaseStyles.card}">
        <h1 style="${emailBaseStyles.header}">Password Reset Request</h1>

        <p style="${emailBaseStyles.text}">Dear <strong>${data.userName}</strong>,</p>

        <p style="${emailBaseStyles.text}">
          We received a request to reset your password. Click the button below to create a new password:
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.resetLink}" style="${emailBaseStyles.button}">
            Reset Password
          </a>
        </div>

        <p style="${emailBaseStyles.text}; font-size: 12px; color: #666;">
          Or copy and paste this link into your browser:<br>
          <a href="${data.resetLink}" style="${emailBaseStyles.link}">${data.resetLink}</a>
        </p>

        <div style="background-color: #fff3cd; border-left: 4px solid #f57c00; padding: 15px; margin: 20px 0;">
          <p style="${emailBaseStyles.text}; margin-bottom: 0; color: #856404;">
            <strong>⏰ Important:</strong> This link will expire in <strong>${expirationText}</strong>.
          </p>
        </div>

        <p style="${emailBaseStyles.text}">
          If you did not request a password reset, please ignore this email or contact support if you have concerns.
        </p>

        <p style="${emailBaseStyles.text}; font-size: 12px; color: #d32f2f;">
          <strong>Security Notice:</strong> For your protection, please do not share this link with anyone.
        </p>

        <div style="${emailBaseStyles.footer}">
          <p>Best regards,<br>The Recruiting Team</p>
        </div>
      </div>
    </div>
  `;

  return { subject, text, html };
}
