/**
 * Canonical public URL shapes for the careers surface.
 *
 * Every public job used to live at `/careers/<uuid>` — a URL with zero keywords
 * in it, which is worth nothing in search and reads as spam when a recruiter
 * pastes it into an email. The canonical shape is now:
 *
 *     /jobs/{company-slug}/{job-title-slug}-{uid}
 *
 * ## The slug is decoration. The UID is the key.
 *
 * `{company-slug}` and `{job-title-slug}` are never read back, never validated
 * and never used to look anything up — a visitor can rewrite them to anything
 * and still land on the same posting, exactly like a Medium or Lever URL. The
 * only load-bearing part of the path is the trailing UID, which is extracted by
 * {@link extractJobUid} and fed to the existing public-by-UID endpoint. This
 * keeps the project's UID-only external API policy intact: no numeric id is
 * exposed, and nothing is resolved from a human-authored string.
 *
 * ## Why the full UID and not a short prefix
 *
 * `JobPosition.uid` is a PostgreSQL `uuid` column. Prefix matching it would
 * need a raw `uid::text LIKE $1` query plus an ambiguity guard, because an
 * 8-character prefix of a v4 UUID is not unique by construction — two postings
 * colliding would make one of them permanently unreachable. Trading eight
 * visible characters for a class of dead job links is a bad deal, and the
 * keywords sit in front of the UID where both Google and a human read them
 * first.
 */

/** Matches a canonical v4-shaped UUID anywhere in a string. */
const UUID_PATTERN =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

/** Matches a UUID pinned to the END of a string (the canonical job slug tail). */
const TRAILING_UUID_PATTERN = new RegExp(`(${UUID_PATTERN.source})$`, "i");

/** Longest slug segment we emit. Long enough for any real job title. */
const MAX_SLUG_LENGTH = 70;

/**
 * Turns arbitrary human text into a URL-safe, accent-free, lowercase slug.
 *
 * Accents are decomposed rather than dropped so "Diseñador Gráfico" becomes
 * `disenador-grafico` and not `dise-ador-gr-fico`. Latin American job titles and
 * company names are full of them, so this is the common case, not the edge one.
 */
export function slugify(value: string | undefined | null): string {
  if (!value) return "";

  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/g, "");
}

/** The minimum a job needs for a canonical URL to be buildable. */
export interface JobUrlParts {
  uid: string;
  title?: string | null;
  companyName?: string | null;
}

/** Fallbacks so a posting with an empty title still gets a well-formed path. */
const COMPANY_SLUG_FALLBACK = "company";
const JOB_SLUG_FALLBACK = "job";

/**
 * Builds the canonical path for a public job posting.
 *
 * @example
 * buildJobPath({ uid: "3f8c…0011", title: "Senior React Engineer", companyName: "Acme Corp" })
 * // "/jobs/acme-corp/senior-react-engineer-3f8c…0011"
 */
export function buildJobPath(job: JobUrlParts): string {
  const companySlug = slugify(job.companyName) || COMPANY_SLUG_FALLBACK;
  const titleSlug = slugify(job.title) || JOB_SLUG_FALLBACK;
  return `/jobs/${companySlug}/${titleSlug}-${job.uid}`;
}

/**
 * Pulls the posting UID out of a canonical job slug.
 *
 * Returns `null` when the segment carries no UUID — which is precisely how the
 * `/jobs/:a/:b` router tells a job detail URL apart from a two-dimension facet
 * URL such as `/jobs/engineering/colombia`.
 */
export function extractJobUid(slug: string | undefined): string | null {
  if (!slug) return null;
  const match = TRAILING_UUID_PATTERN.exec(slug);
  return match ? match[1].toLowerCase() : null;
}

/* -------------------------------------------------------------------------- */
/* Per-company careers pages                                                  */
/* -------------------------------------------------------------------------- */

/** The subset of a public company this module needs. */
export interface CompanyUrlParts {
  uid: string;
  name: string;
}

/**
 * Builds the branded careers-page path for one company.
 *
 * The slug here is the company name only — this is the URL a customer puts on
 * their own website and in their email signature, so a UUID in it would defeat
 * the point. Resolution therefore does go through the slug (see
 * {@link resolveCompanyBySlug}), but only against the list of companies the
 * public API already returns; nothing is queried by the raw string.
 */
export function buildCompanyCareersPath(company: CompanyUrlParts): string {
  const slug = slugify(company.name);
  return `/careers/company/${slug || company.uid}`;
}

/** Absolute form of {@link buildCompanyCareersPath}, for copy-to-clipboard UI. */
export function buildCompanyCareersUrl(
  company: CompanyUrlParts,
  origin = "https://borderlessats.com",
): string {
  return `${origin.replace(/\/+$/, "")}${buildCompanyCareersPath(company)}`;
}

/**
 * Resolves a `/careers/company/:companySlug` segment to one company.
 *
 * Accepted, in priority order:
 *  1. a bare UID (or any slug ending in one) — always exact, never ambiguous;
 *  2. an exact name-slug match;
 *  3. a name-slug match ignoring a numeric disambiguation suffix.
 *
 * Two companies sharing a name slug is possible, so the UID form above stays
 * available as the unambiguous escape hatch and {@link buildCompanyCareersPath}
 * falls back to it when a name slugifies to nothing.
 */
export function resolveCompanyBySlug<T extends CompanyUrlParts>(
  companies: T[],
  companySlug: string | undefined,
): T | null {
  if (!companySlug || companies.length === 0) return null;

  const uid = UUID_PATTERN.exec(companySlug)?.[0]?.toLowerCase();
  if (uid) {
    return companies.find((c) => c.uid.toLowerCase() === uid) ?? null;
  }

  const wanted = companySlug.toLowerCase();
  return companies.find((c) => slugify(c.name) === wanted) ?? null;
}
