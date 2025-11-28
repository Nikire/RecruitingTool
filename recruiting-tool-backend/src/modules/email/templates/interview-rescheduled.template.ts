import { EmailTemplate, emailBaseStyles, formatEmailDate, formatEmailTime } from './email-template.interface';

export interface InterviewRescheduledData {
  candidateName: string;
  jobPosition: string;
  oldDate: string | Date;
  oldTime: string;
  newDate: string | Date;
  newTime: string;
  duration?: number;
  location?: string;
  meetingLink?: string;
  interviewers: string[];
  reason?: string;
  notes?: string;
  hrName?: string;
}

export function interviewRescheduledTemplate(data: InterviewRescheduledData): EmailTemplate {
  const oldFormattedDate = formatEmailDate(data.oldDate);
  const oldFormattedTime = formatEmailTime(data.oldTime);
  const newFormattedDate = formatEmailDate(data.newDate);
  const newFormattedTime = formatEmailTime(data.newTime);
  const durationText = data.duration ? `${data.duration} minutes` : 'TBD';

  const subject = `Interview Rescheduled: ${data.jobPosition} - Now on ${newFormattedDate}`;

  const text = `
Dear ${data.candidateName},

Your interview for the position of ${data.jobPosition} has been rescheduled.

${data.reason ? `Reason: ${data.reason}` : ''}

Previous Schedule:
-----------------
Date: ${oldFormattedDate}
Time: ${oldFormattedTime}

New Schedule:
------------
Date: ${newFormattedDate}
Time: ${newFormattedTime}
Duration: ${durationText}
${data.location ? `Location: ${data.location}` : ''}
${data.meetingLink ? `Meeting Link: ${data.meetingLink}` : ''}

Interviewers:
${data.interviewers.map((name) => `- ${name}`).join('\n')}

${data.notes ? `Additional Notes:\n${data.notes}` : ''}

We apologize for any inconvenience this may cause. Please confirm that you are available at the new scheduled time.

We look forward to speaking with you!

Best regards,
${data.hrName || 'The Recruiting Team'}
  `.trim();

  const html = `
    <div style="${emailBaseStyles.container}">
      <div style="${emailBaseStyles.card}">
        <h1 style="${emailBaseStyles.header}">Interview Rescheduled</h1>

        <p style="${emailBaseStyles.text}">Dear <strong>${data.candidateName}</strong>,</p>

        <p style="${emailBaseStyles.text}">
          Your interview for the position of <strong>${data.jobPosition}</strong> has been
          <strong style="color: #f57c00;">rescheduled</strong>.
        </p>

        ${
          data.reason
            ? `
        <p style="${emailBaseStyles.text}">
          <strong>Reason:</strong> ${data.reason}
        </p>
        `
            : ''
        }

        <h2 style="${emailBaseStyles.subheader}">Previous Schedule</h2>
        <table style="${emailBaseStyles.table}">
          <tr>
            <td style="${emailBaseStyles.tableCellBold}">Date</td>
            <td style="${emailBaseStyles.tableCell}; text-decoration: line-through;">${oldFormattedDate}</td>
          </tr>
          <tr>
            <td style="${emailBaseStyles.tableCellBold}">Time</td>
            <td style="${emailBaseStyles.tableCell}; text-decoration: line-through;">${oldFormattedTime}</td>
          </tr>
        </table>

        <h2 style="${emailBaseStyles.subheader}">New Schedule</h2>
        <table style="${emailBaseStyles.table}">
          <tr>
            <td style="${emailBaseStyles.tableCellBold}">Date</td>
            <td style="${emailBaseStyles.tableCell}; background-color: #e8f5e9;">${newFormattedDate}</td>
          </tr>
          <tr>
            <td style="${emailBaseStyles.tableCellBold}">Time</td>
            <td style="${emailBaseStyles.tableCell}; background-color: #e8f5e9;">${newFormattedTime}</td>
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
          We apologize for any inconvenience this may cause. Please confirm that you are available at the new scheduled time.
        </p>

        <p style="${emailBaseStyles.text}">
          We look forward to speaking with you!
        </p>

        <div style="${emailBaseStyles.footer}">
          <p>Best regards,<br>${data.hrName || 'The Recruiting Team'}</p>
        </div>
      </div>
    </div>
  `;

  return { subject, text, html };
}
