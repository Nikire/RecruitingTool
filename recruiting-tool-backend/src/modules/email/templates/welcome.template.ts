import { EmailTemplate, emailBaseStyles } from './email-template.interface';

export interface WelcomeData {
  userName: string;
  userEmail: string;
  userRole: string;
  companyName?: string;
  loginUrl?: string;
  supportEmail?: string;
}

export function welcomeTemplate(data: WelcomeData): EmailTemplate {
  const subject = `Welcome to the Recruiting Tool${data.companyName ? ` - ${data.companyName}` : ''}`;

  const text = `
Dear ${data.userName},

Welcome to the Recruiting Tool! We're excited to have you on board.

Your account has been successfully created with the following details:

Email: ${data.userEmail}
Role: ${data.userRole}
${data.companyName ? `Company: ${data.companyName}` : ''}

${data.loginUrl ? `You can access the platform at: ${data.loginUrl}` : ''}

Here are a few things you can do to get started:
- Complete your profile
- Explore the dashboard
- Start managing your recruitment process

If you have any questions or need assistance, please don't hesitate to reach out${data.supportEmail ? ` to ${data.supportEmail}` : ' to our support team'}.

We're here to help you streamline your hiring process!

Best regards,
The Recruiting Team
  `.trim();

  const html = `
    <div style="${emailBaseStyles.container}">
      <div style="${emailBaseStyles.card}">
        <h1 style="${emailBaseStyles.header}">Welcome to the Recruiting Tool! 🎉</h1>

        <p style="${emailBaseStyles.text}">Dear <strong>${data.userName}</strong>,</p>

        <p style="${emailBaseStyles.text}">
          We're excited to have you on board! Your account has been successfully created.
        </p>

        <div style="background-color: #e3f2fd; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h2 style="${emailBaseStyles.subheader}; margin-top: 0;">Your Account Details</h2>
          <table style="width: 100%;">
            <tr>
              <td style="padding: 8px 0;"><strong>Email:</strong></td>
              <td style="padding: 8px 0;">${data.userEmail}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Role:</strong></td>
              <td style="padding: 8px 0;">${data.userRole}</td>
            </tr>
            ${data.companyName ? `
            <tr>
              <td style="padding: 8px 0;"><strong>Company:</strong></td>
              <td style="padding: 8px 0;">${data.companyName}</td>
            </tr>
            ` : ''}
          </table>
        </div>

        ${data.loginUrl ? `
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.loginUrl}" style="${emailBaseStyles.button}">
            Access the Platform
          </a>
        </div>
        ` : ''}

        <h2 style="${emailBaseStyles.subheader}">Get Started</h2>
        <ul style="${emailBaseStyles.text}">
          <li style="margin-bottom: 10px;">✅ Complete your profile</li>
          <li style="margin-bottom: 10px;">📊 Explore the dashboard</li>
          <li style="margin-bottom: 10px;">🚀 Start managing your recruitment process</li>
        </ul>

        <hr style="${emailBaseStyles.divider}">

        <p style="${emailBaseStyles.text}">
          If you have any questions or need assistance, please don't hesitate to reach out${data.supportEmail ? ` to <a href="mailto:${data.supportEmail}" style="${emailBaseStyles.link}">${data.supportEmail}</a>` : ' to our support team'}.
        </p>

        <p style="${emailBaseStyles.text}">
          We're here to help you streamline your hiring process!
        </p>

        <div style="${emailBaseStyles.footer}">
          <p>Best regards,<br>The Recruiting Team</p>
        </div>
      </div>
    </div>
  `;

  return { subject, text, html };
}
