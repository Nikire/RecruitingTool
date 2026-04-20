import { EmailTemplate, emailBaseStyles } from './email-template.interface';

export interface AsyncStageSubmissionReceivedData {
  hrName: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  stageName: string;
  submittedAt: string; // formatted date
  fileCount: number;
  hasTextContent: boolean;
  hiringProcessUrl: string; // HR link to review
}

export function asyncStageSubmissionReceivedTemplate(data: AsyncStageSubmissionReceivedData): EmailTemplate {
  const subject = `New Submission: ${data.candidateName} — ${data.stageName}`;

  const attachmentSummary: string[] = [];
  if (data.fileCount > 0) {
    attachmentSummary.push(`${data.fileCount} file${data.fileCount !== 1 ? 's' : ''}`);
  }
  if (data.hasTextContent) {
    attachmentSummary.push('written response');
  }
  const contentSummary = attachmentSummary.length > 0 ? attachmentSummary.join(' + ') : 'no attachments';

  const text = `
Hi ${data.hrName},

${data.candidateName} has submitted their work for the ${data.stageName} stage.

Candidate: ${data.candidateName} (${data.candidateEmail})
Position: ${data.jobTitle}
Stage: ${data.stageName}
Submitted at: ${data.submittedAt}
Content: ${contentSummary}

Review the submission here: ${data.hiringProcessUrl}

Best regards,
The Borderless Team
  `.trim();

  const html = `
    <div style="${emailBaseStyles.container}">
      <div style="${emailBaseStyles.card}">
        <h1 style="${emailBaseStyles.header}">New Submission Received</h1>

        <p style="${emailBaseStyles.text}">Hi <strong>${data.hrName}</strong>,</p>

        <p style="${emailBaseStyles.text}">
          <strong>${data.candidateName}</strong> has submitted their work for the
          <strong>${data.stageName}</strong> stage. Review it in the app at your earliest convenience.
        </p>

        <table cellpadding="0" cellspacing="0" style="${emailBaseStyles.table}">
          <tr>
            <td style="${emailBaseStyles.tableCellBold}">Candidate</td>
            <td style="${emailBaseStyles.tableCell}">${data.candidateName}</td>
          </tr>
          <tr>
            <td style="${emailBaseStyles.tableCellBold}">Email</td>
            <td style="${emailBaseStyles.tableCell}">${data.candidateEmail}</td>
          </tr>
          <tr>
            <td style="${emailBaseStyles.tableCellBold}">Position</td>
            <td style="${emailBaseStyles.tableCell}">${data.jobTitle}</td>
          </tr>
          <tr>
            <td style="${emailBaseStyles.tableCellBold}">Stage</td>
            <td style="${emailBaseStyles.tableCell}">${data.stageName}</td>
          </tr>
          <tr>
            <td style="${emailBaseStyles.tableCellBold}">Submitted at</td>
            <td style="${emailBaseStyles.tableCell}">${data.submittedAt}</td>
          </tr>
          <tr>
            <td style="${emailBaseStyles.tableCellBold}">Content</td>
            <td style="${emailBaseStyles.tableCell}">${contentSummary}</td>
          </tr>
        </table>

        <div style="text-align: center; margin: 28px 0;">
          <a href="${data.hiringProcessUrl}" style="${emailBaseStyles.button}">Review Submission →</a>
        </div>

        <hr style="${emailBaseStyles.divider}">

        <div style="${emailBaseStyles.footer}">
          <p>Best regards,<br>The Borderless Team</p>
        </div>
      </div>
    </div>
  `;

  return { subject, text, html };
}
