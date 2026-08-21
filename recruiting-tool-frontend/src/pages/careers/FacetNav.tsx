import { Box, Stack, Typography, Link as MuiLink } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { buildFacetPath, type JobFacet } from "./jobFacets";

export interface FacetNavGroup {
  /** i18n key for the group heading ("Browse by location", …). */
  headingKey: string;
  /** Facet paths in this group. Each entry is a full facet path. */
  facets: JobFacet[][];
}

export interface FacetNavProps {
  groups: FacetNavGroup[];
}

/**
 * Crawlable internal linking between the facet landing pages.
 *
 * Facet pages only earn anything if a crawler can reach them, and the board's
 * job cards navigate through `onClick` handlers rather than anchors. This is the
 * one place on the careers surface that emits real `<a href>` elements pointing
 * at every indexable facet, so `/careers` links the 21 single-dimension pages
 * and each single-dimension page links its country pairs.
 */
const FacetNav: React.FC<FacetNavProps> = ({ groups }) => {
  const { t } = useTranslation();

  const visibleGroups = groups.filter((group) => group.facets.length > 0);
  if (visibleGroups.length === 0) return null;

  return (
    <Box
      component="nav"
      aria-label={t("careersFacets.nav_label")}
      sx={{ mt: 5, pt: 3, borderTop: 1, borderColor: "divider" }}
    >
      <Stack spacing={2.5}>
        {visibleGroups.map((group) => (
          <Box key={group.headingKey}>
            <Typography
              variant="subtitle2"
              component="h2"
              sx={{ fontWeight: 700, mb: 1.25 }}
            >
              {t(group.headingKey)}
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1.5} sx={{ rowGap: 1 }}>
              {group.facets.map((facetPath) => {
                const to = buildFacetPath(facetPath);
                return (
                  <MuiLink
                    key={to}
                    component={RouterLink}
                    to={to}
                    variant="body2"
                    color="text.secondary"
                    underline="hover"
                  >
                    {facetPath.map((facet) => t(facet.labelKey)).join(" · ")}
                  </MuiLink>
                );
              })}
            </Stack>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default FacetNav;
