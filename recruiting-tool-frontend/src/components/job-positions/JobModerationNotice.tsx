import { Alert, AlertTitle, Box, Link, Typography } from "@mui/material";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import BlockIcon from "@mui/icons-material/Block";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import { JobModerationStatus } from "../../types/jobPosition.types";
import { useSubscription } from "../../api/subscription";
import { hasActivePaidSubscription } from "../../utils/subscriptionStatus";

export interface JobModerationNoticeProps {
  /** Moderation state of the posting (undefined on legacy/public payloads) */
  moderationStatus?: JobModerationStatus;
  /** Reason supplied by the administrator when the posting was rejected */
  moderationReason?: string | null;
  /** Rendered when the notice covers several postings at once (list pages) */
  count?: number;
  /** Extra spacing, matching the page it is dropped into */
  sx?: object;
}

/**
 * Explains to an HR user why their posting is not on the public careers board
 * yet, and - for companies without an active paid subscription - points at the
 * upgrade that removes the wait.
 *
 * Renders nothing for approved postings, so it is safe to mount unconditionally.
 */
const JobModerationNotice: React.FC<JobModerationNoticeProps> = ({
  moderationStatus,
  moderationReason,
  count,
  sx,
}) => {
  const { t } = useTranslation();
  const { data: subscription } = useSubscription();

  if (
    !moderationStatus ||
    moderationStatus === "APPROVED" ||
    (typeof count === "number" && count === 0)
  ) {
    return null;
  }

  const isPending = moderationStatus === "PENDING_APPROVAL";
  const showUpgradePrompt =
    isPending && !hasActivePaidSubscription(subscription);

  return (
    <Alert
      severity={isPending ? "info" : "warning"}
      variant="outlined"
      icon={isPending ? <HourglassEmptyIcon /> : <BlockIcon />}
      sx={{ mb: 3, ...sx }}
    >
      <AlertTitle>
        {isPending
          ? t("job_moderation.notice_pending_title")
          : t("job_moderation.notice_rejected_title")}
      </AlertTitle>

      <Typography variant="body2">
        {isPending
          ? typeof count === "number"
            ? t("job_moderation.notice_pending_body_count", { total: count })
            : t("job_moderation.notice_pending_body")
          : t("job_moderation.notice_rejected_body")}
      </Typography>

      {!isPending && moderationReason && (
        <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
          {t("job_moderation.notice_rejected_reason", {
            reason: moderationReason,
          })}
        </Typography>
      )}

      {showUpgradePrompt && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {t("job_moderation.notice_upgrade_prompt")}{" "}
            <Link
              component={RouterLink}
              to="/profile/subscription"
              underline="hover"
              fontWeight={600}
            >
              {t("job_moderation.notice_upgrade_link")}
            </Link>
          </Typography>
        </Box>
      )}
    </Alert>
  );
};

export default JobModerationNotice;
