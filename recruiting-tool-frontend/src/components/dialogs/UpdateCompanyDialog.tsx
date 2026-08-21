import {
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import FormDialog from "./FormDialog";
import ErrorIcon from "@mui/icons-material/Error";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useUpdateCompany } from "../../hooks/api/useCompanies";
import { Company } from "../../types/company.types";
import { useEffect } from "react";
import { useValidationRules } from "../../utils/validation";
import FormErrorSummary from "../common/FormErrorSummary";

interface UpdateCompanyDialogProps {
  open: boolean;
  onClose: () => void;
  company: Company | null;
}

interface CompanyFormData {
  name: string;
  description?: string;
}

const UpdateCompanyDialog: React.FC<UpdateCompanyDialogProps> = ({
  open,
  onClose,
  company,
}) => {
  const { t } = useTranslation();
  const validationRules = useValidationRules();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<CompanyFormData>({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const { mutate: updateCompany, isPending, isError } = useUpdateCompany();

  // Update form values when company changes
  useEffect(() => {
    if (company) {
      reset({
        name: company.name,
        description: company.description || "",
      });
    }
  }, [company, reset]);

  const onSubmit = (data: CompanyFormData) => {
    if (!company) return;

    updateCompany(
      { uid: company.uid, data },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      },
    );
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <FormDialog
      open={open}
      onClose={handleClose}
      isDirty={isDirty}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{t("companies.update_title")}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <FormErrorSummary errors={errors} />

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label={t("companies.name_label")}
              fullWidth
              {...register(
                "name",
                validationRules.combine(
                  validationRules.required(t("companies.name_label")),
                  validationRules.minLength(2),
                  validationRules.maxLength(100),
                ),
              )}
              error={!!errors.name}
              helperText={errors.name?.message}
              InputProps={{
                endAdornment: errors.name ? (
                  <InputAdornment position="end">
                    <ErrorIcon color="error" />
                  </InputAdornment>
                ) : null,
              }}
            />

            <TextField
              label={t("companies.description_label")}
              multiline
              rows={3}
              fullWidth
              {...register("description", validationRules.maxLength(500))}
              error={!!errors.description}
              helperText={errors.description?.message}
              InputProps={{
                endAdornment: errors.description ? (
                  <InputAdornment position="end">
                    <ErrorIcon color="error" />
                  </InputAdornment>
                ) : null,
              }}
            />
          </Box>

          {isError && (
            <Typography color="error" sx={{ mt: 2 }}>
              {t("errors.update_failed", {
                entity: t("companies.title").toLowerCase(),
              })}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isPending}>
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isPending}
            startIcon={
              isPending ? (
                <CircularProgress size={20} color="inherit" />
              ) : undefined
            }
          >
            {isPending ? t("common.updating") : t("common.update")}
          </Button>
        </DialogActions>
      </form>
    </FormDialog>
  );
};

export default UpdateCompanyDialog;
