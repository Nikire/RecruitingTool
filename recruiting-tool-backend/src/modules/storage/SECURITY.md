# File Upload Security Controls

This document describes the comprehensive security controls implemented for file uploads in the Recruiting Tool backend.

## Overview

The file upload system implements defense-in-depth security with multiple layers of validation to prevent malicious file uploads and security vulnerabilities.

## Security Layers

### 1. Frontend Validation (First Layer)
- **Purpose**: Quick user feedback and basic filtering
- **Implementation**: React form validation
- **Note**: Can be bypassed by direct API calls - NOT relied upon for security

### 2. Backend Validation (Primary Security Layer)
- **Purpose**: Comprehensive security enforcement
- **Implementation**: `FileValidationPipe` + `FileValidator` utility
- **Enforced on ALL file uploads**: Cannot be bypassed

## Validation Checks

### File Type Validation

The system validates file types using three independent methods:

#### 1. MIME Type Validation
- Checks the `Content-Type` header sent by the client
- Validates against allowed MIME types:
  - **Documents**: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `text/plain`
  - **Images**: `image/jpeg`, `image/png`, `image/gif`, `image/webp`

#### 2. File Extension Validation
- Extracts extension from filename
- Validates extension matches declared MIME type
- Prevents MIME type spoofing (e.g., uploading `.exe` with MIME type `application/pdf`)

#### 3. Magic Number Validation (File Signature)
- Reads the first bytes of the file (file signature/magic numbers)
- Uses `file-type` library for robust detection
- Verifies actual file content matches declared type
- **This is the most important security check** - prevents all forms of file type spoofing

**Example Magic Numbers:**
- PDF: `%PDF` (0x25504446)
- PNG: `�PNG` (0x89504E47...)
- JPEG: `ÿØÿ` (0xFFD8FF)
- DOCX: `PK` (0x504B0304) - ZIP signature + DOCX structure validation

### File Size Validation

- **Documents**: Maximum 10MB
- **Images**: Maximum 2MB
- Enforced on backend to prevent DoS attacks
- Returns clear error message if exceeded

### Filename Sanitization

The system automatically sanitizes all filenames to prevent security issues:

**Removed/Replaced:**
- Path traversal: `../` sequences
- Windows illegal characters: `<>:"|?*`
- Control characters: `\x00-\x1f`, `\x80-\x9f`
- Leading/trailing dots
- Spaces (replaced with underscores)
- Non-alphanumeric characters (except dots and dashes)
- Null bytes

**Length limiting:**
- Maximum filename length: 255 characters
- Preserves file extension

**Example:**
```
Input:  "../../malicious<script>.pdf"
Output: "maliciousscript.pdf"

Input:  "résumé with spaces.pdf"
Output: "rsum_with_spaces.pdf"
```

### Executable File Blocking

The system explicitly blocks executable file extensions:
- `.exe`, `.bat`, `.cmd`, `.com`, `.scr`
- `.vbs`, `.js`, `.jar`, `.sh`
- `.php`, `.asp`, `.aspx`, `.jsp`

Even if an attacker spoofs the MIME type and magic number, the filename check prevents upload.

### Unique S3 Key Generation

- **Format**: `{UUID}-{sanitized-filename}`
- **Purpose**:
  - Prevents file overwrites
  - Avoids filename collisions
  - Makes files unguessable
- **Example**: `550e8400-e29b-41d4-a716-446655440000-resume.pdf`

### Content-Type Validation

- S3/MinIO storage enforces the validated MIME type
- Prevents serving files with incorrect Content-Type
- Mitigates XSS and content injection attacks

## Security Logging

All security violations are logged with detailed information:

**Logged Events:**
- File type mismatches (MIME vs. actual content)
- Executable file upload attempts
- Invalid characters in filenames
- Magic number validation failures
- File size violations

**Log Format:**
```
[FilesService] File validation failed for malicious.exe: Executable files are not allowed
[FileValidationPipe] SECURITY VIOLATION: File upload blocked - malicious.pdf - Reason: File content type "application/x-msdownload" does not match declared type "application/pdf"
```

**Log Locations:**
- NestJS application logs (console)
- Can be forwarded to external monitoring systems

## HTTP Status Codes

The API returns appropriate status codes for different scenarios:

- **200 OK**: File uploaded successfully
- **400 Bad Request**: Validation failed (with detailed error message)
- **401 Unauthorized**: No authentication token
- **403 Forbidden**: User lacks required role
- **413 Payload Too Large**: File exceeds size limit (handled by Multer)
- **500 Internal Server Error**: Server-side processing error

## Error Messages

Error messages are clear and informative without exposing internal details:

**Examples:**
```json
{
  "statusCode": 400,
  "message": "File size exceeds maximum allowed size of 10MB",
  "error": "Bad Request"
}

{
  "statusCode": 400,
  "message": "File content type \"application/x-msdownload\" does not match declared type \"application/pdf\"",
  "error": "Bad Request"
}

{
  "statusCode": 400,
  "message": "Executable files are not allowed",
  "error": "Bad Request"
}
```

## Implementation Files

### Core Components

1. **`validators/file-validation.ts`**
   - `FileValidator` class - Main validation logic
   - `ALLOWED_DOCUMENT_TYPES` - Allowed document MIME types
   - `ALLOWED_IMAGE_TYPES` - Allowed image MIME types
   - `FILE_SIGNATURES` - Magic number constants
   - `MAX_FILE_SIZES` - Size limits

2. **`pipes/file-validation.pipe.ts`**
   - `FileValidationPipe` - NestJS pipe for request validation
   - Integrates with controller endpoints
   - Handles validation errors

3. **`files.service.ts`**
   - Uses `FileValidator.sanitizeFilename()`
   - Generates unique S3 keys
   - Logs upload operations

4. **`files.controller.ts`**
   - Applies `FileValidationPipe` to upload endpoints
   - `/files/upload` - Documents (10MB max)
   - `/files/upload-image` - Images (2MB max)

## Testing

### Valid Upload Test Cases

```bash
# Upload valid PDF
curl -X POST http://localhost:4000/files/upload \
  -H "Authorization: Bearer {token}" \
  -F "file=@resume.pdf"

# Upload valid image
curl -X POST http://localhost:4000/files/upload-image \
  -H "Authorization: Bearer {token}" \
  -F "file=@profile.jpg"
```

### Security Test Cases

```bash
# Test 1: Upload oversized file (should fail with 400)
curl -X POST http://localhost:4000/files/upload \
  -H "Authorization: Bearer {token}" \
  -F "file=@large-file-11mb.pdf"

# Test 2: Upload .exe file (should fail with 400)
curl -X POST http://localhost:4000/files/upload \
  -H "Authorization: Bearer {token}" \
  -F "file=@malware.exe"

# Test 3: Upload file with spoofed MIME type (should fail with 400)
# Rename .exe to .pdf and upload - magic number validation will catch it
curl -X POST http://localhost:4000/files/upload \
  -H "Authorization: Bearer {token}" \
  -F "file=@malware.pdf" # Actually an .exe file

# Test 4: Upload file with SQL injection filename (should sanitize)
curl -X POST http://localhost:4000/files/upload \
  -H "Authorization: Bearer {token}" \
  -F "file=@'; DROP TABLE users;--.pdf"
# Expected: Filename sanitized to "DROP_TABLE_users--.pdf"
```

## Dependencies

- **`file-type`** (v16.5.4): Robust MIME type detection from file content
  - Analyzes magic numbers/file signatures
  - Supports 100+ file types
  - Cannot be fooled by file extension changes

## Best Practices

1. **Never trust client-side validation** - Always validate on backend
2. **Use multiple validation methods** - MIME type + extension + magic numbers
3. **Sanitize all user input** - Including filenames
4. **Generate unique file keys** - Prevent overwrites and collisions
5. **Log security violations** - Monitor for attack attempts
6. **Limit file sizes** - Prevent DoS attacks
7. **Validate file content** - Not just metadata
8. **Use appropriate HTTP status codes** - Clear communication with clients

## Future Enhancements

Potential improvements for even stronger security:

1. **Virus scanning**: Integrate ClamAV or similar for malware detection
2. **Image content validation**: Verify images don't contain embedded code
3. **PDF structure validation**: Deep validation of PDF structure
4. **Rate limiting**: Prevent file upload flooding
5. **IP-based blocking**: Block repeat offenders
6. **Content Security Policy**: Strict CSP headers for served files
7. **Sandboxed file processing**: Process files in isolated environment

## Compliance

This implementation follows security best practices from:
- OWASP File Upload Cheat Sheet
- NIST Cybersecurity Framework
- CWE-434 (Unrestricted Upload of File with Dangerous Type)
- Defense in Depth principle

## Support

For questions or security concerns:
- Review source code in `src/modules/storage/`
- Check application logs for security violations
- Contact development team for security issues
