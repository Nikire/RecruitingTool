# n8n Quick Start Guide

## Overview

n8n workflow automation has been successfully integrated into the Recruiting Tool. This guide will help you get started quickly.

---

## Services Running

After running `docker-compose up -d`, the following services are available:

- **Backend API**: http://localhost:4000
- **Frontend**: http://localhost:3000
- **n8n Automation**: http://localhost:5678
- **PostgreSQL**: localhost:5432
- **MinIO**: http://localhost:9000 (API) / http://localhost:9001 (Console)
- **pgAdmin**: http://localhost:8080

---

## Quick Start Steps

### 1. Access n8n

Open your browser and navigate to:
```
http://localhost:5678
```

Login with default credentials:
- **Username**: `admin`
- **Password**: `admin123`

(Change these in `.env` file for production)

---

### 2. Set Up Your Webhook API Key

**IMPORTANT**: Before using webhooks, set up your API key:

1. Copy `.env.example` to `.env` (both root and `recruiting-tool-backend/`)
2. Add a secure API key:
   ```bash
   WEBHOOK_API_KEY=your-secure-random-key-here
   ```
3. Restart backend:
   ```bash
   docker-compose restart backend
   ```

**Generate a secure key (Linux/Mac/Git Bash):**
```bash
openssl rand -hex 32
```

---

### 3. Test Webhook Endpoints

All webhook endpoints are available at: `http://localhost:4000/webhooks/`

**Available Endpoints:**
- `GET /webhooks/health` - Check service health (no auth required)
- `POST /webhooks/candidate-created` - New candidate trigger
- `POST /webhooks/interview-scheduled` - Interview scheduled trigger
- `POST /webhooks/stage-changed` - Candidate stage changed trigger
- `POST /webhooks/application-status-changed` - Application status changed trigger

**Test with curl:**
```bash
# Test health endpoint (no auth needed)
curl http://localhost:4000/webhooks/health

# Test candidate created (requires API key)
curl -X POST http://localhost:4000/webhooks/candidate-created \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-secure-random-key-here" \
  -d '{
    "candidateUid": "cand_test123",
    "candidateName": "Test Candidate",
    "candidateEmail": "test@example.com",
    "jobPositionUid": "job_test123"
  }'
```

---

### 4. Create Your First n8n Workflow

#### Example: Send Welcome Email on Candidate Creation

1. **In n8n**, click **"Add workflow"**

2. **Add Webhook Node** (trigger)
   - Node: "Webhook"
   - HTTP Method: POST
   - Path: `candidate-created`
   - Authentication: None (we'll use our custom auth in the next step)

3. **Add HTTP Request Node** (call backend webhook)
   - Method: POST
   - URL: `http://backend:4000/webhooks/candidate-created`
   - Headers:
     - `X-API-Key`: `your-secure-random-key-here`
     - `Content-Type`: `application/json`
   - Body: JSON
   - JSON:
     ```json
     {
       "candidateUid": "{{$json.candidateUid}}",
       "candidateName": "{{$json.candidateName}}",
       "candidateEmail": "{{$json.candidateEmail}}",
       "jobPositionUid": "{{$json.jobPositionUid}}"
     }
     ```

4. **Add Email Node** (send email)
   - Configure your SMTP settings
   - To: `{{$json.candidateEmail}}`
   - Subject: "Welcome to Our Hiring Process"
   - Body: Personalized message

5. **Save and Activate** the workflow

---

## Important Configuration Notes

### Docker Networking

When calling the backend from n8n workflows, use the **service name** instead of localhost:

✅ Correct: `http://backend:4000/webhooks/...`
❌ Wrong: `http://localhost:4000/webhooks/...`

Both services are on the `app-network` Docker network and can communicate directly.

---

### Authentication

All webhook endpoints (except `/health`) require API key authentication:

**Method 1: HTTP Header (Recommended)**
```
X-API-Key: your-secure-random-key-here
```

**Method 2: Query Parameter**
```
?apiKey=your-secure-random-key-here
```

---

## Common Use Cases

### 1. Auto-send welcome email on candidate creation
**Trigger**: Candidate created webhook
**Actions**: Send personalized welcome email

### 2. Send interview reminders
**Trigger**: Interview scheduled webhook
**Actions**: Wait 24 hours, send reminder email

### 3. Notify team via Slack
**Trigger**: Any webhook
**Actions**: Post formatted message to Slack channel

### 4. Update external CRM
**Trigger**: Application status changed
**Actions**: HTTP request to CRM API with candidate data

### 5. Generate analytics reports
**Trigger**: Stage changed webhook
**Actions**: Update Google Sheets or analytics dashboard

---

## Complete Documentation

For comprehensive documentation, examples, and troubleshooting, see:

**📄 Full Documentation**: `recruiting-tool-backend/N8N_INTEGRATION.md`

This includes:
- Detailed API endpoint documentation
- Complete workflow examples
- Security best practices
- Troubleshooting guide
- Advanced configurations

---

## Quick Reference: Webhook Payload Examples

### Candidate Created
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

### Interview Scheduled
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

### Stage Changed
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

### Application Status Changed
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

---

## Troubleshooting

**Problem**: Can't access n8n at http://localhost:5678

**Solution**: Check n8n container status:
```bash
docker ps | grep n8n
docker logs recruitingtool-n8n
```

---

**Problem**: "Invalid or missing API key" error

**Solution**:
1. Verify `WEBHOOK_API_KEY` is set in `recruiting-tool-backend/.env`
2. Restart backend: `docker-compose restart backend`
3. Ensure you're sending the correct API key in headers or query params

---

**Problem**: n8n can't reach backend webhooks

**Solution**: Use service name `backend` instead of `localhost`:
```
http://backend:4000/webhooks/candidate-created
```

---

## Need Help?

1. Check logs:
   ```bash
   docker logs recruitingtool-backend-1
   docker logs recruitingtool-n8n
   ```

2. Verify all services are running:
   ```bash
   docker-compose ps
   ```

3. Read full documentation: `recruiting-tool-backend/N8N_INTEGRATION.md`

4. n8n Documentation: https://docs.n8n.io/

---

## Security Reminders

- ✅ Change default n8n credentials (`N8N_USER`, `N8N_PASSWORD`)
- ✅ Use a strong random `WEBHOOK_API_KEY` (32+ characters)
- ✅ Never commit `.env` files to version control
- ✅ Use HTTPS in production
- ✅ Rotate API keys regularly (every 90 days recommended)

---

**Version**: 1.0.0
**Last Updated**: November 2025
