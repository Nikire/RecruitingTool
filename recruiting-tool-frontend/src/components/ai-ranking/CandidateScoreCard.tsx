/**
 * CandidateScoreCard Component
 *
 * Displays an individual candidate's AI-generated score in a compact card format.
 * Includes overall score, tier badge, quick breakdown, and link to full profile.
 */

import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  Avatar,
  Button,
  LinearProgress,
} from "@mui/material";
import {
  EmojiEvents as TrophyIcon,
  PersonOutline as PersonIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { CandidateScore, getScoreTierColor } from "../../types/ai-ranking";

interface CandidateScoreCardProps {
  score: CandidateScore;
  rank?: number; // Optional rank number (#1, #2, etc.)
  onViewProfile?: (candidateUid: string) => void;
}

/**
 * Get initials from candidate name
 */
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const CandidateScoreCard: React.FC<CandidateScoreCardProps> = ({
  score,
  rank,
  onViewProfile,
}) => {
  const { t } = useTranslation();

  const tierColor = getScoreTierColor(score.scoreTier);

  // Calculate average of top 3 factors for quick breakdown
  const topFactors = [
    { label: t("ai_ranking.skills_match"), value: score.breakdown.skillsMatch },
    {
      label: t("ai_ranking.experience_match"),
      value: score.breakdown.experienceMatch,
    },
    {
      label: t("ai_ranking.education_match"),
      value: score.breakdown.educationMatch,
    },
  ];

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        transition: "box-shadow 0.3s, transform 0.2s",
        "&:hover": {
          boxShadow: 4,
          transform: "translateY(-4px)",
        },
      }}
    >
      {/* Rank Badge (if provided) */}
      {rank && (
        <Box
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          {rank <= 3 && <TrophyIcon sx={{ fontSize: 18, color: "gold" }} />}
          <Typography
            variant="caption"
            sx={{
              fontWeight: "bold",
              color: "text.secondary",
            }}
          >
            #{rank}
          </Typography>
        </Box>
      )}

      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        {/* Candidate Info */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor:
                tierColor === "success"
                  ? "success.main"
                  : tierColor === "primary"
                    ? "primary.main"
                    : tierColor === "warning"
                      ? "warning.main"
                      : "error.main",
            }}
          >
            {getInitials(score.candidateName)}
          </Avatar>

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {score.candidateName}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {score.candidateEmail}
            </Typography>
          </Box>
        </Box>

        {/* Overall Score */}
        <Box sx={{ mb: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {t("ai_ranking.overall_score")}
            </Typography>
            <Typography
              variant="h5"
              fontWeight="bold"
              color={`${tierColor}.main`}
            >
              {score.overallScore}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={score.overallScore}
            sx={{
              height: 8,
              borderRadius: 1,
              bgcolor: "grey.200",
              "& .MuiLinearProgress-bar": {
                bgcolor: `${tierColor}.main`,
              },
            }}
          />
        </Box>

        {/* Tier Badge */}
        <Box sx={{ mb: 2 }}>
          <Chip
            label={t(`ai_ranking.${score.scoreTier}`)}
            color={tierColor}
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Box>

        {/* Quick Breakdown */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mb: 1 }}
        >
          {t("ai_ranking.key_factors")}:
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          {topFactors.map((factor, index) => (
            <Box
              key={index}
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <TrendingUpIcon sx={{ fontSize: 14, color: "text.secondary" }} />
              <Typography variant="caption" sx={{ flexGrow: 1, minWidth: 0 }}>
                {factor.label}
              </Typography>
              <Typography variant="caption" fontWeight="bold">
                {factor.value}%
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>

      <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<PersonIcon />}
          onClick={() => onViewProfile?.(score.candidateUid)}
          fullWidth
        >
          {t("ai_ranking.view_profile")}
        </Button>
      </CardActions>
    </Card>
  );
};

export default CandidateScoreCard;
