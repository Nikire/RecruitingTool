import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Alert,
  AlertTitle,
  Chip,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useCompareCandidates } from "../../hooks/api/useAi";
import { useListJobPositions } from "../../hooks/api/useJobPositions";
import { EntitySelect } from "../common";
import { CompareCandidatesResponse } from "../../types/ai-ranking";
import { JobPosition } from "../../types/jobPosition.types";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";

interface CompareCandidatesDialogProps {
  open: boolean;
  onClose: () => void;
  candidateUids: string[];
}

const CompareCandidatesDialog: React.FC<CompareCandidatesDialogProps> = ({
  open,
  onClose,
  candidateUids,
}) => {
  const { t } = useTranslation();
  const [selectedJobPosition, setSelectedJobPosition] =
    useState<JobPosition | null>(null);
  const [comparisonResult, setComparisonResult] =
    useState<CompareCandidatesResponse | null>(null);

  const { mutate: compareCandidates, isPending } = useCompareCandidates();
  const { data: jobPositions, isLoading: jobPositionsLoading } =
    useListJobPositions({
      page: 1,
      limit: 100,
      sortBy: "createdAt",
      sortOrder: "desc",
    });

  const handleCompare = () => {
    if (!selectedJobPosition) return;

    compareCandidates(
      {
        candidateUids,
        jobPositionUid: selectedJobPosition.uid,
      },
      {
        onSuccess: (data) => {
          setComparisonResult(data);
        },
      },
    );
  };

  const handleClose = () => {
    setComparisonResult(null);
    setSelectedJobPosition(null);
    onClose();
  };

  // Get score color based on value
  const getScoreColor = (score: number): "error" | "warning" | "success" => {
    if (score >= 85) return "success";
    if (score >= 70) return "warning";
    return "error";
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>{t("candidates.compare_candidates_title")}</DialogTitle>

      <DialogContent>
        {!comparisonResult ? (
          // Job Position Selection
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              {t("candidates.compare_candidates_hint", {
                count: candidateUids.length,
              })}
            </Typography>

            <EntitySelect
              label={t("candidates.select_job_position")}
              value={selectedJobPosition}
              onChange={(value) =>
                setSelectedJobPosition(value as JobPosition | null)
              }
              options={jobPositions?.data || []}
              getOptionLabel={(option) => option.title}
              getOptionValue={(option) => option.uid}
              isLoading={jobPositionsLoading}
              required
              fullWidth
            />

            {isPending && (
              <Box sx={{ mt: 3 }}>
                <LinearProgress />
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mt: 1, textAlign: "center" }}
                >
                  {t("candidates.comparing_candidates")}
                </Typography>
              </Box>
            )}
          </Box>
        ) : (
          // Comparison Results
          <Box sx={{ mt: 2 }}>
            {/* Top Candidate Highlight */}
            <Alert severity="success" icon={<EmojiEventsIcon />} sx={{ mb: 3 }}>
              <AlertTitle>{t("candidates.top_recommendation")}</AlertTitle>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {comparisonResult.comparisonAnalysis.topCandidateName}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {comparisonResult.comparisonAnalysis.recommendationReason}
              </Typography>
            </Alert>

            {/* Comparison Table */}
            <Box sx={{ overflowX: "auto", mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>{t("candidates.rank")}</strong>
                    </TableCell>
                    <TableCell>
                      <strong>{t("candidates.name_label")}</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>{t("candidates.overall_score")}</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>{t("candidates.skills_score")}</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>{t("candidates.experience_score")}</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>{t("candidates.education_score")}</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {comparisonResult.candidates.map((candidate) => (
                    <TableRow
                      key={candidate.candidateUid}
                      sx={{
                        backgroundColor:
                          candidate.rank === 1 ? "success.light" : "inherit",
                        opacity: candidate.rank === 1 ? 1 : 0.8,
                      }}
                    >
                      <TableCell>
                        {candidate.rank === 1 ? (
                          <Chip
                            icon={<EmojiEventsIcon />}
                            label={candidate.rank}
                            color="success"
                            size="small"
                          />
                        ) : (
                          <Chip label={candidate.rank} size="small" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {candidate.candidateName}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${candidate.overallScore}%`}
                          color={getScoreColor(candidate.overallScore)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        {candidate.skillsScore}
                      </TableCell>
                      <TableCell align="center">
                        {candidate.experienceScore}
                      </TableCell>
                      <TableCell align="center">
                        {candidate.educationScore}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>

            {/* Strengths and Weaknesses */}
            <Typography variant="h6" gutterBottom>
              {t("candidates.detailed_analysis")}
            </Typography>
            {comparisonResult.candidates.map((candidate) => (
              <Box key={candidate.candidateUid} sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  {candidate.candidateName} (#{candidate.rank})
                </Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="body2"
                      color="success.main"
                      sx={{ display: "flex", alignItems: "center", mb: 0.5 }}
                    >
                      <CheckCircleIcon fontSize="small" sx={{ mr: 0.5 }} />
                      {t("candidates.strengths")}
                    </Typography>
                    <List dense>
                      {candidate.strengths.map((strength, index) => (
                        <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                          <ListItemText
                            primary={strength}
                            primaryTypographyProps={{
                              variant: "body2",
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="body2"
                      color="warning.main"
                      sx={{ display: "flex", alignItems: "center", mb: 0.5 }}
                    >
                      <WarningIcon fontSize="small" sx={{ mr: 0.5 }} />
                      {t("candidates.weaknesses")}
                    </Typography>
                    <List dense>
                      {candidate.weaknesses.map((weakness, index) => (
                        <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                          <ListItemText
                            primary={weakness}
                            primaryTypographyProps={{
                              variant: "body2",
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Box>
                {candidate.rank < comparisonResult.candidates.length && (
                  <Divider sx={{ mt: 2 }} />
                )}
              </Box>
            ))}

            {/* AI Analysis */}
            <Alert severity="info" sx={{ mt: 3 }}>
              <AlertTitle>{t("candidates.ai_analysis")}</AlertTitle>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>{t("candidates.summary")}:</strong>{" "}
                {comparisonResult.comparisonAnalysis.summary}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>{t("candidates.key_differentiators")}:</strong>
              </Typography>
              <List dense>
                {comparisonResult.comparisonAnalysis.keyDifferentiators.map(
                  (differentiator, index) => (
                    <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                      <ListItemText
                        primary={differentiator}
                        primaryTypographyProps={{
                          variant: "body2",
                        }}
                      />
                    </ListItem>
                  ),
                )}
              </List>
              <Typography variant="body2" sx={{ mt: 2 }}>
                <strong>{t("candidates.final_recommendation")}:</strong>{" "}
                {comparisonResult.comparisonAnalysis.finalRecommendation}
              </Typography>
            </Alert>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isPending}>
          {t("common.close")}
        </Button>
        {!comparisonResult && (
          <Button
            onClick={handleCompare}
            variant="contained"
            disabled={!selectedJobPosition || isPending}
          >
            {isPending ? t("candidates.comparing") : t("candidates.compare")}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CompareCandidatesDialog;
