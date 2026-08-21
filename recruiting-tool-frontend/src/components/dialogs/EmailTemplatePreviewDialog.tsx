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

interface EmailTemplateRenderedPreviewProps {
  renderedSubject: string;
  renderedBody: string;
}

/**
 * Shared presentational preview of a rendered email template.
 *
 * The body is user-authored HTML, so it is rendered inside a sandboxed iframe
 * (`sandbox="allow-same-origin"` only - no `allow-scripts`, so no script in the
 * template can execute). This is the single implementation used both by the
 * standalone preview dialog (email templates table) and by the inline preview
 * of the create/edit template dialog, so both always look identical.
 */
export const EmailTemplateRenderedPreview: React.FC<
  EmailTemplateRenderedPreviewProps
> = ({ renderedSubject, renderedBody }) => {
  const { t } = useTranslation();

  return (
    <Box>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
          {t("email_templates.rendered_subject")}
        </Typography>
        <Typography variant="h6">{renderedSubject}</Typography>
      </Paper>

      <Divider sx={{ my: 2 }} />

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
          {t("email_templates.rendered_body")}
        </Typography>
        <Box
          sx={{
            backgroundColor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            minHeight: "200px",
            maxHeight: "400px",
            overflow: "auto",
          }}
        >
          <iframe
            srcDoc={renderedBody}
            title={t("email_templates.preview_title")}
            style={{
              width: "100%",
              minHeight: "200px",
              height: "400px",
              border: "none",
              /* iframe renders actual email HTML which requires a white background */
              backgroundColor: "white",
            }}
            sandbox="allow-same-origin"
          />
        </Box>
      </Paper>
    </Box>
  );
};

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
          <EmailTemplateRenderedPreview
            renderedSubject={data.renderedSubject}
            renderedBody={data.renderedBody}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("common.close")}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmailTemplatePreviewDialog;
