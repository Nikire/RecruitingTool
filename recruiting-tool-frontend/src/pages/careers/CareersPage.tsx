import { useMemo } from "react";
import { Typography, Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import Seo from "../../components/common/Seo";
import { usePublicCompaniesWithJobs } from "../../hooks/api/useCompanies";
import { wrapLongText } from "../../utils/textOverflow";
import CareersBoard from "./CareersBoard";
import CompanyHeader from "./CompanyHeader";
import FacetNav from "./FacetNav";
import {
  CATEGORY_FACET_GROUP,
  COUNTRY_FACET_GROUP,
  JOB_TYPE_FACET_GROUP,
  WORK_LOCATION_FACET_GROUP,
} from "./facetNavGroups";

/**
 * The global public job board at `/careers`.
 *
 * Filter state lives entirely in the query string (see `CareersBoard`), so a
 * filtered view is a link. `<Seo>` strips search params from the canonical URL,
 * so `/careers?category=Engineering&page=3` still canonicalises to `/careers`
 * and no filter combination is indexed as a duplicate.
 */
const CareersPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  const companyUid = searchParams.get("company") ?? "";
  const { data: companiesData } = usePublicCompaniesWithJobs();

  // Header treatment when the visitor filtered down to a single company. The
  // branded, linkable version of this view is `/careers/company/:companySlug`.
  const selectedCompany = useMemo(() => {
    if (!companyUid) return null;
    return (companiesData ?? []).find((c) => c.uid === companyUid) ?? null;
  }, [companiesData, companyUid]);

  return (
    <>
      <Seo
        title={t("seo.careers.title")}
        description={t("seo.careers.description")}
      />

      <CareersBoard
        header={
          <>
            {selectedCompany && <CompanyHeader company={selectedCompany} />}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h4"
                component={selectedCompany ? "h2" : "h1"}
                sx={{ fontWeight: 700, mb: 1, ...wrapLongText }}
              >
                {t("careersHero.title")}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t("careersHero.subtitle")}
              </Typography>
            </Box>
          </>
        }
        footerNav={
          <FacetNav
            groups={[
              WORK_LOCATION_FACET_GROUP,
              COUNTRY_FACET_GROUP,
              CATEGORY_FACET_GROUP,
              JOB_TYPE_FACET_GROUP,
            ]}
          />
        }
      />
    </>
  );
};

export default CareersPage;
