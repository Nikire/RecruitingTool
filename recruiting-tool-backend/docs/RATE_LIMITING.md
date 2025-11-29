# API Rate Limiting

This document describes the rate limiting implementation in the Recruiting Tool API to protect against abuse and manage API costs.

## Overview

The API implements IP-based rate limiting using `@nestjs/throttler` to prevent:
- Brute force attacks on authentication endpoints
- Spam account creation
- AI quota exhaustion
- Abuse of public endpoints

## Rate Limit Configuration

All rate limits are configured via environment variables and can be adjusted without code changes.

### Global Defaults

Applied to all endpoints unless overridden:
- **TTL**: 15 minutes (900,000ms)
- **Limit**: 100 requests per IP

```env
THROTTLE_TTL=900000
THROTTLE_LIMIT=100
```

### Endpoint-Specific Limits

#### Authentication Endpoints

**POST /auth/sign-in**
- **Limit**: 5 attempts per 15 minutes
- **Purpose**: Prevent brute force attacks
- **Response**: 429 Too Many Requests

```env
THROTTLE_AUTH_TTL=900000
THROTTLE_AUTH_LIMIT=5
```

**POST /auth/register**
- **Limit**: 3 registrations per hour
- **Purpose**: Prevent spam account creation
- **Response**: 429 Too Many Requests

```env
THROTTLE_REGISTER_TTL=3600000
THROTTLE_REGISTER_LIMIT=3
```

**GET /auth/me**
- **No rate limit**: Skipped for token verification

#### AI Endpoints

All AI endpoints share the same rate limit to control API costs:

- **POST /ai/parse-resume**
- **POST /ai/score-candidate**

**Limits**:
- **TTL**: 1 hour (3,600,000ms)
- **Limit**: 10 requests per IP

```env
THROTTLE_AI_TTL=3600000
THROTTLE_AI_LIMIT=10
```

**POST /ai/batch-score**
- **TTL**: 1 hour
- **Limit**: 5 batch jobs per IP
- **Note**: Lower limit due to higher resource usage

#### Public Application Endpoint

**POST /applications**
- **Limit**: 5 applications per hour per IP
- **Purpose**: Prevent spam submissions
- **Note**: No authentication required

```env
THROTTLE_APPLICATION_TTL=3600000
THROTTLE_APPLICATION_LIMIT=5
```

## Implementation Details

### Custom Throttler Guard

Located at `src/common/guards/throttler.guard.ts`

Features:
- **IP-based tracking**: Supports `X-Forwarded-For` header for proxy/load balancer compatibility
- **Per-endpoint tracking**: Combines IP with route path for granular control
- **User-friendly errors**: Custom error messages for better UX

### Rate Limit Headers

The API returns standard rate limit headers in responses:

```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 4
X-RateLimit-Reset: 1640000000
```

### HTTP 429 Response

When rate limit is exceeded:

```json
{
  "statusCode": 429,
  "message": "Too many requests. Please try again later.",
  "error": "Too Many Requests"
}
```

## Testing Rate Limits

### Manual Testing

Use curl to test rate limits:

```bash
# Test login rate limit (6th request should fail)
for i in {1..6}; do
  curl -X POST http://localhost:4000/auth/sign-in \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}' \
    -w "\n%{http_code}\n"
  sleep 1
done
```

### Expected Behavior

1. **Requests 1-5**: 401 Unauthorized (wrong credentials)
2. **Request 6**: 429 Too Many Requests (rate limit exceeded)

## Configuration Best Practices

### Development Environment
- Use lenient limits for easier testing
- Consider disabling for local development if needed

### Production Environment
- **Authentication**: Keep strict limits (5 per 15min)
- **AI endpoints**: Adjust based on quota and costs
- **Public endpoints**: Monitor and adjust based on abuse patterns

### Monitoring
- Track 429 responses in logs
- Monitor legitimate users hitting limits
- Adjust thresholds based on usage patterns

## Bypass Rate Limiting

### Skip Throttle Decorator

Use `@SkipThrottle()` for endpoints that should not be rate limited:

```typescript
import { SkipThrottle } from 'src/common/decorators/throttle.decorator';

@Get('health')
@SkipThrottle()
async healthCheck() {
  return { status: 'ok' };
}
```

### Custom Limits per Endpoint

Use `@Throttle()` decorator for endpoint-specific limits:

```typescript
import { Throttle } from '@nestjs/throttler';

@Post('custom-endpoint')
@Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 requests per minute
async customEndpoint() {
  // ...
}
```

## Future Enhancements

Potential improvements:
- **User-based rate limiting**: Different limits for authenticated users
- **Role-based limits**: Higher limits for premium/admin users
- **Redis storage**: Distributed rate limiting for multi-instance deployments
- **Dynamic throttling**: Adjust limits based on server load
- **Rate limit dashboard**: Monitor usage and violations

## Related Files

- `src/common/guards/throttler.guard.ts` - Custom guard implementation
- `src/common/decorators/throttle.decorator.ts` - Custom decorators
- `src/app.module.ts` - ThrottlerModule configuration
- `src/modules/shared/modules/auth/auth.controller.ts` - Auth endpoint limits
- `src/modules/ai/ai.controller.ts` - AI endpoint limits
- `src/modules/application/application.controller.ts` - Application endpoint limits

## Support

For issues or questions about rate limiting:
1. Check environment variables are set correctly
2. Verify Docker containers are using latest .env
3. Review logs for throttling errors
4. Adjust limits in .env as needed
