/**
 * ScorecardForm Component
 * Submit scorecard evaluation during/after interview
 */

import React, { useState } from "react";
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
  TextField,
  Slider,
  Rating,
  Alert,
  Chip,
  LinearProgress,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Star as StarIcon,
} from "@mui/icons-material";
import { ScorecardTemplate, CriterionScoreDto } from "../../types/scorecard";

interface ScorecardFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    scores: CriterionScoreDto[];
    notes?: string;
  }) => Promise<void>;
  template: ScorecardTemplate;
  interviewUid: string;
  isSubmitting?: boolean;
}

interface ScoreEntry extends CriterionScoreDto {
  categoryName: string;
  criterionName: string;
  maxScore: number;
}

const ScorecardForm: React.FC<ScorecardFormProps> = ({
  open,
  onClose,
  onSubmit,
  template,
  isSubmitting,
}) => {
  const { t } = useTranslation();

  // Initialize scores for all criteria
  const initializeScores = (): ScoreEntry[] => {
    const scores: ScoreEntry[] = [];
    template.categories.forEach((category) => {
      category.criteria.forEach((criterion) => {
        scores.push({
          criterionUid: criterion.uid,
          categoryName: category.name,
          criterionName: criterion.name,
          maxScore: criterion.maxScore,
          score: 0,
          notes: "",
        });
      });
    });
    return scores;
  };

  const [scores, setScores] = useState<ScoreEntry[]>(initializeScores());
  const [overallNotes, setOverallNotes] = useState("");

  const updateScore = (
    criterionUid: string,
    field: "score" | "notes",
    value: number | string,
  ) => {
    setScores(
      scores.map((score) =>
        score.criterionUid === criterionUid
          ? { ...score, [field]: value }
          : score,
      ),
    );
  };

  const getScoreForCriterion = (
    criterionUid: string,
  ): ScoreEntry | undefined => {
    return scores.find((s) => s.criterionUid === criterionUid);
  };

  const calculateWeightedScore = (): number => {
    let totalWeightedScore = 0;

    template.categories.forEach((category) => {
      const categoryScores = scores.filter((s) =>
        category.criteria.some((c) => c.uid === s.criterionUid),
      );

      if (categoryScores.length === 0) return;

      // Calculate average normalized score for this category
      const categoryAverage =
        categoryScores.reduce((sum, s) => {
          const criterion = category.criteria.find(
            (c) => c.uid === s.criterionUid,
          );
          if (!criterion) return sum;
          return sum + (s.score / criterion.maxScore) * 100;
        }, 0) / categoryScores.length;

      // Apply category weight
      totalWeightedScore += (categoryAverage * category.weight) / 100;
    });

    return Math.round(totalWeightedScore * 100) / 100;
  };

  const handleSubmit = async () => {
    await onSubmit({
      scores: scores.map(({ criterionUid, score, notes }) => ({
        criterionUid,
        score,
        notes: notes || undefined,
      })),
      notes: overallNotes || undefined,
    });

    onClose();
  };

  const handleClose = () => {
    setScores(initializeScores());
    setOverallNotes("");
    onClose();
  };

  const getCompletionPercentage = (): number => {
    const scoredCount = scores.filter((s) => s.score > 0).length;
    return (scoredCount / scores.length) * 100;
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box>
          <Typography variant="h6">
            {t("scorecard.submit_scorecard")}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {template.name}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Progress Indicator */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="body2" color="textSecondary">
              {t("scorecard.completion_progress")}
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {Math.round(getCompletionPercentage())}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={getCompletionPercentage()}
          />
        </Box>

        {/* Overall Score Preview */}
        <Alert severity="info" sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="body2">
              {t("scorecard.overall_score")}:
            </Typography>
            <Chip
              label={`${calculateWeightedScore()}/100`}
              color="primary"
              size="small"
            />
          </Box>
        </Alert>

        {/* Categories and Criteria */}
        {template.categories.map((category) => (
          <Accordion key={category.uid} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  mr: 1,
                }}
              >
                <Typography fontWeight="bold">{category.name}</Typography>
                <Chip
                  label={`${category.weight}%`}
                  size="small"
                  color="primary"
                />
              </Box>
            </AccordionSummary>

            <AccordionDetails>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {category.criteria.map((criterion) => {
                  const scoreEntry = getScoreForCriterion(criterion.uid);
                  if (!scoreEntry) return null;

                  return (
                    <Box
                      key={criterion.uid}
                      sx={{
                        p: 2,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                      }}
                    >
                      {/* Criterion Name & Description */}
                      <Typography variant="subtitle2" gutterBottom>
                        {criterion.name}
                      </Typography>
                      {criterion.description && (
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          gutterBottom
                        >
                          {criterion.description}
                        </Typography>
                      )}

                      {/* Score Input - use stars for 1-5, slider for 1-10 */}
                      <Box sx={{ mt: 2 }}>
                        {criterion.maxScore <= 5 ? (
                          <Box>
                            <Rating
                              value={scoreEntry.score}
                              onChange={(_, value) =>
                                updateScore(criterion.uid, "score", value || 0)
                              }
                              max={criterion.maxScore}
                              size="large"
                              icon={<StarIcon fontSize="inherit" />}
                            />
                            <Typography
                              variant="caption"
                              color="textSecondary"
                              sx={{ ml: 1 }}
                            >
                              {scoreEntry.score} / {criterion.maxScore}
                            </Typography>
                          </Box>
                        ) : (
                          <Box>
                            <Slider
                              value={scoreEntry.score}
                              onChange={(_, value) =>
                                updateScore(
                                  criterion.uid,
                                  "score",
                                  value as number,
                                )
                              }
                              min={0}
                              max={criterion.maxScore}
                              marks
                              step={1}
                              valueLabelDisplay="on"
                            />
                          </Box>
                        )}
                      </Box>

                      {/* Criterion Notes */}
                      <TextField
                        label={t("scorecard.criterion_notes")}
                        value={scoreEntry.notes}
                        onChange={(e) =>
                          updateScore(criterion.uid, "notes", e.target.value)
                        }
                        fullWidth
                        multiline
                        rows={2}
                        size="small"
                        sx={{ mt: 2 }}
                        placeholder={t("scorecard.criterion_notes_placeholder")}
                      />
                    </Box>
                  );
                })}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}

        {/* Overall Notes */}
        <Box sx={{ mt: 3 }}>
          <TextField
            label={t("scorecard.overall_notes")}
            value={overallNotes}
            onChange={(e) => setOverallNotes(e.target.value)}
            fullWidth
            multiline
            rows={3}
            placeholder={t("scorecard.overall_notes_placeholder")}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          {t("common.cancel")}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting}
        >
          {isSubmitting ? t("common.submitting") : t("scorecard.submit")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScorecardForm;
