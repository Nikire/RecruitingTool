/**
 * ScorecardViewer Component
 * View submitted scorecard with all scores and notes
 */

import React from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Rating,
  LinearProgress,
  Chip,
  Divider,
  Paper,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Star as StarIcon,
  Print as PrintIcon,
} from "@mui/icons-material";
import { ScorecardSubmission } from "../../types/scorecard";
import { format } from "date-fns";

interface ScorecardViewerProps {
  open: boolean;
  onClose: () => void;
  submission: ScorecardSubmission;
  onPrint?: () => void;
}

const ScorecardViewer: React.FC<ScorecardViewerProps> = ({
  open,
  onClose,
  submission,
  onPrint,
}) => {
  const { t } = useTranslation();

  // Group scores by category
  const scoresByCategory = submission.scores.reduce(
    (acc, score) => {
      const categoryName = score.categoryName || t("scorecard.uncategorized");
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(score);
      return acc;
    },
    {} as Record<string, typeof submission.scores>,
  );

  const getScoreColor = (score: number): "success" | "warning" | "error" => {
    if (score >= 75) return "success";
    if (score >= 50) return "warning";
    return "error";
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 90) return t("scorecard.score_excellent");
    if (score >= 75) return t("scorecard.score_good");
    if (score >= 60) return t("scorecard.score_fair");
    return t("scorecard.score_poor");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "start",
          }}
        >
          <Box>
            <Typography variant="h6">
              {t("scorecard.view_scorecard")}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {submission.templateName}
            </Typography>
          </Box>
          {onPrint && (
            <Button startIcon={<PrintIcon />} onClick={onPrint} size="small">
              {t("common.print")}
            </Button>
          )}
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Overall Score Card */}
        <Paper
          elevation={2}
          sx={{
            p: 3,
            mb: 3,
            background: `linear-gradient(135deg, ${
              getScoreColor(submission.overallScore) === "success"
                ? "#4caf50"
                : getScoreColor(submission.overallScore) === "warning"
                  ? "#ff9800"
                  : "#f44336"
            } 0%, ${
              getScoreColor(submission.overallScore) === "success"
                ? "#81c784"
                : getScoreColor(submission.overallScore) === "warning"
                  ? "#ffb74d"
                  : "#e57373"
            } 100%)`,
            color: "white",
            textAlign: "center",
          }}
        >
          <Typography variant="h3" fontWeight="bold">
            {submission.overallScore}
          </Typography>
          <Typography variant="h6" sx={{ mt: 1 }}>
            {t("scorecard.overall_score")}
          </Typography>
          <Chip
            label={getScoreLabel(submission.overallScore)}
            sx={{
              mt: 2,
              bgcolor: "rgba(255, 255, 255, 0.2)",
              color: "white",
              fontWeight: "bold",
            }}
          />
        </Paper>

        {/* Submission Info */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="textSecondary">
            {t("scorecard.evaluated_by")}:{" "}
            <strong>{submission.evaluatorName}</strong>
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {t("scorecard.submitted_at")}:{" "}
            <strong>{format(new Date(submission.submittedAt), "PPpp")}</strong>
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Score Breakdown by Category */}
        <Typography variant="h6" gutterBottom>
          {t("scorecard.score_breakdown")}
        </Typography>

        {Object.entries(scoresByCategory).map(
          ([categoryName, categoryScores]) => (
            <Accordion key={categoryName} defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight="bold">{categoryName}</Typography>
              </AccordionSummary>

              <AccordionDetails>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {categoryScores.map((score) => (
                    <Box
                      key={score.criterionUid}
                      sx={{
                        p: 2,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                        bgcolor: "background.paper",
                      }}
                    >
                      {/* Criterion Name */}
                      <Typography variant="subtitle2" gutterBottom>
                        {score.criterionName ||
                          t("scorecard.unnamed_criterion")}
                      </Typography>

                      {/* Score Display */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mt: 1,
                          mb: 2,
                        }}
                      >
                        {/* Assuming maxScore of 5 for star display */}
                        {score.score <= 5 ? (
                          <Rating
                            value={score.score}
                            readOnly
                            max={5}
                            icon={<StarIcon fontSize="inherit" />}
                          />
                        ) : (
                          <Box sx={{ flex: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={(score.score / 10) * 100}
                              sx={{ height: 10, borderRadius: 5 }}
                            />
                          </Box>
                        )}
                        <Typography variant="body2" fontWeight="bold">
                          {score.score} / {score.score <= 5 ? 5 : 10}
                        </Typography>
                      </Box>

                      {/* Score Notes */}
                      {score.notes && (
                        <Box
                          sx={{
                            p: 1.5,
                            bgcolor: "action.hover",
                            borderRadius: 1,
                          }}
                        >
                          <Typography
                            variant="caption"
                            color="textSecondary"
                            display="block"
                          >
                            {t("scorecard.notes")}:
                          </Typography>
                          <Typography variant="body2">{score.notes}</Typography>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          ),
        )}

        {/* Overall Notes */}
        {submission.notes && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              {t("scorecard.overall_notes")}
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                bgcolor: "action.hover",
              }}
            >
              <Typography variant="body2">{submission.notes}</Typography>
            </Paper>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>{t("common.close")}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScorecardViewer;
