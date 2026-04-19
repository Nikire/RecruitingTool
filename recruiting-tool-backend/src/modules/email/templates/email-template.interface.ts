export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

/**
 * Base styles for email templates
 * Uses inline CSS for maximum email client compatibility
 */
export const emailBaseStyles = {
  container: 'font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;',
  card: 'background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);',
  header: 'color: #333333; font-size: 24px; font-weight: bold; margin-bottom: 20px;',
  subheader: 'color: #666666; font-size: 18px; font-weight: bold; margin-top: 20px; margin-bottom: 10px;',
  text: 'color: #333333; font-size: 14px; line-height: 1.6; margin-bottom: 15px;',
  table: 'border-collapse: collapse; border-spacing: 0; width: 100%; max-width: 500px; margin: 20px 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt;',
  tableCell: 'padding: 12px; border: 1px solid #e0e0e0; margin: 0;',
  tableCellBold: 'padding: 12px; border: 1px solid #e0e0e0; font-weight: bold; background-color: #f5f5f5; margin: 0;',
  button: 'display: inline-block; background-color: #1976d2; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 20px 0;',
  link: 'color: #1976d2; text-decoration: none;',
  footer: 'color: #999999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;',
  divider: 'border: 0; height: 1px; background-color: #e0e0e0; margin: 20px 0;',
};

/**
 * Format date for email display
 */
export function formatEmailDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format time for email display
 */
export function formatEmailTime(time: string): string {
  return time;
}
