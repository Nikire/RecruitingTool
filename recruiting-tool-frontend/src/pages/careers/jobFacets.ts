/**
 * The indexable facet URL space for the public job board.
 *
 * ## Why this is a hand-written registry and not derived from the data
 *
 * The public API filters on eight dimensions. Letting every value of every
 * dimension become a URL — and then every combination of them — produces an
 * unbounded set of near-empty pages that Google reads as doorway spam. Sites
 * lose rankings to this far more often than they gain any.
 *
 * So the indexable space is closed by construction:
 *
 *  - **one segment**  `/jobs/{facet}` — any facet in {@link JOB_FACETS} (21)
 *  - **two segments** `/jobs/{role-facet}/{country-facet}` — a role-ish facet
 *    (category, work location or job type) crossed with a country (13 x 8)
 *
 * Anything outside that registry renders a not-found state, and any facet page
 * that resolves to zero live postings emits `noindex` — thin pages never enter
 * the index, and they leave it again automatically when a role is filled.
 *
 * The two-segment order is fixed (role first, country second) so
 * `/jobs/engineering/colombia` and `/jobs/colombia/engineering` cannot both
 * exist as duplicates of each other.
 */

/** Which public API filter a facet drives. */
export type FacetDimension =
  | "category"
  | "country"
  | "workLocation"
  | "jobType";

export interface JobFacet {
  /** URL segment. Unique across ALL dimensions — this is the registry key. */
  slug: string;
  dimension: FacetDimension;
  /** Value handed to the public API for this dimension. */
  value: string;
  /** i18n key for the human label used in headings, titles and breadcrumbs. */
  labelKey: string;
}

/**
 * Work-location facets. `ON_SITE` is the Prisma enum value; `onsite` is the
 * URL segment, because nobody types the underscore.
 */
export const WORK_LOCATION_FACETS: JobFacet[] = [
  {
    slug: "remote",
    dimension: "workLocation",
    value: "REMOTE",
    labelKey: "careersFacets.remote",
  },
  {
    slug: "hybrid",
    dimension: "workLocation",
    value: "HYBRID",
    labelKey: "careersFacets.hybrid",
  },
  {
    slug: "onsite",
    dimension: "workLocation",
    value: "ON_SITE",
    labelKey: "careersFacets.onsite",
  },
];

/**
 * Category facets. The values mirror the exact strings `FilterSidebar` sends,
 * so a facet page and the equivalent sidebar selection return the same rows.
 */
export const CATEGORY_FACETS: JobFacet[] = [
  {
    slug: "engineering",
    dimension: "category",
    value: "Engineering",
    labelKey: "careersFacets.engineering",
  },
  {
    slug: "design",
    dimension: "category",
    value: "Design",
    labelKey: "careersFacets.design",
  },
  {
    slug: "marketing",
    dimension: "category",
    value: "Marketing",
    labelKey: "careersFacets.marketing",
  },
  {
    slug: "sales",
    dimension: "category",
    value: "Sales",
    labelKey: "careersFacets.sales",
  },
  {
    slug: "product",
    dimension: "category",
    value: "Product",
    labelKey: "careersFacets.product",
  },
];

export const JOB_TYPE_FACETS: JobFacet[] = [
  {
    slug: "full-time",
    dimension: "jobType",
    value: "FULL_TIME",
    labelKey: "careersFacets.full_time",
  },
  {
    slug: "part-time",
    dimension: "jobType",
    value: "PART_TIME",
    labelKey: "careersFacets.part_time",
  },
  {
    slug: "contract",
    dimension: "jobType",
    value: "CONTRACT",
    labelKey: "careersFacets.contract",
  },
  {
    slug: "internship",
    dimension: "jobType",
    value: "INTERNSHIP",
    labelKey: "careersFacets.internship",
  },
  {
    slug: "temporary",
    dimension: "jobType",
    value: "TEMPORARY",
    labelKey: "careersFacets.temporary",
  },
];

/**
 * Country facets, biased to the nearshore corridor Borderless actually sells
 * into.
 *
 * KNOWN LIMITATION: `JobPosition.country` is free text and the public API
 * matches it with a case-insensitive `contains`, which in PostgreSQL is NOT
 * accent-insensitive. A posting stored as "México" or "Perú" will not match the
 * accent-free value below. Normalising the column (or an ISO country code)
 * is tracked as follow-up work rather than papered over here.
 */
export const COUNTRY_FACETS: JobFacet[] = [
  {
    slug: "argentina",
    dimension: "country",
    value: "Argentina",
    labelKey: "careersFacets.argentina",
  },
  {
    slug: "brazil",
    dimension: "country",
    value: "Brazil",
    labelKey: "careersFacets.brazil",
  },
  {
    slug: "chile",
    dimension: "country",
    value: "Chile",
    labelKey: "careersFacets.chile",
  },
  {
    slug: "colombia",
    dimension: "country",
    value: "Colombia",
    labelKey: "careersFacets.colombia",
  },
  {
    slug: "mexico",
    dimension: "country",
    value: "Mexico",
    labelKey: "careersFacets.mexico",
  },
  {
    slug: "peru",
    dimension: "country",
    value: "Peru",
    labelKey: "careersFacets.peru",
  },
  {
    slug: "uruguay",
    dimension: "country",
    value: "Uruguay",
    labelKey: "careersFacets.uruguay",
  },
  {
    slug: "united-states",
    dimension: "country",
    value: "United States",
    labelKey: "careersFacets.united_states",
  },
];

/** Every single-segment facet, in the order they are listed for crawlers. */
export const JOB_FACETS: JobFacet[] = [
  ...WORK_LOCATION_FACETS,
  ...CATEGORY_FACETS,
  ...COUNTRY_FACETS,
  ...JOB_TYPE_FACETS,
];

const FACETS_BY_SLUG = new Map(JOB_FACETS.map((facet) => [facet.slug, facet]));

export function findFacet(slug: string | undefined): JobFacet | null {
  if (!slug) return null;
  return FACETS_BY_SLUG.get(slug.toLowerCase()) ?? null;
}

/**
 * Resolves a `/jobs/:first(/:second)` path into the facets it represents.
 *
 * Returns `null` for anything the registry does not contain, for a second
 * segment that is not a country, and for a first segment that is a country
 * (which would be the reversed duplicate of a valid URL).
 */
export function resolveFacetPath(
  firstSlug: string | undefined,
  secondSlug?: string | undefined,
): JobFacet[] | null {
  const first = findFacet(firstSlug);
  if (!first) return null;

  if (!secondSlug) return [first];

  if (first.dimension === "country") return null;

  const second = findFacet(secondSlug);
  if (!second || second.dimension !== "country") return null;

  return [first, second];
}

/** Path builder, so links and the sitemap cannot drift apart. */
export function buildFacetPath(facets: JobFacet[]): string {
  return `/jobs/${facets.map((facet) => facet.slug).join("/")}`;
}
