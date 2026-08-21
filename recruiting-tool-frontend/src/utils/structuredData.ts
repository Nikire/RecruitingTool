/**
 * schema.org JSON-LD builders.
 *
 * Every builder returns a plain, serialisable object that is valid schema.org.
 * The single rule they all follow: **optional properties that have no value are
 * omitted entirely**, never emitted as `null`, `undefined` or `""`. Google
 * treats a JSON-LD block containing null-valued required-ish properties as
 * broken markup, which is strictly worse than shipping no markup at all.
 *
 * Serialisation must go through {@link serializeJsonLd}, which neutralises
 * `</script>` sequences. Job descriptions are user-authored content rendered on
 * a public page, so an unescaped `<` inside a description is a script-tag
 * breakout (XSS), not a cosmetic bug.
 *
 * Identifiers are always the public `uid` string. Numeric database ids must
 * never reach this module.
 */

/** Canonical origin of the marketing / careers site. */
export const SITE_URL = "https://borderlessats.com";

/** Brand name used for `og:site_name` and as the default publisher/provider. */
export const SITE_NAME = "Borderless ATS";

const SCHEMA_CONTEXT = "https://schema.org" as const;

/* ------------------------------------------------------------------------- */
/* Shared types                                                              */
/* ------------------------------------------------------------------------- */

/** A serialisable JSON-LD node. */
export interface JsonLdObject {
  "@context"?: typeof SCHEMA_CONTEXT;
  "@type": string;
  [key: string]: unknown;
}

export interface JobPostingLd extends JsonLdObject {
  "@type": "JobPosting";
}

export interface SoftwareApplicationLd extends JsonLdObject {
  "@type": "SoftwareApplication";
}

export interface OrganizationLd extends JsonLdObject {
  "@type": "Organization";
}

export interface FaqPageLd extends JsonLdObject {
  "@type": "FAQPage";
}

/* ------------------------------------------------------------------------- */
/* URL helpers                                                               */
/* ------------------------------------------------------------------------- */

/**
 * Turns an app path or an already-absolute URL into the absolute, canonical
 * form used for `<link rel="canonical">`, `og:url` and JSON-LD `url` fields.
 *
 * Query strings and hashes are always stripped: `/careers` accepts eight filter
 * params, and every combination would otherwise be indexed as a duplicate page.
 * A trailing slash is removed from everything except the root.
 */
export function toAbsoluteUrl(pathOrUrl: string): string {
  const raw = (pathOrUrl || "/").trim();

  let origin = SITE_URL;
  let pathname: string;

  if (/^https?:\/\//i.test(raw)) {
    const schemeEnd = raw.indexOf("://") + 3;
    const pathStart = raw.indexOf("/", schemeEnd);
    origin = pathStart === -1 ? raw : raw.slice(0, pathStart);
    pathname = pathStart === -1 ? "/" : raw.slice(pathStart);
  } else {
    pathname = raw.startsWith("/") ? raw : `/${raw}`;
  }

  // Drop search params and hash fragments.
  pathname = pathname.split("?")[0].split("#")[0];

  // Collapse a trailing slash (but keep the root "/").
  if (pathname.length > 1 && pathname.endsWith("/")) {
    pathname = pathname.replace(/\/+$/, "");
  }
  if (pathname === "") pathname = "/";

  return `${origin.replace(/\/+$/, "")}${pathname === "/" ? "/" : pathname}`;
}

/* ------------------------------------------------------------------------- */
/* Serialisation                                                             */
/* ------------------------------------------------------------------------- */

/**
 * Serialises a JSON-LD node for injection into `<script type="application/ld+json">`.
 *
 * `<`, `>` and `&` are escaped to their \uXXXX forms, which stay
 * valid JSON (a parser turns them back into the original characters) while
 * making it impossible for a user-authored job description containing
 * `</script>` to close the tag and execute arbitrary markup. U+2028/U+2029 are
 * escaped too — they are legal in JSON but illegal raw in a JavaScript context.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

/* ------------------------------------------------------------------------- */
/* Internal helpers                                                          */
/* ------------------------------------------------------------------------- */

type Draft = Record<string, unknown>;

/** Drops `undefined`, `null`, blank strings, empty arrays and empty objects. */
function compact<T extends Draft>(draft: T): T {
  const out: Draft = {};

  for (const [key, value] of Object.entries(draft)) {
    if (value === undefined || value === null) continue;
    if (typeof value === "string" && value.trim() === "") continue;
    if (Array.isArray(value)) {
      if (value.length === 0) continue;
    } else if (typeof value === "object") {
      if (Object.keys(value as Draft).length === 0) continue;
    }
    out[key] = value;
  }

  return out as T;
}

/** Returns a trimmed string, or `undefined` when there is nothing to emit. */
function text(value?: string | null): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

/** Joins a string list into schema.org's comma-separated Text form. */
function joinList(values?: Array<string | null> | null): string | undefined {
  if (!Array.isArray(values)) return undefined;
  const cleaned = values
    .map((value) => text(value))
    .filter((value): value is string => Boolean(value));
  return cleaned.length > 0 ? cleaned.join(", ") : undefined;
}

/** Normalises a date to a full ISO-8601 string; invalid dates are dropped. */
function toIsoDate(value?: Date | string | null): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

function withContext<T extends JsonLdObject>(node: T): T {
  return { "@context": SCHEMA_CONTEXT, ...node };
}

/* ------------------------------------------------------------------------- */
/* JobPosting                                                                */
/* ------------------------------------------------------------------------- */

/** Employment types as they exist on the job position model. */
export type JobPostingLdJobType =
  | "FULL_TIME"
  | "PART_TIME"
  | "CONTRACT"
  | "FREELANCE"
  | "INTERNSHIP"
  | "TEMPORARY";

export type JobPostingLdWorkLocation = "REMOTE" | "HYBRID" | "ON_SITE";

export type JobPostingLdSalaryPeriod = "HOURLY" | "MONTHLY" | "YEARLY";

/**
 * Maps our `jobType` enum onto the values Google accepts for
 * `JobPosting.employmentType`. Unknown values are dropped rather than guessed.
 */
const EMPLOYMENT_TYPE_MAP: Record<JobPostingLdJobType, string> = {
  FULL_TIME: "FULL_TIME",
  PART_TIME: "PART_TIME",
  CONTRACT: "CONTRACTOR",
  FREELANCE: "CONTRACTOR",
  INTERNSHIP: "INTERN",
  TEMPORARY: "TEMPORARY",
};

/** `QuantitativeValue.unitText` values accepted for salary periods. */
const SALARY_UNIT_MAP: Record<JobPostingLdSalaryPeriod, string> = {
  HOURLY: "HOUR",
  MONTHLY: "MONTH",
  YEARLY: "YEAR",
};

/**
 * Structural subset of a job position needed to build a JobPosting node.
 *
 * Deliberately declared with `| null` on every optional field so that both the
 * frontend `PublicJobPosition` type and the backend response DTO satisfy it
 * without casting.
 */
export interface JobPostingLdInput {
  uid: string;
  title: string;
  description?: string | null;
  createdAt?: Date | string | null;
  applicationDeadline?: Date | string | null;
  jobType?: JobPostingLdJobType | null;
  workLocation?: JobPostingLdWorkLocation | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  salaryPeriod?: JobPostingLdSalaryPeriod | null;
  showSalary?: boolean | null;
  skills?: string[] | null;
  requirements?: string[] | null;
  responsibilities?: string[] | null;
  benefits?: string[] | null;
  educationLevel?: string | null;
  companyName?: string | null;
  companyWebsite?: string | null;
  companyLogoUrl?: string | null;
}

export interface BuildJobPostingLdOptions {
  /**
   * Canonical URL of the job detail page. Accepts a path (`/careers/<uid>`) or
   * an absolute URL; defaults to `${SITE_URL}/careers/${uid}`.
   */
  url?: string;
  /** Whether the job can be applied to directly on this page. */
  directApply?: boolean;
}

/**
 * Builds a schema.org `JobPosting` node for a public job detail page.
 *
 * `baseSalary` is emitted **only** when the posting's `showSalary` flag is true
 * and at least one salary bound exists — the flag is the recruiter's explicit
 * consent to publish compensation, and structured data is as public as the page.
 */
export function buildJobPostingLd(
  job: JobPostingLdInput,
  options: BuildJobPostingLdOptions = {},
): JobPostingLd {
  const companyName = text(job.companyName);

  const address = compact({
    "@type": "PostalAddress",
    addressLocality: text(job.city),
    addressRegion: text(job.state),
    addressCountry: text(job.country),
  });
  // `@type` alone means every real address field was blank.
  const hasAddress = Object.keys(address).length > 1;

  const hiringOrganization = compact({
    "@type": "Organization",
    name: companyName,
    sameAs: text(job.companyWebsite),
    logo: text(job.companyLogoUrl),
  });

  const node: JobPostingLd = {
    "@type": "JobPosting",
    ...compact({
      title: text(job.title),
      description: text(job.description),
      identifier: compact({
        "@type": "PropertyValue",
        name: companyName ?? SITE_NAME,
        value: text(job.uid),
      }),
      url: toAbsoluteUrl(options.url ?? `/careers/${job.uid}`),
      datePosted: toIsoDate(job.createdAt),
      validThrough: toIsoDate(job.applicationDeadline),
      employmentType: job.jobType
        ? EMPLOYMENT_TYPE_MAP[job.jobType]
        : undefined,
      hiringOrganization:
        Object.keys(hiringOrganization).length > 1
          ? hiringOrganization
          : undefined,
      jobLocation: hasAddress ? { "@type": "Place", address } : undefined,
      jobLocationType:
        job.workLocation === "REMOTE" ? "TELECOMMUTE" : undefined,
      applicantLocationRequirements:
        job.workLocation === "REMOTE" && text(job.country)
          ? { "@type": "Country", name: text(job.country) }
          : undefined,
      baseSalary: buildBaseSalary(job),
      skills: joinList(job.skills),
      qualifications: joinList(job.requirements),
      responsibilities: joinList(job.responsibilities),
      jobBenefits: joinList(job.benefits),
      educationRequirements: text(job.educationLevel),
      directApply: options.directApply,
    }),
  };

  return withContext(node);
}

function buildBaseSalary(job: JobPostingLdInput): JsonLdObject | undefined {
  if (job.showSalary !== true) return undefined;

  const minValue =
    typeof job.salaryMin === "number" ? job.salaryMin : undefined;
  const maxValue =
    typeof job.salaryMax === "number" ? job.salaryMax : undefined;
  if (minValue === undefined && maxValue === undefined) return undefined;

  const value = compact({
    "@type": "QuantitativeValue",
    minValue,
    maxValue,
    unitText: job.salaryPeriod
      ? SALARY_UNIT_MAP[job.salaryPeriod]
      : SALARY_UNIT_MAP.YEARLY,
  });

  return compact({
    "@type": "MonetaryAmount",
    currency: text(job.salaryCurrency) ?? "USD",
    value,
  }) as JsonLdObject;
}

/* ------------------------------------------------------------------------- */
/* SoftwareApplication                                                       */
/* ------------------------------------------------------------------------- */

export interface SoftwareApplicationOffer {
  /** Numeric price, or `"0"` for a free tier. */
  price: number | string;
  priceCurrency: string;
  /** e.g. `"https://schema.org/InStock"`. */
  availability?: string;
  url?: string;
}

export interface SoftwareApplicationLdInput {
  name: string;
  description?: string;
  /** Path or absolute URL of the product page. Defaults to the site root. */
  url?: string;
  /** Defaults to `"BusinessApplication"`. */
  applicationCategory?: string;
  /** Defaults to `"Web"`. */
  operatingSystem?: string;
  softwareVersion?: string;
  featureList?: string[];
  /** Absolute URL of a product screenshot. */
  screenshot?: string;
  offers?: SoftwareApplicationOffer | SoftwareApplicationOffer[];
  /**
   * Only pass real, verifiable ratings that are also visible on the page.
   * Fabricated aggregate ratings are a manual-action risk.
   */
  aggregateRating?: { ratingValue: number | string; ratingCount: number };
  /** Publisher of the product. Defaults to a bare `{ name: SITE_NAME }`. */
  provider?: OrganizationLd;
}

/** Builds a schema.org `SoftwareApplication` node for the marketing site. */
export function buildSoftwareApplicationLd(
  input: SoftwareApplicationLdInput,
): SoftwareApplicationLd {
  const offersInput = input.offers
    ? Array.isArray(input.offers)
      ? input.offers
      : [input.offers]
    : [];

  const offers = offersInput.map((offer) =>
    compact({
      "@type": "Offer",
      price:
        typeof offer.price === "number" ? String(offer.price) : offer.price,
      priceCurrency: text(offer.priceCurrency),
      availability: text(offer.availability),
      url: offer.url ? toAbsoluteUrl(offer.url) : undefined,
    }),
  );

  const node: SoftwareApplicationLd = {
    "@type": "SoftwareApplication",
    ...compact({
      name: text(input.name),
      description: text(input.description),
      url: toAbsoluteUrl(input.url ?? "/"),
      applicationCategory:
        text(input.applicationCategory) ?? "BusinessApplication",
      operatingSystem: text(input.operatingSystem) ?? "Web",
      softwareVersion: text(input.softwareVersion),
      featureList: input.featureList
        ?.map((feature) => text(feature))
        .filter((feature): feature is string => Boolean(feature)),
      screenshot: text(input.screenshot),
      offers:
        offers.length === 0
          ? undefined
          : offers.length === 1
            ? offers[0]
            : offers,
      aggregateRating: input.aggregateRating
        ? compact({
            "@type": "AggregateRating",
            ratingValue: String(input.aggregateRating.ratingValue),
            ratingCount: input.aggregateRating.ratingCount,
          })
        : undefined,
      provider: input.provider ?? { "@type": "Organization", name: SITE_NAME },
    }),
  };

  return withContext(node);
}

/* ------------------------------------------------------------------------- */
/* Organization                                                              */
/* ------------------------------------------------------------------------- */

export interface OrganizationLdInput {
  /** Defaults to {@link SITE_NAME}. */
  name?: string;
  /** Path or absolute URL. Defaults to the site root. */
  url?: string;
  /** Absolute URL of the logo image. */
  logo?: string;
  description?: string;
  /** Profile URLs on other platforms (LinkedIn, X, GitHub…). */
  sameAs?: string[];
  email?: string;
  telephone?: string;
  /** e.g. `"customer support"`. */
  contactType?: string;
  /** BCP-47 tags the contact point speaks, e.g. `["en", "es"]`. */
  availableLanguage?: string[];
  foundingDate?: string;
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
}

/** Builds a schema.org `Organization` node describing Borderless itself. */
export function buildOrganizationLd(
  input: OrganizationLdInput = {},
): OrganizationLd {
  const contactPoint = compact({
    "@type": "ContactPoint",
    contactType: text(input.contactType),
    email: text(input.email),
    telephone: text(input.telephone),
    availableLanguage: input.availableLanguage
      ?.map((lang) => text(lang))
      .filter((lang): lang is string => Boolean(lang)),
  });

  const address = input.address
    ? compact({
        "@type": "PostalAddress",
        streetAddress: text(input.address.streetAddress),
        addressLocality: text(input.address.addressLocality),
        addressRegion: text(input.address.addressRegion),
        postalCode: text(input.address.postalCode),
        addressCountry: text(input.address.addressCountry),
      })
    : undefined;

  const node: OrganizationLd = {
    "@type": "Organization",
    ...compact({
      name: text(input.name) ?? SITE_NAME,
      url: toAbsoluteUrl(input.url ?? "/"),
      logo: text(input.logo),
      description: text(input.description),
      sameAs: input.sameAs
        ?.map((link) => text(link))
        .filter((link): link is string => Boolean(link)),
      // `@type` alone means no real contact details were supplied.
      contactPoint:
        Object.keys(contactPoint).length > 1 ? contactPoint : undefined,
      address: address && Object.keys(address).length > 1 ? address : undefined,
      foundingDate: text(input.foundingDate),
    }),
  };

  return withContext(node);
}

/* ------------------------------------------------------------------------- */
/* FAQPage                                                                   */
/* ------------------------------------------------------------------------- */

export interface FaqItem {
  question: string;
  /** Plain text or a simple HTML string. */
  answer: string;
}

/**
 * Builds a schema.org `FAQPage` node.
 *
 * Returns `undefined` when no complete question/answer pair survives filtering —
 * an `FAQPage` with an empty `mainEntity` is invalid, and `<Seo>` silently drops
 * `undefined` entries, so callers can pass the result straight through.
 *
 * Only emit this on pages where the same Q&A text is visible to users.
 */
export function buildFaqPageLd(items: FaqItem[]): FaqPageLd | undefined {
  const mainEntity: JsonLdObject[] = [];

  for (const item of items) {
    const question = text(item.question);
    const answer = text(item.answer);
    // A half-filled pair is invalid markup, so skip it rather than emit nulls.
    if (!question || !answer) continue;
    mainEntity.push({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    });
  }

  if (mainEntity.length === 0) return undefined;

  return withContext<FaqPageLd>({ "@type": "FAQPage", mainEntity });
}
