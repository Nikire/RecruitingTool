import { EmailTemplate, emailBaseStyles, formatEmailDate, formatEmailTime } from './email-template.interface';

export interface InterviewReminderData {
  candidateName: string;
  jobPosition: string;
  date: string | Date;
  time: string;
  duration?: number;
  location?: string;
  meetingLink?: string;
  interviewers: string[];
  notes?: string;
  reminderType?: 'tomorrow' | 'today' | '1hour';
}

export function interviewReminderTemplate(data: InterviewReminderData): EmailTemplate {
  const formattedDate = formatEmailDate(data.date);
  const formattedTime = formatEmailTime(data.time);
  const durationText = data.duration ? `${data.duration} minutes` : 'TBD';

  let reminderText = 'upcoming interview';
  if (data.reminderType === 'tomorrow') reminderText = 'interview tomorrow';
  if (data.reminderType === 'today') reminderText = 'interview today';
  if (data.reminderType === '1hour') reminderText = 'interview in 1 hour';

  const subject = `Reminder: Interview ${data.reminderType === 'tomorrow' ? 'Tomorrow' : 'Today'} - ${data.jobPosition}`;

  const text = `
Dear ${data.candidateName},

This is a friendly reminder about your ${reminderText} for the position of ${data.jobPosition}.

Interview Details:
-----------------
Date: ${formattedDate}
Time: ${formattedTime}
Duration: ${durationText}
${data.location ? `Location: ${data.location}` : ''}
${data.meetingLink ? `Meeting Link: ${data.meetingLink}` : ''}

Interviewers:
${data.interviewers.map((name) => `- ${name}`).join('\n')}

${data.notes ? `Additional Notes:\n${data.notes}` : ''}

Please make sure you are prepared and available at the scheduled time.

We look forward to speaking with you!

Best regards,
The BorderLess Team - EMP Employment Solutions
  `.trim();

  const html = `
    <div style="${emailBaseStyles.container}">
      <div style="${emailBaseStyles.card}">
        <h1 style="${emailBaseStyles.header}">Interview Reminder</h1>

        <p style="${emailBaseStyles.text}">Dear <strong>${data.candidateName}</strong>,</p>

        <p style="${emailBaseStyles.text}">
          This is a friendly reminder about your <strong>${reminderText}</strong> for the position of
          <strong>${data.jobPosition}</strong>.
        </p>

        <h2 style="${emailBaseStyles.subheader}">Interview Details</h2>

        <table style="${emailBaseStyles.table}">
          <tr>
            <td style="${emailBaseStyles.tableCellBold}">Date</td>
            <td style="${emailBaseStyles.tableCell}">${formattedDate}</td>
          </tr>
          <tr>
            <td style="${emailBaseStyles.tableCellBold}">Time</td>
            <td style="${emailBaseStyles.tableCell}">${formattedTime}</td>
          </tr>
          <tr>
            <td style="${emailBaseStyles.tableCellBold}">Duration</td>
            <td style="${emailBaseStyles.tableCell}">${durationText}</td>
          </tr>
          ${
            data.location
              ? `
          <tr>
            <td style="${emailBaseStyles.tableCellBold}">Location</td>
            <td style="${emailBaseStyles.tableCell}">${data.location}</td>
          </tr>
          `
              : ''
          }
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

        <h2 style="${emailBaseStyles.subheader}">Interviewers</h2>
        <ul style="${emailBaseStyles.text}">
          ${data.interviewers.map((name) => `<li>${name}</li>`).join('')}
        </ul>

        ${
          data.notes
            ? `
        <h2 style="${emailBaseStyles.subheader}">Additional Notes</h2>
        <p style="${emailBaseStyles.text}">${data.notes}</p>
        `
            : ''
        }

        <hr style="${emailBaseStyles.divider}">

        <p style="${emailBaseStyles.text}">
          Please make sure you are prepared and available at the scheduled time.
        </p>

        <p style="${emailBaseStyles.text}">
          We look forward to speaking with you!
        </p>

        <div style="${emailBaseStyles.footer}">
          <p>Best regards,<br>The BorderLess Team - EMP Employment Solutions</p>
        </div>
      </div>
    </div>
  `;

  return { subject, text, html };
}
