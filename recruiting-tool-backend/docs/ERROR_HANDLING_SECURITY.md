# Error Handling Security

## Overview

The application implements environment-based error handling to protect sensitive information in production while maintaining detailed debugging capabilities in development.

## Security Features

### 1. Environment-Based Error Responses

The application uses `NODE_ENV` environment variable to determine error response verbosity:

- **Development Mode** (`NODE_ENV=development`):
  - Full error messages
  - Stack traces included
  - Prisma error codes and metadata
  - Detailed debugging information

- **Production Mode** (`NODE_ENV=production`):
  - Generic error messages only
  - No stack traces
  - No Prisma metadata
  - No internal file paths or database schema details

### 2. HttpExceptionFilter

Location: `src/common/filters/http-exception.filter.ts`

**Features:**
- Catches all unhandled exceptions globally
- Logs full error details server-side (always, regardless of environment)
- Sanitizes error responses based on environment
- Includes request metadata (IP, user agent) in logs

**Production Behavior:**
- Non-HTTP exceptions: Generic message "An unexpected error occurred. Please try again later."
- No stack traces in responses
- Full errors logged server-side for debugging

**Example Response (Production):**
```json
{
  "success": false,
  "statusCode": 500,
  "message": "An unexpected error occurred. Please try again later.",
  "error": "InternalServerError",
  "timestamp": "2025-11-27T02:30:00.000Z",
  "path": "/api/some-endpoint"
}
```

**Example Response (Development):**
```json
{
  "success": false,
  "statusCode": 500,
  "message": "Cannot read property 'foo' of undefined",
  "error": "TypeError",
  "timestamp": "2025-11-27T02:30:00.000Z",
  "path": "/api/some-endpoint",
  "stack": "TypeError: Cannot read property 'foo' of undefined\n    at ..."
}
```

### 3. PrismaExceptionFilter

Location: `src/common/filters/prisma-exception.filter.ts`

**Features:**
- Catches Prisma-specific database errors
- Converts database errors to user-friendly messages
- Hides sensitive database metadata in production
- Logs full Prisma error details server-side

**Production Behavior:**
- User-friendly messages (e.g., "This record already exists")
- No Prisma error codes exposed
- No database field names or constraint details
- Full Prisma metadata logged server-side

**Example Response (Production):**
```json
{
  "success": false,
  "statusCode": 409,
  "message": "A user with this email address already exists (case-insensitive).",
  "error": "UniqueConstraintViolation",
  "timestamp": "2025-11-27T02:30:00.000Z",
  "path": "/api/users"
}
```

**Example Response (Development):**
```json
{
  "success": false,
  "statusCode": 409,
  "message": "A user with this email address already exists (case-insensitive).",
  "error": "UniqueConstraintViolation",
  "timestamp": "2025-11-27T02:30:00.000Z",
  "path": "/api/users",
  "prismaCode": "P2002",
  "prismaTarget": ["User_email_key"]
}
```

### 4. Server-Side Logging

Both filters log complete error information server-side (console.error), regardless of environment:

**Logged Information:**
- Full error message
- Stack trace (if available)
- Prisma error codes and metadata (if applicable)
- HTTP status code
- Request path
- Request method
- User agent
- Client IP address
- Timestamp

This ensures debugging capabilities in production while not exposing sensitive data to clients.

## Configuration

### Environment Variables

Add to `.env` file:

```bash
NODE_ENV=development  # or 'production'
```

**Default:** If NODE_ENV is not set, filters default to development mode behavior.

**Docker Configuration:**
The NODE_ENV variable is automatically passed from the .env file to Docker containers via env_file configuration in docker-compose.yml.

## Security Benefits

1. **Information Leakage Prevention:**
   - No internal file paths exposed
   - No database schema details revealed
   - No technology stack information leaked
   - No Prisma error codes visible to attackers

2. **Attack Surface Reduction:**
   - Prevents reconnaissance of system architecture
   - Hides database structure from potential attackers
   - Obscures implementation details

3. **Compliance:**
   - Follows OWASP security best practices
   - Reduces PCI DSS/HIPAA compliance risks
   - Professional production error handling

4. **Debugging Capability:**
   - Full error details logged server-side
   - Development mode maintains detailed debugging
   - No impact on development workflow

## Testing

### Development Mode Test

1. Set `NODE_ENV=development` in .env
2. Trigger an error (e.g., duplicate email registration)
3. Verify response includes stack trace and Prisma metadata

### Production Mode Test

1. Set `NODE_ENV=production` in .env
2. Rebuild containers: `docker-compose up -d --build`
3. Trigger the same error
4. Verify response contains generic message only
5. Check Docker logs to confirm full error is logged server-side:
   ```bash
   docker-compose logs backend | grep "error"
   ```

## Implementation Details

### Filter Registration Order

Location: `src/main.ts`

```typescript
app.useGlobalFilters(
  new PrismaExceptionFilter(),  // First: catches Prisma errors specifically
  new HttpExceptionFilter(),     // Second: catches all other errors
);
```

**Order matters:** Prisma filter must be registered first to catch database-specific errors before the generic HTTP filter.

### Error Flow

1. Exception occurs in application code
2. If it's a Prisma error → PrismaExceptionFilter catches it
3. If it's any other error → HttpExceptionFilter catches it
4. Filter determines if production or development mode
5. Full error logged to console (server-side)
6. Sanitized error response sent to client (if production)

## Monitoring Recommendations

In production, implement:

1. **Log Aggregation:** Use tools like ELK Stack, Splunk, or CloudWatch
2. **Error Tracking:** Integrate Sentry or similar for real-time error monitoring
3. **Alerting:** Set up alerts for 500 errors
4. **Metrics:** Track error rates and types

## Related Issues

- Issue #67: Remove sensitive data from error responses ✅ Completed
