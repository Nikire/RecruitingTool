import { EmailTemplateType } from '@prisma/client';

const WRAPPER = (headerBg: string, headerText: string, body: string) => `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#f4f6fb;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6fb;padding:32px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <!-- Header -->
      <tr>
        <td style="background:${headerBg};padding:36px 40px;">
          <p style="margin:0 0 4px;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.75);">Borderless ATS</p>
          <h1 style="margin:0;font-size:26px;font-weight:700;color:#ffffff;line-height:1.3;">${headerText}</h1>
        </td>
      </tr>
      <!-- Body -->
      <tr>
        <td style="background:#ffffff;padding:40px;">
          ${body}
        </td>
      </tr>
      <!-- Footer -->
      <tr>
        <td style="background:#f0f3fb;padding:20px 40px;border-top:1px solid #e2e8f0;">
          <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">This email was sent by <strong style="color:#325CE7;">{{companyName}}</strong> via Borderless ATS &nbsp;·&nbsp; Please do not reply directly to this email.</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

const SIGNATURE = `
<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;border-top:1px solid #e2e8f0;padding-top:20px;">
  <tr>
    <td>
      <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#325CE7;">{{hrName}}</p>
      <p style="margin:0;font-size:13px;color:#64748b;">{{companyName}}</p>
    </td>
  </tr>
</table>`;

export interface DefaultTemplateContent {
  type: EmailTemplateType;
  name: string;
  subject: string;
  body: string;
}

export const DEFAULT_EMAIL_TEMPLATES: DefaultTemplateContent[] = [
  {
    type: EmailTemplateType.APPLICATION_RECEIVED,
    name: 'Application Received',
    subject: 'We received your application for {{jobTitle}} ✓',
    body: WRAPPER(
      'linear-gradient(135deg,#325CE7 0%,#5b7ff0 100%)',
      'Application Received',
      `<p style="margin:0 0 8px;font-size:16px;color:#1e293b;">Hi <strong>{{candidateName}}</strong>,</p>
      <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.7;">Thank you for applying for the <strong style="color:#325CE7;">{{jobTitle}}</strong> role at <strong>{{companyName}}</strong>. We've received your application and our team will begin reviewing it shortly.</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;border-radius:8px;overflow:hidden;border:1px solid #e2e8f0;">
        <tr><td style="background:#f8faff;padding:16px 20px;border-left:4px solid #325CE7;">
          <p style="margin:0;font-size:13px;font-weight:600;color:#325CE7;text-transform:uppercase;letter-spacing:1px;">What happens next?</p>
          <p style="margin:8px 0 0;font-size:14px;color:#475569;line-height:1.6;">Our hiring team will carefully review all applications. If your profile matches our requirements, we'll reach out to schedule the next steps. This usually takes <strong>3–5 business days</strong>.</p>
        </td></tr>
      </table>
      <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.7;">In the meantime, feel free to explore more about us. We appreciate your interest and look forward to learning more about you.</p>
      ${SIGNATURE}`,
    ),
  },
  {
    type: EmailTemplateType.APPLICATION_UNDER_REVIEW,
    name: 'Application Under Review',
    subject: 'Your application for {{jobTitle}} is being reviewed',
    body: WRAPPER(
      'linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)',
      'Your Application is Under Review',
      `<p style="margin:0 0 8px;font-size:16px;color:#1e293b;">Hi <strong>{{candidateName}}</strong>,</p>
      <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.7;">We wanted to keep you in the loop — your application for <strong style="color:#6366f1;">{{jobTitle}}</strong> at <strong>{{companyName}}</strong> is currently being reviewed by our hiring team.</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
        <tr>
          <td width="40" valign="top" style="padding-top:3px;"><div style="width:28px;height:28px;background:#6366f1;border-radius:50%;text-align:center;line-height:28px;color:#fff;font-size:13px;font-weight:700;">1</div></td>
          <td style="padding-left:12px;padding-bottom:16px;"><p style="margin:0;font-size:14px;font-weight:600;color:#1e293b;">Application Received</p><p style="margin:4px 0 0;font-size:13px;color:#64748b;">We have your application on file.</p></td>
        </tr>
        <tr>
          <td width="40" valign="top" style="padding-top:3px;"><div style="width:28px;height:28px;background:#6366f1;border-radius:50%;text-align:center;line-height:28px;color:#fff;font-size:13px;font-weight:700;">2</div></td>
          <td style="padding-left:12px;padding-bottom:16px;"><p style="margin:0;font-size:14px;font-weight:600;color:#1e293b;">Under Review <span style="background:#ede9fe;color:#6366f1;font-size:11px;padding:2px 8px;border-radius:20px;font-weight:600;margin-left:8px;">Current</span></p><p style="margin:4px 0 0;font-size:13px;color:#64748b;">Our team is reviewing your profile and experience.</p></td>
        </tr>
        <tr>
          <td width="40" valign="top" style="padding-top:3px;"><div style="width:28px;height:28px;background:#e2e8f0;border-radius:50%;text-align:center;line-height:28px;color:#94a3b8;font-size:13px;font-weight:700;">3</div></td>
          <td style="padding-left:12px;"><p style="margin:0;font-size:14px;font-weight:600;color:#94a3b8;">Next Steps</p><p style="margin:4px 0 0;font-size:13px;color:#cbd5e1;">We'll be in touch with an update soon.</p></td>
        </tr>
      </table>
      <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.7;">Thank you for your patience. We'll reach out as soon as we have an update for you.</p>
      ${SIGNATURE}`,
    ),
  },
  {
    type: EmailTemplateType.APPLICATION_REJECTED,
    name: 'Application Not Moving Forward',
    subject: 'An update on your application for {{jobTitle}}',
    body: WRAPPER(
      'linear-gradient(135deg,#64748b 0%,#475569 100%)',
      'Thank You for Applying',
      `<p style="margin:0 0 8px;font-size:16px;color:#1e293b;">Hi <strong>{{candidateName}}</strong>,</p>
      <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.7;">Thank you for taking the time to apply for the <strong>{{jobTitle}}</strong> position at <strong>{{companyName}}</strong> and for your interest in joining our team.</p>
      <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.7;">After carefully reviewing your application, we have decided to move forward with candidates whose experience more closely aligns with our current needs. This was a difficult decision given the high calibre of applicants we received.</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;border-radius:8px;overflow:hidden;border:1px solid #e2e8f0;">
        <tr><td style="background:#f8faff;padding:16px 20px;border-left:4px solid #94a3b8;">
          <p style="margin:0;font-size:14px;color:#475569;line-height:1.6;">We encourage you to keep an eye on our openings. Your profile will remain in our database and we may reach out if a role that fits your background becomes available.</p>
        </td></tr>
      </table>
      <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.7;">We wish you all the best in your job search and future endeavours.</p>
      ${SIGNATURE}`,
    ),
  },
  {
    type: EmailTemplateType.APPLICATION_SHORTLISTED,
    name: "You've Been Shortlisted",
    subject: "🎉 Great news — you've been shortlisted for {{jobTitle}}",
    body: WRAPPER(
      'linear-gradient(135deg,#059669 0%,#10b981 100%)',
      "You've Been Shortlisted! 🎉",
      `<p style="margin:0 0 8px;font-size:16px;color:#1e293b;">Hi <strong>{{candidateName}}</strong>,</p>
      <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.7;">We have great news! After reviewing all applications for the <strong style="color:#059669;">{{jobTitle}}</strong> position at <strong>{{companyName}}</strong>, we are pleased to let you know that you have been <strong>shortlisted</strong>.</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;background:linear-gradient(135deg,#f0fdf4,#dcfce7);border-radius:12px;overflow:hidden;">
        <tr><td style="padding:24px;text-align:center;">
          <p style="margin:0 0 8px;font-size:32px;">🌟</p>
          <p style="margin:0;font-size:16px;font-weight:700;color:#065f46;">You're among our top candidates!</p>
          <p style="margin:8px 0 0;font-size:14px;color:#047857;">Your skills and experience stood out from many applicants.</p>
        </td></tr>
      </table>
      <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.7;">Our team will be in contact with you shortly to discuss the next steps in the hiring process. Please keep an eye on your inbox.</p>
      <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.7;">Congratulations on reaching this stage — we look forward to getting to know you better!</p>
      ${SIGNATURE}`,
    ),
  },
  {
    type: EmailTemplateType.INTERVIEW_INVITATION,
    name: 'Interview Invitation',
    subject: 'Interview invitation — {{jobTitle}} at {{companyName}}',
    body: WRAPPER(
      'linear-gradient(135deg,#325CE7 0%,#0ea5e9 100%)',
      "You're Invited to Interview",
      `<p style="margin:0 0 8px;font-size:16px;color:#1e293b;">Hi <strong>{{candidateName}}</strong>,</p>
      <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.7;">We were impressed by your profile and would love to invite you for an interview for the <strong style="color:#325CE7;">{{jobTitle}}</strong> position at <strong>{{companyName}}</strong>.</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;border-radius:10px;overflow:hidden;border:1px solid #bfdbfe;">
        <tr><td style="background:#eff6ff;padding:12px 20px;border-bottom:1px solid #bfdbfe;">
          <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#325CE7;">Interview Details</p>
        </td></tr>
        <tr><td style="background:#ffffff;padding:20px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;"><span style="font-size:13px;color:#94a3b8;display:inline-block;width:100px;">📅 Date</span><span style="font-size:14px;font-weight:600;color:#1e293b;">{{interviewDate}}</span></td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;"><span style="font-size:13px;color:#94a3b8;display:inline-block;width:100px;">🕐 Time</span><span style="font-size:14px;font-weight:600;color:#1e293b;">{{interviewTime}}</span></td></tr>
            <tr><td style="padding:8px 0;"><span style="font-size:13px;color:#94a3b8;display:inline-block;width:100px;">🔗 Link</span><a href="{{meetingLink}}" style="font-size:14px;font-weight:600;color:#325CE7;text-decoration:none;">Join Meeting →</a></td></tr>
          </table>
        </td></tr>
      </table>
      <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.7;">Please confirm your availability by replying to this email. If you need to reschedule or have any questions, don't hesitate to reach out.</p>
      <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.7;">We look forward to speaking with you!</p>
      ${SIGNATURE}`,
    ),
  },
  {
    type: EmailTemplateType.INTERVIEW_REMINDER,
    name: 'Interview Reminder',
    subject: '⏰ Reminder: Your interview for {{jobTitle}} is tomorrow',
    body: WRAPPER(
      'linear-gradient(135deg,#f59e0b 0%,#f97316 100%)',
      'Interview Reminder ⏰',
      `<p style="margin:0 0 8px;font-size:16px;color:#1e293b;">Hi <strong>{{candidateName}}</strong>,</p>
      <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.7;">Just a friendly reminder that your interview for the <strong>{{jobTitle}}</strong> position at <strong>{{companyName}}</strong> is coming up soon. We're looking forward to speaking with you!</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;border-radius:10px;overflow:hidden;border:1px solid #fed7aa;">
        <tr><td style="background:#fff7ed;padding:12px 20px;border-bottom:1px solid #fed7aa;">
          <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#ea580c;">Upcoming Interview</p>
        </td></tr>
        <tr><td style="background:#ffffff;padding:20px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;"><span style="font-size:13px;color:#94a3b8;display:inline-block;width:100px;">📅 Date</span><span style="font-size:14px;font-weight:600;color:#1e293b;">{{interviewDate}}</span></td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;"><span style="font-size:13px;color:#94a3b8;display:inline-block;width:100px;">🕐 Time</span><span style="font-size:14px;font-weight:600;color:#1e293b;">{{interviewTime}}</span></td></tr>
            <tr><td style="padding:8px 0;"><span style="font-size:13px;color:#94a3b8;display:inline-block;width:100px;">🔗 Link</span><a href="{{meetingLink}}" style="font-size:14px;font-weight:600;color:#f97316;text-decoration:none;">Join Meeting →</a></td></tr>
          </table>
        </td></tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border-radius:8px;border:1px solid #e2e8f0;">
        <tr><td style="padding:16px 20px;">
          <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#1e293b;">💡 Quick tips for a great interview:</p>
          <ul style="margin:0;padding-left:20px;font-size:13px;color:#475569;line-height:1.8;">
            <li>Test your audio and video 10 minutes beforehand</li>
            <li>Find a quiet, well-lit space</li>
            <li>Have a copy of your CV handy</li>
          </ul>
        </td></tr>
      </table>
      <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.7;">If you need to reschedule, please let us know as soon as possible. We look forward to talking with you!</p>
      ${SIGNATURE}`,
    ),
  },
  {
    type: EmailTemplateType.OFFER_LETTER,
    name: 'Job Offer Letter',
    subject: '🎉 Job Offer: {{jobTitle}} at {{companyName}}',
    body: WRAPPER(
      'linear-gradient(135deg,#7c3aed 0%,#a855f7 100%)',
      'Congratulations — You Got the Job! 🎉',
      `<p style="margin:0 0 8px;font-size:16px;color:#1e293b;">Dear <strong>{{candidateName}}</strong>,</p>
      <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.7;">On behalf of the entire team at <strong>{{companyName}}</strong>, it is our great pleasure to formally offer you the position of <strong style="color:#7c3aed;">{{jobTitle}}</strong>. We were truly impressed by your skills, experience, and enthusiasm throughout the process.</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;background:linear-gradient(135deg,#faf5ff,#ede9fe);border-radius:12px;">
        <tr><td style="padding:28px;text-align:center;">
          <p style="margin:0 0 8px;font-size:36px;">🏆</p>
          <p style="margin:0;font-size:18px;font-weight:700;color:#6b21a8;">Welcome to the team!</p>
          <p style="margin:8px 0 0;font-size:14px;color:#7e22ce;">We can't wait to have you on board at <strong>{{companyName}}</strong>.</p>
        </td></tr>
      </table>
      <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.7;">Please review this offer carefully and let us know if you have any questions. To officially accept, simply reply to this email or reach out to us directly.</p>
      <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.7;">We are excited about the contributions you will bring to our team and look forward to welcoming you officially.</p>
      ${SIGNATURE}`,
    ),
  },
  {
    type: EmailTemplateType.APPLICATION_STATUS_UPDATE,
    name: 'Application Status Update',
    subject: 'Update on your application for {{jobTitle}}',
    body: WRAPPER(
      'linear-gradient(135deg,#325CE7 0%,#5b7ff0 100%)',
      'Application Update',
      `<p style="margin:0 0 8px;font-size:16px;color:#1e293b;">Hi <strong>{{candidateName}}</strong>,</p>
      <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.7;">We have an update regarding your application for the <strong style="color:#325CE7;">{{jobTitle}}</strong> position at <strong>{{companyName}}</strong>.</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;border-radius:8px;overflow:hidden;border:1px solid #e2e8f0;">
        <tr><td style="background:#f8faff;padding:16px 20px;border-left:4px solid #325CE7;">
          <p style="margin:0;font-size:13px;font-weight:600;color:#325CE7;text-transform:uppercase;letter-spacing:1px;">Status Update</p>
          <p style="margin:8px 0 0;font-size:15px;color:#1e293b;font-weight:600;">{{status}}</p>
        </td></tr>
      </table>
      <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.7;">If you have any questions about this update, please don't hesitate to reach out to our team.</p>
      <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.7;">Thank you for your interest in joining <strong>{{companyName}}</strong>.</p>
      ${SIGNATURE}`,
    ),
  },
  {
    type: EmailTemplateType.CUSTOM,
    name: 'Custom Email',
    subject: 'A message from {{companyName}}',
    body: WRAPPER(
      'linear-gradient(135deg,#325CE7 0%,#5b7ff0 100%)',
      'Message from {{companyName}}',
      `<p style="margin:0 0 8px;font-size:16px;color:#1e293b;">Hi <strong>{{candidateName}}</strong>,</p>
      <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.7;">{{message}}</p>
      ${SIGNATURE}`,
    ),
  },
];
