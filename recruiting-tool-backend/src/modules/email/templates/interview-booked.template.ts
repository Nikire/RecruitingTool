import { EmailTemplate, emailBaseStyles, formatEmailDate } from './email-template.interface';

export interface InterviewBookedData {
  candidateName: string;
  jobTitle: string;
  scheduledDate: string;
  scheduledTime: string;
  durationMinutes: number;
  meetingLink?: string;
}

export function interviewBookedTemplate(data: InterviewBookedData): EmailTemplate {
  const formattedDate = formatEmailDate(data.scheduledDate);
  const durationText = `${data.durationMinutes} minutes`;

  const subject = `Interview Confirmed: ${data.jobTitle}`;

  const text = `
Dear ${data.candidateName},

Your interview for ${data.jobTitle} has been confirmed!

Date: ${formattedDate}
Time: ${data.scheduledTime}
Duration: ${durationText}${data.meetingLink ? `\nMeeting Link: ${data.meetingLink}` : ''}

Please make sure to be available at the scheduled time. We look forward to speaking with you!

Best regards,
The Borderless Team
  `.trim();

  const html = `
    <div style="${emailBaseStyles.container}">
      <div style="${emailBaseStyles.card}">
        <h1 style="${emailBaseStyles.header}">Your Interview is Confirmed!</h1>

        <p style="${emailBaseStyles.text}">Dear <strong>${data.candidateName}</strong>,</p>

        <p style="${emailBaseStyles.text}">
          Great news — your interview for <strong>${data.jobTitle}</strong> has been successfully scheduled.
        </p>

        <h2 style="${emailBaseStyles.subheader}">Interview Details</h2>

        <table cellpadding="0" cellspacing="0" style="${emailBaseStyles.table}">
          <tr>
            <td style="${emailBaseStyles.tableCellBold}">Date</td>
            <td style="${emailBaseStyles.tableCell}">${formattedDate}</td>
          </tr>
          <tr>
            <td style="${emailBaseStyles.tableCellBold}">Time</td>
            <td style="${emailBaseStyles.tableCell}">${data.scheduledTime}</td>
          </tr>
          <tr>
            <td style="${emailBaseStyles.tableCellBold}">Duration</td>
            <td style="${emailBaseStyles.tableCell}">${durationText}</td>
          </tr>
          ${
            data.meetingLink
              ? `
          <tr>
            <td style="${emailBaseStyles.tableCellBold}">Meeting Link</td>
            <td style="${emailBaseStyles.tableCell}">
              <a href="${data.meetingLink}" style="${emailBaseStyles.link}">${data.meetingLink}</a>
            </td>
          </tr>
          `
              : ''
          }
        </table>

        ${
          data.meetingLink
            ? `
        <div style="text-align: center; margin: 24px 0;">
          <a href="${data.meetingLink}"
             style="${emailBaseStyles.button}">
            Join Meeting
          </a>
        </div>
        `
            : ''
        }

        <hr style="${emailBaseStyles.divider}">

        <p style="${emailBaseStyles.text}">
          Please make sure to be available at the scheduled time. If you need to reschedule or have any questions,
          please contact us as soon as possible.
        </p>

        <p style="${emailBaseStyles.text}">We look forward to speaking with you!</p>

        <div style="${emailBaseStyles.footer}">
          <p>Best regards,<br/>The Borderless Team</p>
        </div>
      </div>
    </div>
  `;

  return { subject, text, html };
}
