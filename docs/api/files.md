# Files API

The Files API handles every upload and download in Borderless: candidate resumes submitted from the careers page, documents attached inside the HR app, profile and company images, and the signed URLs that let a browser view a private document. It is backed by S3-compatible object storage (MinIO in the default stack). Thirteen routes live under `/api/files`; two of them are deliberately unauthenticated.

## Base URL

```
http://localhost:4000/api/files
```

## Endpoint summary

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/upload-resume-public` | **None** | Resume upload from the public careers page |
| `POST` | `/upload` | `USER`+ | Upload a document, optionally linked to a candidate |
| `POST` | `/upload-image` | `USER`+ | Upload an image |
| `POST` | `/download-zip` | `USER`+ | Stream several files as one ZIP |
| `GET` | `/company` | `USER`+ | Every file belonging to the caller's company |
| `GET` | `/company/storage` | `USER`+ | Storage usage against the plan limit |
| `GET` | `/` | `USER`+ | Visible files, optionally filtered by candidate |
| `GET` | `/:uid` | `USER`+ | File metadata |
| `GET` | `/:uid/view` | **None** | Serve a *public asset* inline |
| `GET` | `/:uid/view-url` | `USER`+ | Short-lived presigned URL for a private file |
| `GET` | `/:uid/download` | `USER`+ | Stream a file as an attachment |
| `DELETE` | `/bulk` | `USER`+ | Delete several files |
| `DELETE` | `/:uid` | `ADMIN`+ | Delete one file |

"`USER`+" means `@Auth([RolesType.USER])`, which under the role ladder admits every authenticated role. Static paths (`/company`, `/company/storage`, `/bulk`) are declared before the `:uid` routes so they are not swallowed by the parameter match.

## Upload validation

`FileValidationPipe` runs before the service sees the file. It checks the declared MIME type, the filename extension **and** the file's magic number, rejects executables, sanitises the filename, and enforces a size cap.

| Upload type | Allowed MIME types | Extensions | Max size |
|-------------|--------------------|-----------|----------|
| `document` | `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `text/plain` | `.pdf`, `.doc`, `.docx`, `.txt` | 10 MB |
| `image` | `image/jpeg`, `image/png`, `image/gif`, `image/webp` | `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp` | 2 MB |

A mismatch between the declared type and the detected magic number is logged as a security violation and returns `400`.

## Public resume upload

```http
POST /api/files/upload-resume-public
Content-Type: multipart/form-data
```

| Form field | Type | Required |
|------------|------|----------|
| `file` | Resume file (PDF, DOC, DOCX, TXT) | Yes |

This route carries **no `@Auth()` decorator and no `@Throttle()` override**, so it is reachable with no credentials and falls back to the global IP limiter — `THROTTLE_LIMIT` requests (default 100) per `THROTTLE_TTL` milliseconds (default 60000). The 10 MB document cap and full magic-number validation still apply. Uploads are attributed to the sentinel uploader `public-applicant` rather than to a user.

The careers page calls this first, then passes the returned `uid` as `resumeFileUid` on `POST /api/applications`.

## Authenticated uploads

```http
POST /api/files/upload?candidateUid=<uid>
Authorization: Bearer <access token>
Content-Type: multipart/form-data
```

`candidateUid` is an optional query parameter that links the upload to a candidate record.

```http
POST /api/files/upload-image
Authorization: Bearer <access token>
Content-Type: multipart/form-data
```

Both return a file object:

```json
{
  "uid": "f1e2d3c4-...",
  "filename": "1739472000000-resume.pdf",
  "originalName": "resume.pdf",
  "mimetype": "application/pdf",
  "size": 184320,
  "s3Key": "documents/1739472000000-resume.pdf",
  "hash": "9f86d081884c7d659a2feaa0c55ad015...",
  "uploadedByPublic": false,
  "uploadedByUid": "u1...",
  "uploadedByName": "Jane Recruiter",
  "candidateUid": "c1...",
  "candidateName": "John Doe",
  "createdAt": "2026-02-14T10:00:00.000Z",
  "updatedAt": "2026-02-14T10:00:00.000Z"
}
```

`hash` is a SHA-256 digest used for tenant-scoped deduplication. Quota is checked before any bytes are written to storage.

## Listing and metadata

```http
GET /api/files                       # optionally ?candidateUid=<uid>
GET /api/files/company
GET /api/files/:uid
```

All three are company-scoped: a UID belonging to another company returns `404`, not `403`.

```http
GET /api/files/company/storage
```

**Response (200):**
```json
{ "usedMB": 412.7, "limitMB": 2048, "percentage": 20.1 }
```

The limit comes from the company's subscription plan — see [Subscription and Limits](../user-guide/subscription-and-limits.md).

## Viewing and downloading

There are three ways to get bytes back, and the difference between them matters for privacy.

### `GET /:uid/view` — public assets only

Unauthenticated, because an avatar rendered with a bare `<img src>` cannot send an `Authorization` header. `FilesService.getPublicViewableFile()` serves **only** images that have no candidate, application or submission link. Every private document returns `404` here. Responses are sent with `Cache-Control: public, max-age=31536000, immutable`, which is safe precisely because the route can never serve a private file.

### `GET /:uid/view-url` — signed URL for private files

```http
GET /api/files/{uid}/view-url
Authorization: Bearer <access token>
```

**Response (200):**
```json
{
  "uid": "f1e2d3c4-...",
  "url": "http://localhost:9000/recruiting-tool-files/documents/...?X-Amz-Signature=...",
  "expiresIn": 300,
  "originalName": "resume.pdf",
  "mimetype": "application/pdf"
}
```

`expiresIn` is `VIEW_URL_TTL_SECONDS`, a constant of **300 seconds (5 minutes)** in `files.service.ts`. The URL is presigned for `inline` display and is served directly by object storage, bypassing the backend. The response itself is sent with `Cache-Control: private, no-store`.

### `GET /:uid/download` — streamed attachment

Streams through the backend with `Content-Disposition: attachment`, `Cache-Control: private, no-store` and `Pragma: no-cache`, so no shared proxy retains candidate personal data.

### `POST /download-zip`

```http
POST /api/files/download-zip
Authorization: Bearer <access token>
Content-Type: application/json

{ "uids": ["f1e2d3c4-...", "a9b8c7d6-..."] }
```

Streams a ZIP archive of the named files, restricted to the caller's company. Returns `200`.

## Deleting

```http
DELETE /api/files/bulk
Content-Type: application/json

{ "uids": ["f1e2d3c4-...", "a9b8c7d6-..."] }
```

Returns `{ "deleted": 2 }`. Requires `USER`+ and is company-scoped.

```http
DELETE /api/files/{uid}
```

Requires `ADMIN`+. Returns `{ "message": "File deleted successfully" }`. Platform admins may delete a file in any company; company-level callers are restricted to their own.

## Storage endpoints: internal vs public

`StorageService` always speaks the S3 protocol through the AWS SDK, whether the target is MinIO or AWS S3. Two endpoint variables exist because the backend and the browser reach the object store by different addresses.

| Variable | Default | Used for |
|----------|---------|----------|
| `S3_ENDPOINT` | `http://minio:9000` | The address the backend container uses for uploads, downloads and presigning |
| `S3_PUBLIC_ENDPOINT` | `http://localhost:9000` | The host written into public and signed URLs handed to the browser |
| `S3_BUCKET_NAME` | `recruiting-tool-files` | Bucket name |
| `S3_REGION` | `us-east-1` | Region |
| `S3_FORCE_PATH_STYLE` | `false` | Must be `true` for MinIO |

After presigning against `S3_ENDPOINT`, the service rewrites the host to `S3_PUBLIC_ENDPOINT` so the URL is reachable from the browser. In production, where the MinIO port is not exposed to the internet, set `S3_PUBLIC_ENDPOINT` to whatever public address your reverse proxy maps onto the object store.

The `logos/` and `videos/` prefixes are given a public-read bucket policy at startup, so company logos load without a presigned URL.

## Related

- [Public Endpoints](./public-endpoints.md) — the two unauthenticated file routes in context
- [Job Positions API](./job-positions.md) — the careers-page flow that uses the public resume upload
- [File Manager](../user-guide/file-manager.md) — the UI over these endpoints
- [Configuration](../getting-started/configuration.md) — the full `S3_*` variable table
