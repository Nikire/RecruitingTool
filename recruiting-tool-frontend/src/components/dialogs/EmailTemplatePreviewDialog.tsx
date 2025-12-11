import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Paper,
  Divider,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { usePreviewEmailTemplate } from "../../hooks/api/useEmailTemplates";
import { useEffect } from "react";

interface EmailTemplatePreviewDialogProps {
  open: boolean;
  onClose: () => void;
  templateUid: string | null;
}

const EmailTemplatePreviewDialog: React.FC<EmailTemplatePreviewDialogProps> = ({
  open,
  onClose,
  templateUid,
}) => {
  const { t } = useTranslation();
  const {
    mutate: previewTemplate,
    isPending,
    data,
  } = usePreviewEmailTemplate();

  useEffect(() => {
    if (open && templateUid) {
      // Trigger preview with sample data
      previewTemplate({ uid: templateUid });
    }
  }, [open, templateUid, previewTemplate]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="preview-dialog-title"
    >
      <DialogTitle id="preview-dialog-title">
        {t("email_templates.preview_title")}
      </DialogTitle>
      <DialogContent>
        {isPending && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!isPending && data && (
          <Box>
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography
                variant="subtitle2"
                color="textSecondary"
                gutterBottom
              >
                {t("email_templates.rendered_subject")}
              </Typography>
              <Typography variant="h6">{data.renderedSubject}</Typography>
            </Paper>

            <Divider sx={{ my: 2 }} />

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography
                variant="subtitle2"
                color="textSecondary"
                gutterBottom
              >
                {t("email_templates.rendered_body")}
              </Typography>
              <Typography
                variant="body1"
                component="div"
                sx={{
                  whiteSpace: "pre-wrap",
                  fontFamily: "monospace",
                  backgroundColor: "grey.50",
                  p: 2,
                  borderRadius: 1,
                  maxHeight: "400px",
                  overflow: "auto",
                }}
              >
                {data.renderedBody}
              </Typography>
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

export default EmailTemplatePreviewDialog;
