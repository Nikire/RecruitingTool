import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BlockIcon from "@mui/icons-material/Block";
import { useTranslation } from "react-i18next";
import StatusLabel from "../StatusLabel";
import { MetadataDisplay } from "../common";
import { ModerationJobPositionItem } from "../../types/jobPosition.types";
import {
  useApproveJobPosition,
  useRejectJobPosition,
} from "../../hooks/api/useJobPositions";
import { formatDateTime } from "../../utils/dateFormatters";

const MIN_REASON_LENGTH = 3;
const MAX_REASON_LENGTH = 500;

export interface JobModerationReviewDialogProps {
  open: boolean;
  onClose: () => void;
  item: ModerationJobPositionItem | null;
}

/**
 * SUPER_ADMIN review of a single job posting.
 *
 * Shows enough context to judge whether the posting is genuine (company, plan,
 * creator, full description) and exposes the two moderation decisions.
 * Rejecting requires a reason - it is sent to the company verbatim.
 */
const JobModerationReviewDialog: React.FC<JobModerationReviewDialogProps> = ({
  open,
  onClose,
  item,
}) => {
  const { t, i18n } = useTranslation();
  const [isRejecting, setIsRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [reasonTouched, setReasonTouched] = useState(false);

  const approveMutation = useApproveJobPosition();
  const rejectMutation = useRejectJobPosition();
  const isPending = approveMutation.isPending || rejectMutation.isPending;

  const itemUid = item?.uid;

  // Reset the local decision state every time a new posting is opened
  useEffect(() => {
    if (open) {
      setIsRejecting(false);
      setReason("");
      setReasonTouched(false);
    }
  }, [open, itemUid]);

  if (!item) {
    return null;
  }

  const trimmedReason = reason.trim();
  const reasonError =
    trimmedReason.length > 0 && trimmedReason.length < MIN_REASON_LENGTH
      ? t("job_moderation.reason_too_short", { min: MIN_REASON_LENGTH })
      : reasonTouched && trimmedReason.length === 0
        ? t("job_moderation.reason_required")
        : undefined;
  const canSubmitRejection = trimmedReason.length >= MIN_REASON_LENGTH;

  const handleApprove = () => {
    approveMutation.mutate({ uid: item.uid }, { onSuccess: onClose });
  };

  const handleReject = () => {
    setReasonTouched(true);
    if (!canSubmitRejection) return;
    rejectMutation.mutate(
      { uid: item.uid, reason: trimmedReason },
      { onSuccess: onClose },
    );
  };

  const metaChips = [
    item.jobType
      ? t(`job_position_card.job_type_${item.jobType.toLowerCase()}`)
      : null,
    item.workLocation
      ? t(`job_position_card.work_location_${item.workLocation.toLowerCase()}`)
      : null,
    item.experienceLevel
      ? t(`job_position_card.exp_${item.experienceLevel.toLowerCase()}`)
      : null,
    [item.city, item.country].filter(Boolean).join(", ") || null,
  ].filter((label): label is string => !!label);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
        >
          <Typography variant="h6" component="span" sx={{ flexGrow: 1 }}>
            {item.title}
          </Typography>
          <StatusLabel status={item.moderationStatus} size="small" />
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {/* Company identity */}
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Avatar
            src={item.companyLogoUrl ?? undefined}
            alt={t("common.company_logo_alt")}
            variant="rounded"
          >
            {item.companyName.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              {item.companyName}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
              <Chip
                size="small"
                variant="filled"
                label={item.companyPlan}
                color={
                  item.companyHasActiveSubscription ? "primary" : "default"
                }
              />
              <Chip
                size="small"
                variant="filled"
                color={
                  item.companyHasActiveSubscription ? "success" : "warning"
                }
                label={
                  item.companyHasActiveSubscription
                    ? t("job_moderation.company_paid")
                    : t("job_moderation.company_unpaid")
                }
              />
            </Stack>
          </Box>
        </Stack>

        <MetadataDisplay
          items={[
            {
              label: "job_moderation.created_by",
              value: item.createdByName,
              subValue: item.createdByEmail ?? undefined,
            },
            {
              label: "job_moderation.submitted_at",
              value: formatDateTime(item.createdAt, i18n.language),
            },
            ...(item.moderatedAt
              ? [
                  {
                    label: "job_moderation.moderated_at",
                    value: formatDateTime(item.moderatedAt, i18n.language),
                    subValue: item.moderatedByName ?? undefined,
                  },
                ]
              : []),
            {
              label: "job_moderation.lifecycle_status",
              value: t(`status.${item.status.toLowerCase()}`),
            },
          ]}
          translate
        />

        {metaChips.length > 0 && (
          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            useFlexGap
            sx={{ mt: 2 }}
          >
            {metaChips.map((label) => (
              <Chip key={label} label={label} size="small" variant="filled" />
            ))}
          </Stack>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>
          {t("job_moderation.description_label")}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ whiteSpace: "pre-wrap" }}
        >
          {item.description?.trim()
            ? item.description
            : t("job_moderation.no_description")}
        </Typography>

        {item.moderationReason && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              {t("job_moderation.previous_reason_label")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {item.moderationReason}
            </Typography>
          </>
        )}

        {isRejecting && (
          <>
            <Divider sx={{ my: 2 }} />
            <TextField
              label={t("job_moderation.reason_label")}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              onBlur={() => setReasonTouched(true)}
              error={!!reasonError}
              helperText={reasonError ?? t("job_moderation.reason_helper")}
              slotProps={{ htmlInput: { maxLength: MAX_REASON_LENGTH } }}
              multiline
              rows={3}
              fullWidth
              autoFocus
              required
            />
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={isPending}>
          {t("common.cancel")}
        </Button>

        {isRejecting ? (
          <>
            <Button
              onClick={() => setIsRejecting(false)}
              color="inherit"
              disabled={isPending}
            >
              {t("common.back")}
            </Button>
            <Button
              onClick={handleReject}
              variant="contained"
              color="error"
              startIcon={<BlockIcon />}
              disabled={isPending || !canSubmitRejection}
            >
              {rejectMutation.isPending
                ? t("job_moderation.rejecting")
                : t("job_moderation.confirm_reject")}
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={() => setIsRejecting(true)}
              variant="outlined"
              color="error"
              startIcon={<BlockIcon />}
              disabled={isPending || item.moderationStatus === "REJECTED"}
            >
              {t("job_moderation.reject")}
            </Button>
            <Button
              onClick={handleApprove}
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              disabled={isPending || item.moderationStatus === "APPROVED"}
            >
              {approveMutation.isPending
                ? t("common.approving")
                : t("common.approve")}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default JobModerationReviewDialog;
