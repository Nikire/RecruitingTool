import { EmailTemplate, emailBaseStyles, formatEmailDate, formatEmailTime } from './email-template.interface';

export interface InterviewCancelledData {
  candidateName: string;
  jobPosition: string;
  date: string | Date;
  time: string;
  reason?: string;
  hrName?: string;
  willReschedule?: boolean;
}

export function interviewCancelledTemplate(data: InterviewCancelledData): EmailTemplate {
  const formattedDate = formatEmailDate(data.date);
  const formattedTime = formatEmailTime(data.time);

  const subject = `Interview Cancelled: ${data.jobPosition} - ${formattedDate}`;

  const text = `
Dear ${data.candidateName},

We regret to inform you that your scheduled interview for the position of ${data.jobPosition} has been cancelled.

Original Schedule:
-----------------
Date: ${formattedDate}
Time: ${formattedTime}

${data.reason ? `Reason: ${data.reason}` : ''}

${
  data.willReschedule
    ? 'We apologize for any inconvenience this may cause. Our team will be in touch with you shortly to reschedule the interview.'
    : 'We apologize for any inconvenience this may cause. If you have any questions, please feel free to contact us.'
}

Best regards,
${data.hrName || 'The BorderLess Team - EMP Employment Solutions'}
  `.trim();

  const html = `
    <div style="${emailBaseStyles.container}">
      <div style="${emailBaseStyles.card}">
        <h1 style="${emailBaseStyles.header}">Interview Cancelled</h1>

        <p style="${emailBaseStyles.text}">Dear <strong>${data.candidateName}</strong>,</p>

        <p style="${emailBaseStyles.text}">
          We regret to inform you that your scheduled interview for the position of
          <strong>${data.jobPosition}</strong> has been <strong style="color: #d32f2f;">cancelled</strong>.
        </p>

        <h2 style="${emailBaseStyles.subheader}">Original Schedule</h2>

        <table cellpadding="0" cellspacing="0" style="${emailBaseStyles.table}">
          <tr>
            <td style="${emailBaseStyles.tableCellBold}">Date</td>
            <td style="${emailBaseStyles.tableCell}">${formattedDate}</td>
          </tr>
          <tr>
            <td style="${emailBaseStyles.tableCellBold}">Time</td>
            <td style="${emailBaseStyles.tableCell}">${formattedTime}</td>
          </tr>
          ${
            data.reason
              ? `
          <tr>
            <td style="${emailBaseStyles.tableCellBold}">Reason</td>
            <td style="${emailBaseStyles.tableCell}">${data.reason}</td>
          </tr>
          `
              : ''
          }
        </table>

        <hr style="${emailBaseStyles.divider}">

        <p style="${emailBaseStyles.text}">
          ${
            data.willReschedule
              ? 'We apologize for any inconvenience this may cause. Our team will be in touch with you shortly to reschedule the interview.'
              : 'We apologize for any inconvenience this may cause. If you have any questions, please feel free to contact us.'
          }
        </p>

        <div style="${emailBaseStyles.footer}">
          <p>Best regards,<br>${data.hrName || 'The BorderLess Team - EMP Employment Solutions'}</p>
        </div>
      </div>
    </div>
  `;

  return { subject, text, html };
}
