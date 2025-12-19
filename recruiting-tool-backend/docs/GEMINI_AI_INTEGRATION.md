# Google Gemini AI Integration

## Overview

The BorderLess uses **Google Gemini AI** for advanced AI-powered features including:
- **Resume Parsing**: Automatically extract structured data from uploaded resumes (PDF, DOCX, TXT)
- **Candidate Scoring**: AI-powered candidate evaluation against job position requirements
- **Batch Scoring**: Process multiple candidates at once with queue management

This integration replaces the previous OpenAI implementation with Google's Gemini API for improved performance and cost-efficiency.

---

## Configuration

### Required Environment Variables

Add the following to your `.env` file:

```env
# Google Gemini AI Configuration
GEMINI_API_KEY = 'your-gemini-api-key-here'
GEMINI_MODEL = 'gemini-1.5-flash'  # Optional, default: gemini-1.5-flash
GEMINI_TIER = 'free'                # Optional, default: free
```

### Getting a Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Get API Key"** or **"Create API Key"**
4. Copy the generated API key
5. Add it to your `.env` file as `GEMINI_API_KEY`

**Important**: Keep your API key secure and never commit it to version control.

---

## Gemini Models

The integration supports multiple Gemini models:

| Model | Description | Use Case | Speed | Quality |
|-------|-------------|----------|-------|---------|
| `gemini-1.5-flash` | Fast, efficient model (default) | Resume parsing, quick scoring | Very Fast | Good |
| `gemini-1.5-pro` | Balanced performance and quality | Complex analysis | Fast | Excellent |
| `gemini-1.0-pro` | Legacy model | Basic tasks | Fast | Good |

**Default**: `gemini-1.5-flash` (best balance for most use cases)

To change the model, set `GEMINI_MODEL` in your `.env` file.

---

## Rate Limiting

The integration includes built-in rate limiting to comply with Gemini API quotas:

### Free Tier
- **Requests per minute**: 15 RPM (conservative: 12 RPM)
- **Daily requests**: 1,500 requests/day
- **Rate limit strategy**: 5-second delay between requests
- **Retry logic**: 3 retries with exponential backoff

### Paid Tier
To enable paid tier rate limits:
```env
GEMINI_TIER = 'paid'
```

- **Requests per minute**: 360 RPM
- **Daily requests**: Unlimited
- **Rate limit strategy**: 167ms delay between requests
- **Retry logic**: 5 retries with exponential backoff

---

## Features

### 1. Resume Parsing

Automatically extract structured data from resume files.

**Endpoint**: `POST /ai/parse-resume`

**Supported File Formats**:
- PDF (`.pdf`)
- Microsoft Word (`.docx`, `.doc`)
- Plain Text (`.txt`)

**Extracted Data**:
- Full name
- Email address
- Phone number
- Skills list
- Work experience (company, title, dates, description)
- Education (institution, degree, field, graduation date)
- Professional summary
- Languages
- Certifications

**Example Request**:
```json
{
  "fileUrl": "https://example.com/resume.pdf"
}
```

**Example Response**:
```json
{
  "success": true,
  "confidence": 85,
  "parsedData": {
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1-555-0123",
    "skills": ["JavaScript", "React", "Node.js"],
    "experience": [
      {
        "company": "Tech Corp",
        "title": "Senior Developer",
        "startDate": "2020-01",
        "endDate": "Present",
        "description": "Led development team..."
      }
    ],
    "education": [
      {
        "institution": "University of Example",
        "degree": "Bachelor of Science",
        "field": "Computer Science",
        "graduationDate": "2019-06"
      }
    ],
    "summary": "Experienced software engineer...",
    "languages": ["English", "Spanish"],
    "certifications": ["AWS Certified Developer"]
  },
  "rawText": "Raw extracted text from resume..."
}
```

---

### 2. Candidate Scoring

AI-powered evaluation of candidates against job position requirements.

**Endpoint**: `POST /ai/score-candidate`

**Request**:
```json
{
  "candidateUid": "550e8400-e29b-41d4-a716-446655440000",
  "jobPositionUid": "550e8400-e29b-41d4-a716-446655440001"
}
```

**Response**:
```json
{
  "uid": "score-uid",
  "candidateUid": "550e8400-e29b-41d4-a716-446655440000",
  "jobPositionUid": "550e8400-e29b-41d4-a716-446655440001",
  "overallScore": 82,
  "skillsScore": 85,
  "experienceScore": 80,
  "educationScore": 78,
  "analysis": {
    "skillsAnalysis": "Strong technical skills matching position requirements...",
    "experienceAnalysis": "5+ years of relevant experience...",
    "educationAnalysis": "Relevant degree in Computer Science...",
    "recommendation": "Strongly Recommend",
    "strengths": [
      "Excellent technical skills",
      "Strong problem-solving abilities",
      "Leadership experience"
    ],
    "concerns": [
      "Limited experience with specific framework X"
    ]
  },
  "scoredAt": "2025-11-25T20:00:00.000Z"
}
```

**Scoring Breakdown**:
- **Skills Score** (0-100): Technical and professional skills match
- **Experience Score** (0-100): Relevant work experience and background
- **Education Score** (0-100): Educational qualifications and certifications
- **Overall Score** (0-100): Weighted average (40% skills, 35% experience, 25% education)

**Recommendation Levels**:
- **Strongly Recommend**: Top candidate (score: 80-100)
- **Recommend**: Strong candidate (score: 60-79)
- **Consider**: Potential candidate (score: 40-59)
- **Not Recommended**: Poor fit (score: 0-39)

---

### 3. Batch Scoring

Process multiple candidates asynchronously with queue management.

**Endpoint**: `POST /ai/batch-score`

**Request**:
```json
{
  "jobPositionUid": "550e8400-e29b-41d4-a716-446655440001",
  "candidateUids": [
    "550e8400-e29b-41d4-a716-446655440000",
    "550e8400-e29b-41d4-a716-446655440002"
  ],
  "priority": "normal"
}
```

**Priority Levels**:
- `low`: Background processing
- `normal`: Standard queue (default)
- `high`: Priority processing

**Check Status**: `GET /ai/batch-score/:batchId/status`

**Get Results**: `GET /ai/batch-score/:batchId/results`

**Cancel Batch**: `DELETE /ai/batch-score/:batchId/cancel`

---

## Error Handling

The GeminiService includes comprehensive error handling:

### Rate Limit Errors
- **Detection**: HTTP 429, "rate limit", "quota exceeded"
- **Handling**: Automatic retry with exponential backoff
- **User Impact**: Transparent (automatic recovery)

### Transient Errors
- **Detection**: HTTP 500/502/503/504, timeout, network errors
- **Handling**: Retry with exponential backoff
- **Max Retries**: 3 (free tier) or 5 (paid tier)

### Non-Retriable Errors
- **Detection**: Invalid input, authentication errors
- **Handling**: Immediate failure with clear error message
- **User Impact**: Action required (fix input or configuration)

### Example Error Response
```json
{
  "statusCode": 500,
  "message": "Gemini API error: Rate limit exceeded",
  "error": "Internal Server Error"
}
```

---

## Token Usage Tracking

The GeminiService tracks token usage and provides statistics:

**Get Usage Stats**:
```typescript
const stats = geminiService.getUsageStats();
console.log(stats);
// {
//   totalTokens: 50000,
//   totalRequests: 100,
//   estimatedCost: 0.05
// }
```

**Reset Stats**:
```typescript
geminiService.resetUsageStats();
```

---

## Best Practices

### 1. API Key Security
- ✅ Store API key in `.env` file
- ✅ Never commit `.env` to version control
- ✅ Use different keys for development/production
- ❌ Never hardcode API keys in source code

### 2. Rate Limiting
- ✅ Use free tier for development/testing
- ✅ Upgrade to paid tier for production
- ✅ Monitor rate limit warnings in logs
- ✅ Use batch scoring for bulk operations

### 3. Error Handling
- ✅ Always handle API errors gracefully
- ✅ Provide fallback options when AI is unavailable
- ✅ Log errors for debugging
- ✅ Show user-friendly error messages

### 4. Performance
- ✅ Use `gemini-1.5-flash` for most tasks (fastest)
- ✅ Cache results when appropriate
- ✅ Use batch scoring for multiple candidates
- ❌ Don't make concurrent requests (rate limits)

---

## Testing

### Local Testing

1. **Get a Free API Key** from Google AI Studio
2. **Add to `.env`**:
   ```env
   GEMINI_API_KEY=your-test-key-here
   GEMINI_TIER=free
   ```
3. **Test Resume Parsing**:
   ```bash
   curl -X POST http://localhost:4000/ai/parse-resume \
     -H "Content-Type: application/json" \
     -d '{"fileUrl": "https://example.com/resume.pdf"}'
   ```

### Sandbox Mode

For testing without consuming quota:
- Use mock responses in test environment
- Set `GEMINI_API_KEY` to empty string to disable AI features
- Backend will return appropriate "AI not configured" errors

---

## Troubleshooting

### "Gemini API is not configured"
**Cause**: Missing or invalid `GEMINI_API_KEY`
**Solution**: Add valid API key to `.env` file

### "Rate limit exceeded"
**Cause**: Too many requests in short time (free tier: 15 RPM)
**Solution**:
- Wait 1 minute before retrying
- Upgrade to paid tier for higher limits
- Use batch scoring instead of individual requests

### "Invalid JSON response"
**Cause**: Gemini returned unexpected format
**Solution**: Check logs for actual response, may need to adjust prompt

### "Failed to parse PDF"
**Cause**: Corrupted or unsupported PDF format
**Solution**: Ensure PDF is text-based (not scanned image)

---

## Migration from OpenAI

The system has been fully migrated from OpenAI to Gemini:

### Changes Made
1. ✅ Replaced OpenAI SDK with Google Generative AI SDK
2. ✅ Created `GeminiService` with rate limiting and error handling
3. ✅ Updated `AiService` to use Gemini for resume parsing
4. ✅ Updated `ScoringService` to use Gemini for candidate scoring
5. ✅ Updated environment variable documentation
6. ✅ Added Gemini configuration to `.env.example`

### Breaking Changes
- **Environment Variables**: Changed from `OPENAI_API_KEY` to `GEMINI_API_KEY`
- **Models**: Changed from GPT models to Gemini models

### Migration Checklist
- [ ] Update `.env` with `GEMINI_API_KEY`
- [ ] Remove old `OPENAI_API_KEY` from `.env`
- [ ] Test resume parsing with sample resumes
- [ ] Test candidate scoring with test data
- [ ] Monitor logs for any errors
- [ ] Verify rate limiting works correctly

---

## Additional Resources

- [Google AI Studio](https://aistudio.google.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Rate Limits and Quotas](https://ai.google.dev/pricing)
- [Supported Models](https://ai.google.dev/models)

---

## Support

For issues or questions:
1. Check logs: `docker-compose logs backend --tail 100`
2. Review this documentation
3. Check environment variables configuration
4. Test with simple examples first
