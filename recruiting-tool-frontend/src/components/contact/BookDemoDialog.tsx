import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useRequestDemo } from "../../hooks/api/useDemoBooking";
import { useValidationRules } from "../../utils/validation";

interface BookDemoDialogProps {
  open: boolean;
  onClose: () => void;
}

interface BookDemoFormData {
  email: string;
  name?: string;
  company?: string;
}

const BookDemoDialog: React.FC<BookDemoDialogProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const validationRules = useValidationRules();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BookDemoFormData>();

  const { mutate: requestDemo, isPending } = useRequestDemo();

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: BookDemoFormData) => {
    requestDemo(
      {
        email: data.email,
        name: data.name?.trim() || undefined,
        company: data.company?.trim() || undefined,
      },
      {
        onSuccess: (response) => {
          reset();
          onClose();
          navigate(`/book-demo/${response.token}`);
        },
        onError: () => {
          toast.error(t("contact.book_demo_dialog_error"));
        },
      },
    );
  };

  return (
    <Dialog
      open={open}
      onClose={isPending ? undefined : handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <CalendarMonthIcon color="primary" />
          <Typography variant="h6" fontWeight={700}>
            {t("contact.book_demo_dialog_title")}
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          size="small"
          disabled={isPending}
          aria-label={t("common.close")}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {t("contact.book_demo_dialog_description")}
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <TextField
              label={t("contact.book_demo_dialog_email_label")}
              type="email"
              fullWidth
              required
              autoFocus
              {...register("email", validationRules.email())}
              error={!!errors.email}
              helperText={errors.email?.message}
            />

            <TextField
              label={t("contact.book_demo_dialog_name_label")}
              fullWidth
              {...register("name", validationRules.maxLength(100))}
              error={!!errors.name}
              helperText={errors.name?.message}
            />

            <TextField
              label={t("contact.book_demo_dialog_company_label")}
              fullWidth
              {...register("company", validationRules.maxLength(200))}
              error={!!errors.company}
              helperText={errors.company?.message}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} disabled={isPending}>
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isPending}
            startIcon={
              isPending ? (
                <CircularProgress size={16} color="inherit" />
              ) : undefined
            }
          >
            {isPending
              ? t("common.loading")
              : t("contact.book_demo_dialog_submit")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default BookDemoDialog;
