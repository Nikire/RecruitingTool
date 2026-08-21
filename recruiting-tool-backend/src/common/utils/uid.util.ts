/**
 * UID format helpers.
 *
 * Every externally addressable record in this codebase is looked up by `uid`
 * (a UUID) rather than a numeric id — see CODING_STANDARDS.md. Those uids
 * arrive straight from the URL, so they are untrusted input.
 *
 * Postgres/Prisma reject a malformed UUID at the driver level with
 * "Inconsistent column data: Error creating UUID", which surfaces as a 500.
 * On a public, crawler-facing route that is doubly wrong: a typo or a stale
 * indexed link should be a 404 so Google de-indexes it, whereas a 500 tells
 * the crawler to come back and try again, and Sentry records every one of them
 * as a server fault.
 */

/** RFC 4122 UUID, any version. Deliberately permissive about version/variant. */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUid(value: unknown): value is string {
  return typeof value === 'string' && UUID_RE.test(value);
}
