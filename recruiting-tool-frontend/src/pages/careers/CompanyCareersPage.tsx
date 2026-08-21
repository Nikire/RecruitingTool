import { useMemo } from "react";
import { Box, Button, Container, Typography } from "@mui/material";
import { Link as RouterLink, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Seo from "../../components/common/Seo";
import CenteredLoadingSpinner from "../../components/common/CenteredLoadingSpinner";
import { usePublicCompaniesWithJobs } from "../../hooks/api/useCompanies";
import { buildOrganizationLd } from "../../utils/structuredData";
import CareersBoard from "./CareersBoard";
import CompanyHeader from "./CompanyHeader";
import { buildCompanyCareersPath, resolveCompanyBySlug } from "./careersUrls";

/**
 * A single company's branded careers page, at `/careers/company/:companySlug`.
 *
 * This is the URL a customer links from their own site and puts in a job ad, so
 * three things matter: it must be readable (a name, not a UUID), it must be
 * scoped to one company with no way to browse out of it, and every filtered
 * view of it must stay linkable. Filter state therefore lives in the query
 * string, and `<Seo>` strips those params from the canonical URL so the
 * filtered variants all consolidate onto this one page.
 *
 * The slug resolves against the list of companies the public API already
 * returns; no lookup ever trusts a raw path string, and `companyUid` — a UID,
 * never a numeric id — is what actually scopes the query.
 */
const CompanyCareersPage: React.FC = () => {
  const { t } = useTranslation();
  const { companySlug } = useParams<{ companySlug: string }>();
  const { data: companiesData, isLoading } = usePublicCompaniesWithJobs();

  const company = useMemo(
    () => resolveCompanyBySlug(companiesData ?? [], companySlug),
    [companiesData, companySlug],
  );

  // `<Seo>` keys its head entry on `jsonLd` by reference, so an inline object
  // would rewrite the document head on every render.
  const organizationLd = useMemo(
    () =>
      company
        ? buildOrganizationLd({
            name: company.name,
            url: company.website ?? undefined,
            logo: company.logoUrl ?? undefined,
            description: company.description ?? undefined,
          })
        : undefined,
    [company],
  );

  if (isLoading) {
    return <CenteredLoadingSpinner />;
  }

  if (!company) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
        {/* A slug that resolves to nothing is a soft 404 — keep it unindexed. */}
        <Seo
          title={t("seo.company_careers.not_found_title")}
          description={t("seo.company_careers.not_found_description")}
          noindex
        />
        <Typography variant="h5" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          {t("careersCompany.not_found_title")}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {t("careersCompany.not_found_body")}
        </Typography>
        <Button component={RouterLink} to="/careers" variant="contained">
          {t("common.back_to_careers")}
        </Button>
      </Container>
    );
  }

  const canonical = buildCompanyCareersPath(company);

  return (
    <>
      <Seo
        title={t("seo.company_careers.title", { company: company.name })}
        description={t("seo.company_careers.description", {
          company: company.name,
        })}
        canonical={canonical}
        jsonLd={organizationLd}
      />

      <CareersBoard
        fixedFilters={{ company: company.uid }}
        companies={[company]}
        isLoadingCompanies={false}
        header={
          <Box>
            <CompanyHeader company={company} asPageHeading />
          </Box>
        }
      />
    </>
  );
};

export default CompanyCareersPage;
