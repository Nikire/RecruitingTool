import { Chip, ChipProps } from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  JobModerationStatus,
  JobPositionStatus,
} from "../types/jobPosition.types";
import { StageStatus } from "../types/stage.types";
import { HiringProcessStatus } from "../types/hiringProcess.types";
import {
  getStatusColor,
  getStatusTranslationKey,
  type StatusDomain,
} from "../theme/statusPalette";

type StatusLabelProps = {
  status:
    | JobPositionStatus
    | StageStatus
    | HiringProcessStatus
    | JobModerationStatus;
  /** Chip size - use "small" inside tables and dense layouts */
  size?: ChipProps["size"];
  /**
   * Owning domain. Only needed for words whose meaning changes per domain —
   * today that is `CLOSED`, which is a *neutral* terminal state for a job
   * posting but a *successful* one for a hiring process. Omit it and you get
   * the canonical colour.
   */
  domain?: StatusDomain;
};

/**
 * StatusLabel - translated, colour-coded chip for lifecycle statuses.
 *
 * Colours come from `theme/statusPalette.ts`, the single source of truth shared
 * with `StatusChip`. This component previously carried its own switch, which is
 * why `CLOSED` was red here and green on the hiring-process lists.
 */
const StatusLabel: React.FC<StatusLabelProps> = ({ status, size, domain }) => {
  const { t } = useTranslation();

  return (
    <Chip
      label={t(getStatusTranslationKey(status))}
      color={getStatusColor(status, domain)}
      size={size}
      // Project rule: chips are always filled (notably inside tables).
      variant="filled"
      sx={{ fontWeight: 700 }}
      aria-label={`${t("aria.status")}: ${t(getStatusTranslationKey(status))}`}
    />
  );
};

export default StatusLabel;
