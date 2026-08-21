import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Button, Container, Typography } from "@mui/material";
import { Link as RouterLink, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Seo from "../../components/common/Seo";
import { wrapLongText } from "../../utils/textOverflow";
import CareersBoard, { type BoardFilters } from "./CareersBoard";
import FacetNav from "./FacetNav";
import { buildFacetPath, resolveFacetPath, type JobFacet } from "./jobFacets";
import {
  CATEGORY_FACET_GROUP,
  COUNTRY_FACET_GROUP,
  WORK_LOCATION_FACET_GROUP,
  countryPairsFor,
} from "./facetNavGroups";

/** Maps a facet onto the board filter it pins. */
const toFixedFilters = (facets: JobFacet[]): Partial<BoardFilters> => {
  const fixed: Partial<BoardFilters> = {};
  for (const facet of facets) {
    fixed[facet.dimension] = facet.value;
  }
  return fixed;
};

export interface FacetedJobsPageProps {
  /**
   * Overrides for the route params.
   *
   * `/jobs/{a}/{b}` is one router path serving two pages — a job detail URL
   * (`{b}` ends in a UID) and a two-dimension facet URL — so the dispatcher in
   * `App.tsx` reads the params once and hands them down, rather than the two
   * pages disagreeing about what the segments are called.
   */
  facetSlug?: string;
  secondFacetSlug?: string;
}

/**
 * A faceted job index at `/jobs/{facet}` or `/jobs/{role-facet}/{country}`.
 *
 * These pages exist to rank for the searches people actually type — "remote
 * jobs", "engineering jobs in Colombia" — instead of asking Google to
 * understand a query string. Each one gets its own title, description and
 * canonical URL.
 *
 * Two guard rails keep this from turning into doorway spam:
 *
 *  - the facet space is a closed registry (`jobFacets.ts`), so there is no
 *    combinatorial URL explosion to crawl;
 *  - a facet with zero live postings emits `noindex`, so thin pages never enter
 *    the index and leave again by themselves once a role is filled.
 *
 * Narrowing further is deliberately not done in place: `escapeTo` sends any
 * filter change to `/careers?...` so the indexed URLs stay static.
 */
const FacetedJobsPage: React.FC<FacetedJobsPageProps> = ({
  facetSlug: facetSlugProp,
  secondFacetSlug: secondFacetSlugProp,
}) => {
  const { t } = useTranslation();
  const params = useParams<{ facetSlug?: string; secondFacetSlug?: string }>();

  const facetSlug = facetSlugProp ?? params.facetSlug;
  const secondFacetSlug = secondFacetSlugProp ?? params.secondFacetSlug;

  const facets = useMemo(
    () => resolveFacetPath(facetSlug, secondFacetSlug),
    [facetSlug, secondFacetSlug],
  );

  // `null` until the first response lands, so an unknown count is not mistaken
  // for an empty facet and needlessly noindexed.
  const [resultCount, setResultCount] = useState<number | null>(null);
  const handleResultCount = useCallback(
    (count: number) => setResultCount(count),
    [],
  );

  // Navigating between facets must not carry the previous page's count over —
  // a stale zero would `noindex` a facet that actually has roles.
  useEffect(() => {
    setResultCount(null);
  }, [facetSlug, secondFacetSlug]);

  const fixedFilters = useMemo(
    () => (facets ? toFixedFilters(facets) : {}),
    [facets],
  );

  if (!facets) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
        <Seo
          title={t("seo.jobs_facet.not_found_title")}
          description={t("seo.jobs_facet.not_found_description")}
          noindex
        />
        <Typography variant="h5" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          {t("careersFacets.not_found_title")}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {t("careersFacets.not_found_body")}
        </Typography>
        <Button component={RouterLink} to="/careers" variant="contained">
          {t("common.back_to_careers")}
        </Button>
      </Container>
    );
  }

  const roleFacet = facets[0];
  const countryFacet = facets[1];
  const canonical = buildFacetPath(facets);

  const headingLabel = countryFacet
    ? t("careersFacets.pair_heading", {
        role: t(roleFacet.labelKey),
        country: t(countryFacet.labelKey),
      })
    : t("careersFacets.single_heading", { facet: t(roleFacet.labelKey) });

  const seoTitle = countryFacet
    ? t("seo.jobs_facet.pair_title", {
        role: t(roleFacet.labelKey),
        country: t(countryFacet.labelKey),
      })
    : t("seo.jobs_facet.title", { facet: t(roleFacet.labelKey) });

  const seoDescription = countryFacet
    ? t("seo.jobs_facet.pair_description", {
        role: t(roleFacet.labelKey),
        country: t(countryFacet.labelKey),
      })
    : t("seo.jobs_facet.description", { facet: t(roleFacet.labelKey) });

  // Sibling links so a crawler that lands on one facet can reach the others.
  const navGroups = countryFacet
    ? [countryPairsFor(roleFacet), COUNTRY_FACET_GROUP]
    : roleFacet.dimension === "country"
      ? [CATEGORY_FACET_GROUP, WORK_LOCATION_FACET_GROUP]
      : [countryPairsFor(roleFacet), WORK_LOCATION_FACET_GROUP];

  return (
    <>
      <Seo
        title={seoTitle}
        description={seoDescription}
        canonical={canonical}
        // Zero live postings today means there is nothing on this page worth
        // indexing today. It becomes indexable again the moment a role matches.
        noindex={resultCount === 0}
      />

      <CareersBoard
        fixedFilters={fixedFilters}
        escapeTo="/careers"
        onResultCountChange={handleResultCount}
        header={
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{ fontWeight: 700, mb: 1, ...wrapLongText }}
            >
              {headingLabel}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {seoDescription}
            </Typography>
          </Box>
        }
        footerNav={<FacetNav groups={navGroups} />}
      />
    </>
  );
};

export default FacetedJobsPage;
