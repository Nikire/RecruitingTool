# Email Template Variables

## Overview

Email templates in the BorderLess support **Handlebars** syntax for dynamic variable substitution. This allows you to create personalized email content using placeholders that get replaced with actual data when the email is sent.

## Variable Syntax

Variables are enclosed in double curly braces: `{{variableName}}`

**Example:**
```
Dear {{candidateName}},

Thank you for applying to the {{positionTitle}} position at {{companyName}}.
```

## Available Variables

### Common Variables (Available in all templates)

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `{{candidateName}}` | Full name of the candidate | "John Doe" |
| `{{positionTitle}}` | Title of the job position | "Senior Software Engineer" |
| `{{companyName}}` | Name of the company | "Tech Innovations Inc" |
| `{{hrName}}` | Name of the HR person sending the email | "Jane Smith" |

### Interview-Specific Variables

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `{{interviewDate}}` | Date of the interview | "2025-12-15" or "Monday, December 15, 2025" |
| `{{interviewTime}}` | Time of the interview | "10:00 AM" or "14:00" |
| `{{interviewLocation}}` | Location or meeting link | "Conference Room A" or "https://meet.google.com/abc-defg-hij" |

### Additional Variables (Context-dependent)

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `{{applicationDate}}` | Date when candidate applied | "2025-12-01" |
| `{{jobDescription}}` | Full job description | "We are looking for..." |
| `{{salary}}` | Salary information (if public) | "$80,000 - $120,000" |
| `{{deadline}}` | Application deadline | "December 31, 2025" |
| `{{nextSteps}}` | Information about next steps | "We will review your application..." |

## Template Types

### 1. APPLICATION_RECEIVED
Sent automatically when a candidate submits an application.

**Recommended Variables:**
- `{{candidateName}}`
- `{{positionTitle}}`
- `{{companyName}}`
- `{{hrName}}`

**Example:**
```html
<p>Dear {{candidateName}},</p>

<p>Thank you for applying to the <strong>{{positionTitle}}</strong> position at {{companyName}}.</p>

<p>We have successfully received your application and our team is currently reviewing it.</p>

<p>Best regards,<br>
{{hrName}}<br>
{{companyName}} Talent Acquisition Team</p>
```

### 2. APPLICATION_REJECTED
Sent when a candidate's application is rejected.

**Recommended Variables:**
- `{{candidateName}}`
- `{{positionTitle}}`
- `{{companyName}}`
- `{{hrName}}`

**Example:**
```html
<p>Dear {{candidateName}},</p>

<p>Thank you for your interest in the <strong>{{positionTitle}}</strong> position at {{companyName}}.</p>

<p>After careful consideration, we have decided to move forward with other candidates.</p>

<p>We encourage you to apply for future positions that match your qualifications.</p>

<p>Best regards,<br>
{{hrName}}<br>
{{companyName}}</p>
```

### 3. APPLICATION_SHORTLISTED
Sent when a candidate is shortlisted for further consideration.

**Recommended Variables:**
- `{{candidateName}}`
- `{{positionTitle}}`
- `{{companyName}}`
- `{{hrName}}`

**Example:**
```html
<p>Dear {{candidateName}},</p>

<p><strong>Congratulations!</strong> Your application for the <strong>{{positionTitle}}</strong> position has been shortlisted.</p>

<p>We were impressed by your qualifications and would like to proceed to the next stage.</p>

<p>Best regards,<br>
{{hrName}}<br>
{{companyName}}</p>
```

### 4. INTERVIEW_INVITATION
Sent when inviting a candidate to an interview.

**Recommended Variables:**
- `{{candidateName}}`
- `{{positionTitle}}`
- `{{companyName}}`
- `{{hrName}}`
- `{{interviewDate}}`
- `{{interviewTime}}`
- `{{interviewLocation}}`

**Example:**
```html
<p>Dear {{candidateName}},</p>

<p>We are pleased to invite you for an interview for the <strong>{{positionTitle}}</strong> position at {{companyName}}.</p>

<div>
  <h3>Interview Details</h3>
  <p><strong>Date:</strong> {{interviewDate}}<br>
  <strong>Time:</strong> {{interviewTime}}<br>
  <strong>Location:</strong> {{interviewLocation}}</p>
</div>

<p>Please confirm your availability.</p>

<p>Best regards,<br>
{{hrName}}<br>
{{companyName}}</p>
```

### 5. INTERVIEW_REMINDER
Sent as a reminder before an interview.

**Recommended Variables:**
- `{{candidateName}}`
- `{{positionTitle}}`
- `{{companyName}}`
- `{{hrName}}`
- `{{interviewDate}}`
- `{{interviewTime}}`
- `{{interviewLocation}}`

**Example:**
```html
<p>Hi {{candidateName}},</p>

<p><strong>Reminder:</strong> Your interview for the <strong>{{positionTitle}}</strong> position is tomorrow!</p>

<p><strong>Date:</strong> {{interviewDate}}<br>
<strong>Time:</strong> {{interviewTime}}<br>
<strong>Location:</strong> {{interviewLocation}}</p>

<p>See you soon!</p>

<p>Best,<br>
{{hrName}}<br>
{{companyName}}</p>
```

### 6. OFFER_LETTER
Sent when extending a job offer to a candidate.

**Recommended Variables:**
- `{{candidateName}}`
- `{{positionTitle}}`
- `{{companyName}}`
- `{{hrName}}`
- `{{salary}}` (optional)
- `{{startDate}}` (optional)

**Example:**
```html
<p>Dear {{candidateName}},</p>

<div style="background-color: #d4edda; padding: 25px;">
  <h2>Congratulations!</h2>
  <p>We are delighted to offer you the position of <strong>{{positionTitle}}</strong> at {{companyName}}!</p>
</div>

<p>Please find the detailed offer letter attached. We request your response within 5 business days.</p>

<p>We look forward to welcoming you to the team!</p>

<p>Best regards,<br>
{{hrName}}<br>
{{companyName}}</p>
```

## Best Practices

### 1. Always Include Core Variables
Ensure every template includes at least:
- `{{candidateName}}` (personalization)
- `{{companyName}}` (branding)
- `{{hrName}}` (contact person)

### 2. Use Professional HTML Structure
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .footer { background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h2>{{companyName}}</h2>
  </div>
  <div class="content">
    <!-- Your email content here -->
  </div>
  <div class="footer">
    <p>&copy; {{companyName}}. All rights reserved.</p>
  </div>
</body>
</html>
```

### 3. Mobile-Friendly Design
- Use responsive layouts
- Keep line length reasonable
- Use adequate font sizes (minimum 14px)
- Test on different email clients

### 4. Clear Call-to-Actions
If the email requires action from the candidate:
```html
<p><strong>Please confirm your availability</strong> by replying to this email.</p>
```

### 5. Provide Context
Always explain what the email is about and what happens next:
```html
<p><strong>What happens next?</strong></p>
<ul>
  <li>Our hiring team will review your application</li>
  <li>We will get back to you within 5-7 business days</li>
  <li>If selected, we'll invite you for an interview</li>
</ul>
```

## Testing Templates

### Preview Function
Use the `/api/email-templates/:uid/preview` endpoint to test templates with sample data:

```bash
curl -X POST http://localhost:4000/api/email-templates/:uid/preview \
  -H "Content-Type: application/json" \
  -d '{
    "variables": {
      "candidateName": "Test User",
      "positionTitle": "Test Position",
      "companyName": "Test Company",
      "hrName": "Test HR",
      "interviewDate": "2025-12-15",
      "interviewTime": "10:00 AM",
      "interviewLocation": "Conference Room A"
    }
  }'
```

### Default Sample Data
If no variables are provided, the preview endpoint uses these defaults:
- candidateName: "John Doe"
- positionTitle: "Senior Software Engineer"
- companyName: "Tech Corp"
- hrName: "Jane Smith"
- interviewDate: Current date
- interviewTime: "10:00 AM"

## Troubleshooting

### Variable Not Rendering
**Problem:** `{{variableName}}` appears literally in the email.

**Solution:**
- Check spelling (case-sensitive)
- Ensure variable is provided when sending the email
- Verify Handlebars syntax (double curly braces)

### HTML Not Rendering Correctly
**Problem:** Email client shows broken HTML or plain text.

**Solution:**
- Use inline CSS instead of `<style>` tags for better compatibility
- Test with multiple email clients (Gmail, Outlook, Apple Mail)
- Use table-based layouts for maximum compatibility

### Missing Data in Variables
**Problem:** Variable renders but shows "undefined" or empty.

**Solution:**
- Check that the backend service provides all required variables
- Add fallback values in critical places:
  ```
  {{candidateName}} or "Valued Candidate"
  ```

## Related Documentation

- Email Templates Service: `recruiting-tool-backend/src/modules/email-templates/`
- Email Service: `recruiting-tool-backend/src/modules/email/`
- Dummy Data Templates: `recruiting-tool-backend/src/modules/dummy/data/dummy-data.json`
- Handlebars Documentation: https://handlebarsjs.com/

## Support

For questions or issues with email templates:
1. Check this documentation
2. Review the EmailTemplatesService implementation
3. Test using the preview endpoint
4. Contact the development team if issues persist
