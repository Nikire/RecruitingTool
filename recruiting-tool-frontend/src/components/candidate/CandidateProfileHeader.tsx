import { Avatar, Box, Button, Paper, Stack, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Candidate } from "../../types/candidate";
import { MetadataDisplay } from "../common";
import type { MetadataItem } from "../common";

interface CandidateProfileHeaderProps {
  candidate: Candidate;
  /** Renders the edit affordance. Omit for read-only viewers. */
  onEdit?: () => void;
}

/** First letter of the first two words of a name, e.g. "Ada Lovelace" -> "AL". */
const getInitials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();

/**
 * Identity block at the top of the candidate detail page: who this person is,
 * how to reach them, and where they came from.
 *
 * Purely presentational — the edit dialog is owned by the page so the same
 * `UpdateCandidateDialog` instance is reused rather than duplicated here.
 */
const CandidateProfileHeader: React.FC<CandidateProfileHeaderProps> = ({
  candidate,
  onEdit,
}) => {
  const { t } = useTranslation();

  const metadata: MetadataItem[] = [
    {
      label: "common.created",
      value: candidate.createdAt
        ? format(new Date(candidate.createdAt), "PP")
        : t("common.n_a"),
    },
    {
      label: "candidates.created_by_label",
      value: candidate.createdByName || t("common.n_a"),
    },
  ];

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 0 }}
        >
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: "primary.main",
              fontSize: "1.5rem",
            }}
          >
            {getInitials(candidate.name)}
          </Avatar>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h4"
              sx={{
                fontSize: { xs: "1.5rem", sm: "2rem" },
                fontWeight: 700,
                wordBreak: "break-word",
              }}
            >
              {candidate.name}
            </Typography>

            <Stack spacing={0.5} sx={{ mt: 0.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <EmailIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  component="a"
                  href={`mailto:${candidate.email}`}
                  sx={{ wordBreak: "break-all", textDecoration: "none" }}
                >
                  {candidate.email}
                </Typography>
              </Box>

              {candidate.phone && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <PhoneIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                  <Typography variant="body2" color="text.secondary">
                    {candidate.phone}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>
        </Box>

        {onEdit && (
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={onEdit}
            sx={{ minHeight: 44, width: { xs: "100%", sm: "auto" } }}
            aria-label={t("candidate_detail.edit_candidate")}
          >
            {t("candidate_detail.edit_candidate")}
          </Button>
        )}
      </Box>

      <Box sx={{ mt: 2 }}>
        <MetadataDisplay items={metadata} translate />
      </Box>
    </Paper>
  );
};

export default CandidateProfileHeader;
