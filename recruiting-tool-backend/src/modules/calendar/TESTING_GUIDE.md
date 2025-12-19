# Calendar OAuth Testing Guide

This guide provides step-by-step instructions for testing the Google OAuth 2.0 implementation.

## Prerequisites

1. **Docker running** - Start Docker Desktop
2. **Backend running** - `docker-compose up -d backend`
3. **Database migrated** - Migration will auto-apply on startup
4. **Google OAuth credentials** - Configured in `.env`

## Test User Setup

You need a test user with HR, ADMIN, or SUPER_ADMIN role.

### Option 1: Use Existing Admin User

If you have the default admin user from dummy data:
- Email: `johndoe@hotmail.com` (or whatever is in your `.env` as `ADMIN_EMAIL`)
- Password: `Testing123` (or whatever is in your `.env` as `ADMIN_PASSWORD`)

### Option 2: Create Test HR User

```bash
# Login as admin first
ADMIN_TOKEN=$(curl -s -X POST http://localhost:4000/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{
    "email": "johndoe@hotmail.com",
    "password": "Testing123"
  }' | jq -r '.data.token')

# Create HR user
curl -X POST http://localhost:4000/admin/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "hr.test@example.com",
    "password": "Testing123",
    "name": "HR Test User",
    "roles": ["HR"],
    "companyId": 1
  }'
```

## Test Scenarios

### Test 1: Connection Status (Not Connected)

**Goal:** Verify that a new user has no calendar connection.

```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:4000/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{
    "email": "johndoe@hotmail.com",
    "password": "Testing123"
  }' | jq -r '.data.token')

# Check connection status
curl -X GET http://localhost:4000/calendar/connection \
  -H "Authorization: Bearer $TOKEN" \
  | jq
```

**Expected Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "connected": false
  }
}
```

### Test 2: Get Authorization URL

**Goal:** Get the Google OAuth authorization URL.

```bash
curl -X GET http://localhost:4000/calendar/auth/google \
  -H "Authorization: Bearer $TOKEN" \
  | jq
```

**Expected Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcalendar.events%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcalendar.readonly&state=1&prompt=consent&client_id=...",
    "message": "Please visit this URL to authorize Google Calendar access"
  }
}
```

### Test 3: Complete OAuth Flow

**Goal:** Connect Google Calendar and verify tokens are stored.

**Steps:**

1. **Copy the `authUrl` from Test 2**

2. **Open the URL in a browser**

3. **Sign in with your Google account** (use a test Google account)

4. **Authorize the application** - Grant access to Google Calendar

5. **You should be redirected to:**
   ```
   http://localhost:5173/settings/integrations?calendar=connected
   ```

6. **Verify connection in database:**
   ```bash
   # Connect to database
   docker exec -it recruiting-tool-db-1 psql -U postgres -d recruiting_tool_db

   # Query CalendarConnection table
   SELECT id, uid, "userId", provider, email, "tokenExpiry", "createdAt"
   FROM "CalendarConnection";
   ```

   Expected: You should see a row with your user ID and Google email.

7. **Verify via API:**
   ```bash
   curl -X GET http://localhost:4000/calendar/connection \
     -H "Authorization: Bearer $TOKEN" \
     | jq
   ```

   **Expected Response:**
   ```json
   {
     "success": true,
     "statusCode": 200,
     "data": {
       "connected": true,
       "connection": {
         "uid": "550e8400-e29b-41d4-a716-446655440000",
         "provider": "GOOGLE",
         "email": "your-google@gmail.com",
         "tokenExpiry": "2025-12-03T13:00:00Z",
         "createdAt": "2025-12-03T12:00:00Z",
         "updatedAt": "2025-12-03T12:00:00Z"
       }
     }
   }
   ```

### Test 4: Token Refresh (Automatic)

**Goal:** Verify that expired tokens are automatically refreshed.

**Note:** Access tokens expire after 1 hour. The service automatically refreshes them.

**To test manually:**

1. **Wait 1 hour after connecting** (or manually set `tokenExpiry` to a past date in database)

2. **Make any API call that uses calendar** (future implementation in #126)

3. **Check logs:**
   ```bash
   docker logs recruiting-tool-backend-1 | grep "Refreshed access token"
   ```

   Expected: Should see log entry with your user ID.

4. **Verify updated tokens in database:**
   ```sql
   SELECT "accessToken", "tokenExpiry", "updatedAt"
   FROM "CalendarConnection"
   WHERE "userId" = YOUR_USER_ID;
   ```

   Expected: `tokenExpiry` should be updated to ~1 hour in the future.

### Test 5: Disconnect Calendar

**Goal:** Remove the calendar connection.

```bash
curl -X DELETE http://localhost:4000/calendar/connection \
  -H "Authorization: Bearer $TOKEN" \
  | jq
```

**Expected Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "message": "Google Calendar disconnected successfully"
  }
}
```

**Verify disconnection:**
```bash
curl -X GET http://localhost:4000/calendar/connection \
  -H "Authorization: Bearer $TOKEN" \
  | jq
```

**Expected Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "connected": false
  }
}
```

**Verify in database:**
```sql
SELECT * FROM "CalendarConnection" WHERE "userId" = YOUR_USER_ID;
```

Expected: No rows (record deleted).

### Test 6: Reconnect After Disconnect

**Goal:** Verify user can reconnect after disconnecting.

1. **Get new authorization URL**
2. **Complete OAuth flow again**
3. **Verify new connection created**

This tests that the `upsert` logic works correctly.

## Error Scenarios

### Error 1: Unauthorized Access (No Token)

```bash
curl -X GET http://localhost:4000/calendar/auth/google
```

**Expected Response:**
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### Error 2: Wrong Role (USER role)

Create a user with only USER role and try to access calendar endpoints.

**Expected Response:**
```json
{
  "success": false,
  "statusCode": 403,
  "message": "Forbidden"
}
```

### Error 3: Invalid OAuth Callback (No Code)

```bash
curl "http://localhost:4000/calendar/auth/google/callback?state=1"
```

**Expected Response:**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Missing authorization code or state"
}
```

### Error 4: Disconnect When Not Connected

Try to disconnect when no connection exists.

**Expected Response:**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Calendar connection not found"
}
```

### Error 5: Revoked Token

If user revokes access from Google account settings, next API call should fail gracefully.

## Database Verification

### Check CalendarConnection Table Structure

```sql
\d "CalendarConnection"
```

Expected columns:
- `id` (integer, primary key)
- `uid` (uuid, unique)
- `userId` (integer, foreign key to User)
- `provider` (enum: GOOGLE, OUTLOOK)
- `accessToken` (text, nullable)
- `refreshToken` (text, not null)
- `tokenExpiry` (timestamp, nullable)
- `email` (varchar)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

### Check Indexes

```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'CalendarConnection';
```

Expected indexes:
- `CalendarConnection_pkey` (primary key on id)
- `CalendarConnection_uid_key` (unique on uid)
- `CalendarConnection_userId_provider_key` (unique on userId, provider)
- `CalendarConnection_userId_idx`
- `CalendarConnection_provider_idx`
- `CalendarConnection_uid_idx`
- `CalendarConnection_tokenExpiry_idx`

### Check Foreign Key Constraint

```sql
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'CalendarConnection';
```

Expected: Foreign key from `userId` to `User.id` with CASCADE delete.

## Swagger UI Testing

Open Swagger UI: `http://localhost:4000/api`

### Endpoints to Test:

1. **GET /calendar/auth/google** - Get authorization URL
   - Click "Try it out"
   - Add Bearer token
   - Execute
   - Copy authUrl from response

2. **GET /calendar/connection** - Check connection status
   - Click "Try it out"
   - Add Bearer token
   - Execute

3. **DELETE /calendar/connection** - Disconnect
   - Click "Try it out"
   - Add Bearer token
   - Execute

## Troubleshooting

### Issue: "No refresh token received"

**Cause:** User already authorized and Google isn't returning refresh token.

**Solution:**
1. Go to https://myaccount.google.com/permissions
2. Find "BorderLess" (or your app name)
3. Click "Remove access"
4. Try authorization again

### Issue: "Failed to authenticate with Google Calendar"

**Cause:** Refresh token expired or revoked.

**Solution:**
1. Disconnect calendar: `DELETE /calendar/connection`
2. Reconnect: Complete OAuth flow again

### Issue: Redirect URI mismatch

**Cause:** `GOOGLE_REDIRECT_URI` in `.env` doesn't match Google Console configuration.

**Solution:**
1. Check `.env`: `GOOGLE_REDIRECT_URI=http://localhost:4000/calendar/auth/google/callback`
2. Check Google Console > Credentials > Your OAuth Client > Authorized redirect URIs
3. Ensure they match exactly

### Issue: Calendar API not enabled

**Error:** "Calendar API has not been used in project..."

**Solution:**
1. Go to Google Cloud Console
2. Navigate to "APIs & Services" > "Library"
3. Search for "Google Calendar API"
4. Click "Enable"

## Success Criteria

- ✅ User can get authorization URL
- ✅ OAuth flow completes successfully
- ✅ Tokens are stored in database
- ✅ Connection status shows connected
- ✅ User can disconnect calendar
- ✅ Connection record is deleted on disconnect
- ✅ Tokens are automatically refreshed when expired
- ✅ Only HR/ADMIN/SUPER_ADMIN can access endpoints
- ✅ Proper error handling for all edge cases

## Next Steps (Issue #126)

Once OAuth is confirmed working:
1. Implement calendar event creation
2. Add Google Meet link generation
3. Integrate with interview scheduling
4. Add event update/cancel functionality
