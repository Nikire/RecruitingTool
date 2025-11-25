/**
 * ScoreBreakdown Component
 *
 * Displays detailed breakdown of AI scoring factors with visual progress bars
 * and explanatory text for each factor.
 */

import React from 'react';
import { Box, Typography, LinearProgress, Paper, Tooltip, Chip } from '@mui/material';
import {
  Psychology as SkillsIcon,
  WorkOutline as ExperienceIcon,
  School as EducationIcon,
  LocationOn as LocationIcon,
  Event as AvailabilityIcon,
  InfoOutlined as InfoIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { ScoreBreakdown as ScoreBreakdownType } from '../../types/ai-ranking';

interface ScoreBreakdownProps {
  breakdown: ScoreBreakdownType;
  showExplanations?: boolean; // Show detailed explanations for each factor
}

interface FactorConfig {
  key: keyof ScoreBreakdownType;
  labelKey: string;
  descriptionKey: string;
  icon: React.ReactNode;
  color: string;
}

/**
 * Get color based on score value
 */
function getScoreColor(score: number): string {
  if (score >= 85) return 'success.main';
  if (score >= 70) return 'primary.main';
  if (score >= 50) return 'warning.main';
  return 'error.main';
}

const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ breakdown, showExplanations = true }) => {
  const { t } = useTranslation();

  const factors: FactorConfig[] = [
    {
      key: 'skillsMatch',
      labelKey: 'ai_ranking.skills_match',
      descriptionKey: 'ai_ranking.skills_match_desc',
      icon: <SkillsIcon />,
      color: 'primary.main',
    },
    {
      key: 'experienceMatch',
      labelKey: 'ai_ranking.experience_match',
      descriptionKey: 'ai_ranking.experience_match_desc',
      icon: <ExperienceIcon />,
      color: 'secondary.main',
    },
    {
      key: 'educationMatch',
      labelKey: 'ai_ranking.education_match',
      descriptionKey: 'ai_ranking.education_match_desc',
      icon: <EducationIcon />,
      color: 'info.main',
    },
    {
      key: 'locationMatch',
      labelKey: 'ai_ranking.location_match',
      descriptionKey: 'ai_ranking.location_match_desc',
      icon: <LocationIcon />,
      color: 'warning.main',
    },
    {
      key: 'availability',
      labelKey: 'ai_ranking.availability',
      descriptionKey: 'ai_ranking.availability_desc',
      icon: <AvailabilityIcon />,
      color: 'success.main',
    },
  ];

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        {t('ai_ranking.score_breakdown')}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {factors.map((factor) => {
          const score = breakdown[factor.key];
          const scoreColor = getScoreColor(score);

          return (
            <Box key={factor.key}>
              {/* Factor Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Box sx={{ color: factor.color, display: 'flex', alignItems: 'center' }}>
                  {factor.icon}
                </Box>
                <Typography variant="subtitle1" sx={{ flexGrow: 1, fontWeight: 500 }}>
                  {t(factor.labelKey)}
                </Typography>

                {/* Score Badge */}
                <Chip
                  label={`${score}%`}
                  size="small"
                  sx={{
                    fontWeight: 'bold',
                    bgcolor: scoreColor,
                    color: 'white',
                    minWidth: 60,
                  }}
                />

                {/* Info Tooltip */}
                {showExplanations && (
                  <Tooltip title={t(factor.descriptionKey)} placement="top" arrow>
                    <InfoIcon sx={{ fontSize: 18, color: 'text.secondary', cursor: 'help' }} />
                  </Tooltip>
                )}
              </Box>

              {/* Progress Bar */}
              <LinearProgress
                variant="determinate"
                value={score}
                sx={{
                  height: 10,
                  borderRadius: 1,
                  bgcolor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: scoreColor,
                    borderRadius: 1,
                  },
                }}
              />

              {/* Explanation Text (optional) */}
              {showExplanations && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mt: 0.5, ml: 4 }}
                >
                  {t(factor.descriptionKey)}
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Scoring Method Info */}
      <Box
        sx={{
          mt: 3,
          pt: 2,
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
          {t('ai_ranking.scoring_method')}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {t('ai_ranking.scoring_method_desc')}
        </Typography>
      </Box>
    </Paper>
  );
};

export default ScoreBreakdown;
