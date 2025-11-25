# n8n Integration for Recruiting Tool

This document provides comprehensive information about integrating n8n workflow automation with the Recruiting Tool.

## Table of Contents

1. [Overview](#overview)
2. [Setup Instructions](#setup-instructions)
3. [Available Webhook Endpoints](#available-webhook-endpoints)
4. [Authentication](#authentication)
5. [Example n8n Workflows](#example-n8n-workflows)
6. [Testing Webhooks](#testing-webhooks)
7. [Security Best Practices](#security-best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Overview

n8n is a powerful workflow automation tool that allows you to create automated workflows for the recruiting process. The Recruiting Tool provides webhook endpoints that can be used as triggers in n8n to automate various recruiting tasks.

**Key Benefits:**
- Automate email communications with candidates
- Integrate with external systems (Slack, CRM, calendar systems)
- Send automated reminders and notifications
- Update analytics and reporting systems
- Trigger custom business logic on recruiting events

---

## Setup Instructions

### 1. Start n8n Service

n8n is included in the docker-compose configuration. Start all services:

```bash
docker-compose up -d
```

n8n will be available at: **http://localhost:5678**

### 2. Configure Environment Variables

Add the following to your `.env` file in the root directory:

```bash
# n8n Workflow Automation
N8N_USER=admin
N8N_PASSWORD=admin123
N8N_HOST=localhost

# Webhook API Key for n8n Integration
WEBHOOK_API_KEY=your-secure-webhook-api-key-change-in-production
```

Also add to `recruiting-tool-backend/.env`:

```bash
# Webhook API Key for n8n Integration
WEBHOOK_API_KEY=your-secure-webhook-api-key-change-in-production
```

**IMPORTANT:** Change `WEBHOOK_API_KEY` to a secure random string in production!

### 3. Generate Secure API Key (Production)

For production, generate a secure API key:

```bash
# Generate a random 32-character API key
openssl rand -hex 32
```

### 4. Access n8n

1. Open browser to: http://localhost:5678
2. Login with credentials from `.env`:
   - Username: `admin` (or your configured `N8N_USER`)
   - Password: `admin123` (or your configured `N8N_PASSWORD`)

---

## Available Webhook Endpoints

All webhook endpoints require authentication via API key (see [Authentication](#authentication) section).

### Base URL

```
http://localhost:4000/webhooks
```

For production, replace with your production backend URL.

---

### 1. Candidate Created

**Endpoint:** `POST /webhooks/candidate-created`

**Description:** Triggered when a new candidate is created in the system.

**Request Body:**

```json
{
  "candidateUid": "cand_123456789",
  "candidateName": "John Doe",
  "candidateEmail": "john.doe@example.com",
  "jobPositionUid": "job_123456789",
  "metadata": {
    "source": "website",
    "referrer": "linkedin"
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Candidate created webhook processed for John Doe"
}
```

**Use Cases:**
- Send welcome email to candidate
- Add candidate to CRM system
- Notify recruitment team via Slack
- Update analytics dashboard
- Trigger background check process

---

### 2. Interview Scheduled

**Endpoint:** `POST /webhooks/interview-scheduled`

**Description:** Triggered when an interview is scheduled.

**Request Body:**

```json
{
  "interviewUid": "int_123456789",
  "candidateUid": "cand_123456789",
  "candidateName": "John Doe",
  "scheduledAt": "2025-11-30T10:00:00Z",
  "interviewType": "Technical Interview",
  "interviewerName": "Jane Smith",
  "meetingLink": "https://meet.google.com/abc-defg-hij"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Interview scheduled webhook processed for John Doe"
}
```

**Use Cases:**
- Send calendar invites to candidate and interviewer
- Send reminder email 24 hours before interview
- Update external calendar systems
- Notify Slack channel
- Trigger interview preparation materials email

---

### 3. Stage Changed

**Endpoint:** `POST /webhooks/stage-changed`

**Description:** Triggered when a candidate moves between hiring stages.

**Request Body:**

```json
{
  "candidateUid": "cand_123456789",
  "candidateName": "John Doe",
  "previousStage": "Phone Screen",
  "newStage": "Technical Interview",
  "jobPositionUid": "job_123456789",
  "changedBy": "user_123456789"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Stage changed webhook processed for John Doe"
}
```

**Use Cases:**
- Send stage-specific emails to candidates
- Update analytics and reporting dashboards
- Notify hiring managers of stage progression
- Trigger stage-specific tasks (e.g., schedule next interview)
- Update external ATS or CRM systems

---

### 4. Application Status Changed

**Endpoint:** `POST /webhooks/application-status-changed`

**Description:** Triggered when an application status changes (e.g., ACCEPTED, REJECTED).

**Request Body:**

```json
{
  "applicationUid": "app_123456789",
  "candidateUid": "cand_123456789",
  "candidateName": "John Doe",
  "previousStatus": "IN_REVIEW",
  "newStatus": "ACCEPTED",
  "jobPositionUid": "job_123456789",
  "reason": "Candidate accepted the offer"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Application status changed webhook processed for John Doe"
}
```

**Use Cases:**
- Send offer letter to accepted candidates
- Send rejection emails with feedback
- Trigger onboarding workflow for accepted candidates
- Update HR systems
- Schedule orientation meetings

---

### 5. Webhook Health Check

**Endpoint:** `GET /webhooks/health`

**Description:** Check webhook service health and available endpoints.

**Response:**

```json
{
  "status": "healthy",
  "webhooksAvailable": [
    "candidate-created",
    "interview-scheduled",
    "stage-changed",
    "application-status-changed"
  ]
}
```

---

## Authentication

All webhook endpoints (except health check) require API key authentication.

### Method 1: HTTP Header (Recommended)

Add the `X-API-Key` header to your requests:

```bash
curl -X POST http://localhost:4000/webhooks/candidate-created \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-secure-webhook-api-key" \
  -d '{"candidateUid": "cand_123", "candidateName": "John Doe", "candidateEmail": "john@example.com"}'
```

### Method 2: Query Parameter

Alternatively, pass the API key as a query parameter:

```bash
curl -X POST "http://localhost:4000/webhooks/candidate-created?apiKey=your-secure-webhook-api-key" \
  -H "Content-Type: application/json" \
  -d '{"candidateUid": "cand_123", "candidateName": "John Doe", "candidateEmail": "john@example.com"}'
```

### In n8n

When configuring HTTP Request nodes in n8n:

1. **Headers Method:**
   - Add a header: `X-API-Key`
   - Value: `{{$env.WEBHOOK_API_KEY}}` or your API key directly

2. **Query Parameter Method:**
   - Add query parameter: `apiKey`
   - Value: Your webhook API key

---

## Example n8n Workflows

### 1. Auto-Send Welcome Email on Candidate Creation

**Workflow Steps:**

1. **Webhook Trigger** (listening to your backend)
2. **HTTP Request** to `POST /webhooks/candidate-created`
3. **Email Node** - Send welcome email
   - To: `{{$json["candidateEmail"]}}`
   - Subject: "Welcome to the Hiring Process"
   - Body: Personalized welcome message

**n8n Configuration:**

```json
{
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300],
      "webhookId": "candidate-created"
    },
    {
      "name": "Send Welcome Email",
      "type": "n8n-nodes-base.emailSend",
      "position": [450, 300],
      "parameters": {
        "toEmail": "={{$json[\"candidateEmail\"]}}",
        "subject": "Welcome to {{$json[\"companyName\"]}} Hiring Process",
        "text": "Hi {{$json[\"candidateName\"]}},\n\nThank you for applying! We've received your application..."
      }
    }
  ]
}
```

---

### 2. Send Interview Reminder 24 Hours Before

**Workflow Steps:**

1. **HTTP Request** to `POST /webhooks/interview-scheduled`
2. **Wait Node** - Wait until 24 hours before interview
3. **Email Node** - Send reminder email
   - To: Candidate email
   - Subject: "Interview Reminder - Tomorrow"
   - Body: Interview details and preparation tips

---

### 3. Notify Slack on Interview Scheduled

**Workflow Steps:**

1. **HTTP Request** to `POST /webhooks/interview-scheduled`
2. **Slack Node** - Post message to channel
   - Channel: `#recruiting`
   - Message: "Interview scheduled: {{$json['candidateName']}} on {{$json['scheduledAt']}}"

---

### 4. Update CRM on Candidate Hired

**Workflow Steps:**

1. **HTTP Request** to `POST /webhooks/application-status-changed`
2. **IF Node** - Check if status is "ACCEPTED"
3. **HTTP Request** to your CRM API
   - Method: POST
   - Endpoint: Your CRM endpoint
   - Body: Candidate data

---

### 5. Multi-Stage Workflow: Complete Hiring Process

**Complex Workflow:**

1. **Candidate Created** → Send welcome email + Add to CRM
2. **Interview Scheduled** → Send calendar invite + 24h reminder
3. **Stage Changed** → Update analytics + Notify hiring manager
4. **Application Accepted** → Send offer letter + Start onboarding
5. **Application Rejected** → Send rejection email with feedback

---

## Testing Webhooks

### Using curl

Test webhook endpoints locally with curl:

```bash
# Test candidate created webhook
curl -X POST http://localhost:4000/webhooks/candidate-created \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-secure-webhook-api-key" \
  -d '{
    "candidateUid": "cand_test123",
    "candidateName": "Test Candidate",
    "candidateEmail": "test@example.com",
    "jobPositionUid": "job_test123"
  }'

# Test interview scheduled webhook
curl -X POST http://localhost:4000/webhooks/interview-scheduled \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-secure-webhook-api-key" \
  -d '{
    "interviewUid": "int_test123",
    "candidateUid": "cand_test123",
    "candidateName": "Test Candidate",
    "scheduledAt": "2025-12-01T10:00:00Z",
    "interviewType": "Technical Interview"
  }'
```

### Using Postman

1. Import the API collection from Swagger documentation
2. Set environment variable: `WEBHOOK_API_KEY`
3. Test each webhook endpoint with sample data

### Using n8n Built-in Testing

1. Create a new workflow in n8n
2. Add an HTTP Request node
3. Configure with webhook URL and authentication
4. Click "Execute Node" to test

---

## Security Best Practices

### 1. Secure API Keys

- **NEVER** commit API keys to version control
- Use different API keys for development, staging, and production
- Rotate API keys regularly (every 90 days recommended)
- Store API keys in environment variables only

### 2. Use HTTPS in Production

```bash
# Production webhook URL should always use HTTPS
https://api.yourcompany.com/webhooks/candidate-created
```

### 3. Restrict Network Access

- Configure firewall rules to allow webhook calls only from trusted IPs
- Use VPC/private networking if n8n and backend are on the same cloud provider
- Consider using API Gateway for additional security layer

### 4. Validate Webhook Payloads

The backend automatically validates all webhook payloads using class-validator. Invalid payloads will return `400 Bad Request`.

### 5. Monitor Webhook Activity

- Enable logging for all webhook calls
- Set up alerts for failed webhook calls
- Monitor for unusual patterns (e.g., too many calls from one IP)

### 6. Rate Limiting (Recommended)

Consider adding rate limiting to webhook endpoints in production:

```typescript
// Example: Add rate limiting guard
@UseGuards(ThrottlerGuard)
@Throttle(10, 60) // 10 requests per 60 seconds
```

---

## Troubleshooting

### Issue: "Invalid or missing API key"

**Solution:**
- Verify `WEBHOOK_API_KEY` is set in backend `.env` file
- Ensure you're sending the API key in the header (`X-API-Key`) or query parameter (`apiKey`)
- Check that the API key matches exactly (no extra spaces or quotes)

### Issue: "n8n container not starting"

**Solution:**
```bash
# Check container logs
docker logs recruitingtool-n8n

# Restart n8n service
docker-compose restart n8n
```

### Issue: "Webhook endpoint returns 404"

**Solution:**
- Verify backend service is running: `docker ps`
- Check that WebhooksModule is registered in app.module.ts
- Verify URL is correct: `http://localhost:4000/webhooks/<endpoint-name>`

### Issue: "n8n can't reach backend webhooks"

**Solution:**
- Ensure both services are on the same Docker network (`app-network`)
- Try using service name instead of localhost: `http://backend:4000/webhooks/...`
- Check network connectivity: `docker exec -it recruitingtool-n8n ping backend`

### Issue: "Webhook times out"

**Solution:**
- Check backend logs for errors: `docker logs recruitingtool-backend`
- Verify database connection is healthy
- Increase timeout in n8n HTTP Request node settings

### Issue: "Data not passing correctly between nodes"

**Solution:**
- Use n8n's built-in expression editor: `{{$json["fieldName"]}}`
- Check the output of previous nodes to see the data structure
- Use the "Execute Node" button to test individual nodes

---

## Advanced Configuration

### Custom Webhook Events

To add new webhook events:

1. **Create DTO** in `webhooks/dto/webhook.dto.ts`
2. **Add service method** in `webhooks.service.ts`
3. **Add controller endpoint** in `webhooks.controller.ts`
4. **Update documentation** in this file

### Webhook Retry Logic

n8n has built-in retry logic for failed HTTP requests:

1. Go to Settings → Error Workflow
2. Configure retry attempts (recommended: 3)
3. Configure retry delay (recommended: exponential backoff)

### Webhook Response Handling

All webhook endpoints return a consistent response format:

```json
{
  "success": boolean,
  "message": string
}
```

Use n8n's IF node to handle different responses:
- `{{$json["success"] === true}}` → Success path
- `{{$json["success"] === false}}` → Error handling path

---

## Further Resources

- **n8n Documentation:** https://docs.n8n.io/
- **n8n Community:** https://community.n8n.io/
- **Recruiting Tool API Docs:** http://localhost:4000/api (Swagger)
- **GitHub Repository:** [Your repo URL]

---

## Support

For issues or questions:
1. Check this documentation
2. Check backend logs: `docker logs recruitingtool-backend`
3. Check n8n logs: `docker logs recruitingtool-n8n`
4. Open an issue on GitHub with detailed error information

---

**Last Updated:** November 2025
**Version:** 1.0.0
