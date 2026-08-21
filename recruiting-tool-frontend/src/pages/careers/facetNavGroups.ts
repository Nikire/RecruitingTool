import type { FacetNavGroup } from "./FacetNav";
import {
  CATEGORY_FACETS,
  COUNTRY_FACETS,
  JOB_TYPE_FACETS,
  WORK_LOCATION_FACETS,
  type JobFacet,
} from "./jobFacets";

/** Wraps single facets as one-segment facet paths for `<FacetNav>`. */
const asSinglePaths = (facets: JobFacet[]): JobFacet[][] =>
  facets.map((facet) => [facet]);

export const WORK_LOCATION_FACET_GROUP: FacetNavGroup = {
  headingKey: "careersFacets.browse_by_work_location",
  facets: asSinglePaths(WORK_LOCATION_FACETS),
};

export const COUNTRY_FACET_GROUP: FacetNavGroup = {
  headingKey: "careersFacets.browse_by_country",
  facets: asSinglePaths(COUNTRY_FACETS),
};

export const CATEGORY_FACET_GROUP: FacetNavGroup = {
  headingKey: "careersFacets.browse_by_category",
  facets: asSinglePaths(CATEGORY_FACETS),
};

export const JOB_TYPE_FACET_GROUP: FacetNavGroup = {
  headingKey: "careersFacets.browse_by_job_type",
  facets: asSinglePaths(JOB_TYPE_FACETS),
};

/**
 * Country pairs for one role facet, e.g. `/jobs/engineering/colombia`.
 *
 * Emitted only from the matching single-dimension page, which is what keeps the
 * two-segment URLs discoverable without dumping all of them onto `/careers`.
 */
export const countryPairsFor = (roleFacet: JobFacet): FacetNavGroup => ({
  headingKey: "careersFacets.browse_by_country",
  facets: COUNTRY_FACETS.map((country) => [roleFacet, country]),
});
