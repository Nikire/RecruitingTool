import { Avatar, Box, Button, Chip, Typography } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useTranslation } from "react-i18next";

import type { PublicCompany } from "../../api/companies";
import { wrapLongText, truncatingChipSx } from "../../utils/textOverflow";

export interface CompanyHeaderProps {
  company: PublicCompany;
  /** Renders the name as the page `<h1>`. True on `/careers/company/:slug`. */
  asPageHeading?: boolean;
}

/**
 * Branded header for a single company's roles.
 *
 * Shared by the company-filtered view of `/careers` and by the standalone
 * `/careers/company/:companySlug` page, which is the URL a customer puts on
 * their own site — so this is the surface that has to look like theirs.
 */
const CompanyHeader: React.FC<CompanyHeaderProps> = ({
  company,
  asPageHeading = false,
}) => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        mb: 4,
        p: 3,
        borderRadius: 2,
        border: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        display: "flex",
        alignItems: "flex-start",
        gap: 2.5,
        flexWrap: "wrap",
      }}
    >
      {company.logoUrl ? (
        <Avatar
          src={company.logoUrl}
          alt={company.name}
          sx={{ width: 80, height: 80, boxShadow: 2, flexShrink: 0 }}
          variant="rounded"
        />
      ) : (
        <Avatar
          /*
           * Decorative: the letter placeholder carries no information the
           * company name beside it does not already say. MUI only forwards
           * `alt` to the inner <img>, which is not rendered without a `src`.
           */
          alt=""
          sx={{
            width: 80,
            height: 80,
            bgcolor: "primary.main",
            fontSize: "1.75rem",
            fontWeight: 700,
            boxShadow: 2,
            flexShrink: 0,
          }}
          variant="rounded"
        >
          {company.name.charAt(0).toUpperCase()}
        </Avatar>
      )}

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="h4"
          component={asPageHeading ? "h1" : "h2"}
          sx={{ fontWeight: 700, mb: 0.5, ...wrapLongText }}
        >
          {asPageHeading
            ? t("careersCompany.heading", { company: company.name })
            : company.name}
        </Typography>

        {company.industry && (
          <Chip
            label={company.industry}
            size="small"
            variant="filled"
            sx={{ mb: 1, fontSize: "0.75rem", ...truncatingChipSx }}
          />
        )}

        {company.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 1.5,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              ...wrapLongText,
            }}
          >
            {company.description}
          </Typography>
        )}

        {company.website && (
          <Button
            variant="contained"
            size="small"
            endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
            href={company.website}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ fontSize: "0.75rem", py: 0.5 }}
          >
            {t("careersJob.visit_website")}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default CompanyHeader;
