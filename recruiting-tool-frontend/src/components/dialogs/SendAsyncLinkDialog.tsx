import { useState, useEffect } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useTranslation } from "react-i18next";
import { useSendAsyncInvitation } from "../../hooks/api/useAsyncStage";
import { AsyncStageTokenResponse } from "../../types/asyncStage.types";

interface SendAsyncLinkDialogProps {
  open: boolean;
  onClose: () => void;
  stageUid: string;
  hiringProcessUid: string;
  candidateName: string;
  stageName: string;
}

const SendAsyncLinkDialog: React.FC<SendAsyncLinkDialogProps> = ({
  open,
  onClose,
  stageUid,
  hiringProcessUid,
  candidateName,
  stageName,
}) => {
  const { t } = useTranslation();
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [sentToken, setSentToken] = useState<AsyncStageTokenResponse | null>(
    null,
  );
  const [copyTooltip, setCopyTooltip] = useState(false);

  const { mutate: sendInvitation, isPending, error } = useSendAsyncInvitation();

  // Reset state when dialog opens or closes
  useEffect(() => {
    if (!open) {
      setDeadline(null);
      setSentToken(null);
      setCopyTooltip(false);
    }
  }, [open]);

  const handleSend = () => {
    sendInvitation(
      {
        stageUid,
        hiringProcessUid,
        deadline: deadline ? deadline.toISOString() : undefined,
      },
      {
        onSuccess: (data) => {
          setSentToken(data);
        },
      },
    );
  };

  const handleCopy = () => {
    if (!sentToken?.submissionUrl) return;
    navigator.clipboard.writeText(sentToken.submissionUrl).then(() => {
      setCopyTooltip(true);
      setTimeout(() => setCopyTooltip(false), 2000);
    });
  };

  const handleClose = () => {
    setDeadline(null);
    setSentToken(null);
    setCopyTooltip(false);
    onClose();
  };

  const errorMessage =
    error instanceof Error ? error.message : t("errors.operation_failed");

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {t("asyncStage.sendLinkTitle")}
        {stageName && (
          <Typography
            component="span"
            variant="body2"
            color="text.secondary"
            sx={{ display: "block", mt: 0.5 }}
          >
            {stageName}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 3 }}>
          {!sentToken && (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label={t("asyncStage.deadline")}
                value={deadline}
                onChange={(newValue) => setDeadline(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    helperText: t("asyncStage.deadlineHint"),
                  },
                }}
              />
            </LocalizationProvider>
          )}

          {sentToken && (
            <Alert severity="success">
              {t("asyncStage.linkSentSuccess", { name: candidateName })}
            </Alert>
          )}

          {sentToken && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <TextField
                value={sentToken.submissionUrl}
                fullWidth
                size="small"
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip
                        title={
                          copyTooltip
                            ? t("asyncStage.linkCopied")
                            : t("asyncStage.copyLink")
                        }
                        open={copyTooltip || undefined}
                      >
                        <IconButton
                          onClick={handleCopy}
                          edge="end"
                          aria-label={t("asyncStage.copyLink")}
                          size="small"
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          )}

          {error && !sentToken && (
            <Alert severity="error">{errorMessage}</Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>{t("common.close")}</Button>
        {!sentToken && (
          <Button
            variant="contained"
            onClick={handleSend}
            disabled={isPending}
            startIcon={isPending ? <CircularProgress size={16} /> : undefined}
          >
            {isPending ? t("common.sending") : t("asyncStage.sendLink")}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SendAsyncLinkDialog;
