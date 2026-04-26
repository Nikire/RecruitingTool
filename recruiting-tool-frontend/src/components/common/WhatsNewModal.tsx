import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Divider,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { atom, useAtom } from "jotai";
import {
  useUnreadReleaseNotes,
  useMarkReleaseNoteSeen,
} from "../../api/releaseNotes";

/**
 * Session atom - tracks whether the "What's New" check has been done
 * this session, so we don't repeatedly show the modal on every navigation.
 */
const whatsNewCheckedAtom = atom<boolean>(false);

const tierColor = (tier: string): "default" | "primary" | "secondary" => {
  if (tier === "professional") return "primary";
  if (tier === "enterprise") return "secondary";
  return "default";
};

const tierLabel = (tier: string, t: (key: string) => string): string => {
  if (tier === "professional") return t("changelog.professional_plus");
  if (tier === "enterprise") return t("changelog.enterprise_only");
  return t("changelog.all_tiers");
};

const WhatsNewModal: React.FC = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [hasChecked, setHasChecked] = useAtom(whatsNewCheckedAtom);

  const { data, isSuccess } = useUnreadReleaseNotes();
  const { mutateAsync: markSeen } = useMarkReleaseNoteSeen();

  useEffect(() => {
    if (!hasChecked && isSuccess && data && data.notes.length > 0) {
      setOpen(true);
      setHasChecked(true);
    } else if (!hasChecked && isSuccess) {
      // No unread notes — mark as checked so we don't re-run
      setHasChecked(true);
    }
  }, [hasChecked, isSuccess, data, setHasChecked]);

  const handleClose = async () => {
    if (data?.notes) {
      await Promise.allSettled(data.notes.map((note) => markSeen(note.uid)));
    }
    setOpen(false);
  };

  if (!open || !data?.notes?.length) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="whats-new-dialog-title"
    >
      <DialogTitle id="whats-new-dialog-title">
        <Typography variant="h5" fontWeight={700}>
          {t("whats_new.title")} 🎉
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {t("whats_new.new_features")}
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {data.notes.map((note, index) => (
          <Box key={note.uid}>
            {index > 0 && <Divider />}
            <Box sx={{ px: 3, py: 2.5 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1,
                  mb: 1,
                }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  sx={{ flex: 1 }}
                >
                  {note.title}
                </Typography>
                <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
                  {note.version && (
                    <Chip
                      label={`v${note.version}`}
                      size="small"
                      variant="filled"
                      color="default"
                      sx={{ fontWeight: 600, fontSize: "0.7rem" }}
                    />
                  )}
                  {note.targetTier !== "all" && (
                    <Chip
                      label={tierLabel(note.targetTier, t)}
                      size="small"
                      variant="filled"
                      color={tierColor(note.targetTier)}
                      sx={{ fontSize: "0.7rem" }}
                    />
                  )}
                </Box>
              </Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}
              >
                {note.body}
              </Typography>
            </Box>
          </Box>
        ))}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          variant="contained"
          onClick={handleClose}
          size="large"
          sx={{ minWidth: 120 }}
        >
          {t("whats_new.got_it")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WhatsNewModal;
