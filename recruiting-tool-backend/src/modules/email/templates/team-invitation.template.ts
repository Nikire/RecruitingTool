import { EmailTemplate } from './email-template.interface';

export interface TeamInvitationData {
  inviteeName: string;
  companyName: string;
  inviterName: string;
  role: string;
  invitationLink: string;
  expiresAt: Date;
}

export const teamInvitationTemplate = (data: TeamInvitationData): EmailTemplate => {
  const expirationDate = new Date(data.expiresAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return {
    subject: `You've been invited to join ${data.companyName}`,
    text: `
Hello ${data.inviteeName || 'there'},

You have been invited by ${data.inviterName} to join ${data.companyName} as ${data.role}.

To accept this invitation, please click the link below:
${data.invitationLink}

This invitation will expire on ${expirationDate}.

If you did not expect this invitation, you can safely ignore this email.

Best regards,
The ${data.companyName} Team
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Team Invitation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Team Invitation</h1>
  </div>

  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">
      Hello <strong>${data.inviteeName || 'there'}</strong>,
    </p>

    <p style="font-size: 16px; margin-bottom: 20px;">
      You have been invited by <strong>${data.inviterName}</strong> to join
      <strong>${data.companyName}</strong> as <strong>${data.role}</strong>.
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.invitationLink}"
         style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
        Accept Invitation
      </a>
    </div>

    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; font-size: 14px; color: #856404;">
        ⏰ This invitation will expire on <strong>${expirationDate}</strong>
      </p>
    </div>

    <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
      If you did not expect this invitation, you can safely ignore this email.
    </p>

    <p style="font-size: 14px; color: #666;">
      Best regards,<br>
      The ${data.companyName} Team
    </p>
  </div>

  <div style="text-align: center; margin-top: 20px; padding: 20px; font-size: 12px; color: #999;">
    <p>This is an automated email. Please do not reply to this message.</p>
  </div>
</body>
</html>
    `.trim(),
  };
};
