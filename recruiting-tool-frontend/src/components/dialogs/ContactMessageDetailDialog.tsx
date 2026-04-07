import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  Link,
  Stack,
  Paper,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import { ContactMessage } from "../../types/contact-message.types";
import { useMarkContactMessageAsRead } from "../../hooks/api/useContactMessages";

interface ContactMessageDetailDialogProps {
  open: boolean;
  onClose: () => void;
  message: ContactMessage | null;
}

const ContactMessageDetailDialog: React.FC<ContactMessageDetailDialogProps> = ({
  open,
  onClose,
  message,
}) => {
  const { t } = useTranslation();
  const { mutate: markAsRead, isPending: isMarkingAsRead } =
    useMarkContactMessageAsRead();

  if (!message) return null;

  const handleMarkAsRead = () => {
    markAsRead(message.uid, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  const formattedDate = (() => {
    try {
      return format(new Date(message.createdAt), "PPpp");
    } catch {
      return message.createdAt;
    }
  })();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
            {t("contact_messages.detail_title")}
          </Typography>
          <Chip
            label={
              message.isRead
                ? t("admin_contact.status_read")
                : t("admin_contact.status_unread")
            }
            size="small"
            color={message.isRead ? "default" : "primary"}
            variant={message.isRead ? "outlined" : "filled"}
            sx={{ fontSize: "0.75rem" }}
          />
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.5}>
          {/* Sender info */}
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {t("contact_messages.from")}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.25 }}>
              {message.name}
            </Typography>
            <Link
              href={`mailto:${message.email}`}
              variant="body2"
              underline="hover"
              sx={{ display: "inline-block" }}
            >
              {message.email}
            </Link>
          </Box>

          {/* Company (optional) */}
          {message.company && (
            <>
              <Divider />
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {t("contact_messages.company_label")}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.25 }}>
                  {message.company}
                </Typography>
              </Box>
            </>
          )}

          <Divider />

          {/* Date received */}
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {t("contact_messages.received")}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.25 }}>
              {formattedDate}
            </Typography>
          </Box>

          <Divider />

          {/* Message body */}
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {t("contact_messages.message_body")}
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                mt: 1,
                p: 2,
                bgcolor: "background.default",
                borderRadius: 2,
                maxHeight: 300,
                overflowY: "auto",
              }}
            >
              <Typography
                variant="body2"
                sx={{ whiteSpace: "pre-wrap", lineHeight: 1.75 }}
              >
                {message.message}
              </Typography>
            </Paper>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        {!message.isRead && (
          <Button
            variant="contained"
            startIcon={<MarkEmailReadIcon />}
            onClick={handleMarkAsRead}
            disabled={isMarkingAsRead}
          >
            {t("admin_contact.mark_as_read")}
          </Button>
        )}
        <Button variant="outlined" onClick={onClose}>
          {t("common.close")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContactMessageDetailDialog;
