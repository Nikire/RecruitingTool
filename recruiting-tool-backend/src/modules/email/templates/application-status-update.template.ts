import { EmailTemplate, emailBaseStyles } from './email-template.interface';

export type ApplicationStatus = 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED' | 'INTERVIEW_SCHEDULED' | 'ON_HOLD';

export interface ApplicationStatusUpdateData {
  candidateName: string;
  jobPosition: string;
  companyName?: string;
  applicationUid: string;
  status: ApplicationStatus;
  message?: string;
  nextSteps?: string;
}

const statusConfig: Record<ApplicationStatus, { label: string; color: string; icon: string }> = {
  UNDER_REVIEW: { label: 'Under Review', color: '#1976d2', icon: '🔍' },
  ACCEPTED: { label: 'Accepted', color: '#2e7d32', icon: '✅' },
  REJECTED: { label: 'Not Selected', color: '#d32f2f', icon: '❌' },
  INTERVIEW_SCHEDULED: { label: 'Interview Scheduled', color: '#f57c00', icon: '📅' },
  ON_HOLD: { label: 'On Hold', color: '#757575', icon: '⏸️' },
};

export function applicationStatusUpdateTemplate(data: ApplicationStatusUpdateData): EmailTemplate {
  const config = statusConfig[data.status];
  const subject = `Application Update: ${data.jobPosition} - ${config.label}`;

  let defaultMessage = '';
  let defaultNextSteps = '';

  switch (data.status) {
    case 'UNDER_REVIEW':
      defaultMessage = 'Your application is now being reviewed by our hiring team.';
      defaultNextSteps = 'We will get back to you soon with updates on your application status.';
      break;
    case 'ACCEPTED':
      defaultMessage = 'Congratulations! We are pleased to inform you that your application has been accepted.';
      defaultNextSteps = 'Our team will be in touch with you shortly to discuss the next steps.';
      break;
    case 'REJECTED':
      defaultMessage = 'Thank you for your interest in this position. After careful consideration, we have decided to move forward with other candidates.';
      defaultNextSteps = 'We encourage you to apply for other positions that may be a better match for your skills and experience.';
      break;
    case 'INTERVIEW_SCHEDULED':
      defaultMessage = 'Great news! Your application has progressed to the interview stage.';
      defaultNextSteps = 'You will receive a separate email with your interview details shortly.';
      break;
    case 'ON_HOLD':
      defaultMessage = 'Your application is currently on hold.';
      defaultNextSteps = 'We will update you as soon as there are any changes to your application status.';
      break;
  }

  const message = data.message || defaultMessage;
  const nextSteps = data.nextSteps || defaultNextSteps;

  const text = `
Dear ${data.candidateName},

We have an update regarding your application for the position of ${data.jobPosition}${data.companyName ? ` at ${data.companyName}` : ''}.

Application Reference: ${data.applicationUid}
Status: ${config.label}

${message}

${nextSteps}

Thank you for your interest in joining our team.

Best regards,
The BorderLess Team - EMP Employment Solutions
  `.trim();

  const html = `
    <div style="${emailBaseStyles.container}">
      <div style="${emailBaseStyles.card}">
        <h1 style="${emailBaseStyles.header}">Application Status Update</h1>

        <p style="${emailBaseStyles.text}">Dear <strong>${data.candidateName}</strong>,</p>

        <p style="${emailBaseStyles.text}">
          We have an update regarding your application for the position of
          <strong>${data.jobPosition}</strong>${data.companyName ? ` at <strong>${data.companyName}</strong>` : ''}.
        </p>

        <div style="background-color: #f5f5f5; border-left: 4px solid ${config.color}; padding: 20px; margin: 20px 0; border-radius: 4px;">
          <p style="${emailBaseStyles.text}; margin-bottom: 10px;">
            <strong>Application Reference:</strong>
            <code style="background-color: #ffffff; padding: 2px 6px; border-radius: 3px;">${data.applicationUid}</code>
          </p>
          <p style="${emailBaseStyles.text}; margin-bottom: 0; font-size: 18px;">
            <span style="font-size: 24px;">${config.icon}</span>
            <strong>Status:</strong>
            <span style="color: ${config.color}; font-weight: bold;">${config.label}</span>
          </p>
        </div>

        <p style="${emailBaseStyles.text}">
          ${message}
        </p>

        <h2 style="${emailBaseStyles.subheader}">Next Steps</h2>
        <p style="${emailBaseStyles.text}">
          ${nextSteps}
        </p>

        <hr style="${emailBaseStyles.divider}">

        <p style="${emailBaseStyles.text}">
          Thank you for your interest in joining our team.
        </p>

        <div style="${emailBaseStyles.footer}">
          <p>Best regards,<br>The BorderLess Team - EMP Employment Solutions</p>
        </div>
      </div>
    </div>
  `;

  return { subject, text, html };
}
