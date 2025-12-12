import React from "react";
import { Box, Chip, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

/**
 * Stage data interface
 */
export interface Stage {
  uid: string;
  title: string;
  description?: string;
  type: string;
  position: number;
}

/**
 * StagesList component props
 */
export interface StagesListProps {
  /** Array of stages to display */
  stages: Stage[];
  /** Whether to show the stage type label (default: true) */
  showType?: boolean;
  /** Color of the position chip (default: 'primary') */
  chipColor?: "primary" | "secondary";
  /** Message to display when no stages exist */
  emptyMessage?: string;
  /** Whether to translate the stage type using i18n (default: true) */
  translate?: boolean;
}

/**
 * StagesList - Reusable component for displaying hiring process stages
 *
 * Features:
 * - Auto-sorts stages by position
 * - Position chip numbered from 1
 * - Optional stage type display with i18n support
 * - Customizable empty state message
 * - Responsive layout
 * - Full i18n compliance
 *
 * Usage:
 * ```tsx
 * <StagesList
 *   stages={jobPosition.stages}
 *   showType={true}
 *   translate={true}
 * />
 * ```
 */
const StagesList: React.FC<StagesListProps> = ({
  stages,
  showType = true,
  chipColor = "primary",
  emptyMessage,
  translate = true,
}) => {
  const { t } = useTranslation();

  // Default empty message if not provided
  const defaultEmptyMessage = t("job_position_detail.no_stages");
  const displayEmptyMessage = emptyMessage || defaultEmptyMessage;

  // If no stages, show empty state
  if (!stages || stages.length === 0) {
    return <Typography color="textSecondary">{displayEmptyMessage}</Typography>;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {stages
        .sort((a, b) => a.position - b.position)
        .map((stage, index) => (
          <Box
            key={stage.uid}
            sx={{ display: "flex", alignItems: "center", gap: 2 }}
          >
            <Chip label={index + 1} size="small" color={chipColor} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body1" fontWeight="bold">
                {stage.title}
              </Typography>
              {stage.description && (
                <Typography variant="body2" color="textSecondary">
                  {stage.description}
                </Typography>
              )}
              {showType && (
                <Typography variant="caption" color="textSecondary">
                  {t("job_position_detail.stage_type")}:{" "}
                  {translate
                    ? t(`stage_types.${stage.type.toLowerCase()}`)
                    : stage.type.replace(/_/g, " ")}
                </Typography>
              )}
            </Box>
          </Box>
        ))}
    </Box>
  );
};

export default StagesList;
