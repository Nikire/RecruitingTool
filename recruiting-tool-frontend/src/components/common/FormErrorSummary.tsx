import { Alert, AlertTitle, List, ListItem, ListItemText } from "@mui/material";
import { FieldErrors } from "react-hook-form";
import { useTranslation } from "react-i18next";

interface FormErrorSummaryProps {
  errors: FieldErrors;
  /** Optional title override */
  title?: string;
  /** Optional severity level */
  severity?: "error" | "warning";
}

/**
 * FormErrorSummary - Displays all form validation errors in a summary alert
 *
 * Features:
 * - Shows alert box with list of all validation errors
 * - Only visible when errors exist
 * - Fully i18n compliant
 * - Accessible (role="alert")
 * - Customizable title and severity
 *
 * @example
 * ```tsx
 * const { formState: { errors } } = useForm();
 *
 * return (
 *   <form>
 *     <FormErrorSummary errors={errors} />
 *     <TextField {...register('name')} />
 *   </form>
 * );
 * ```
 */
const FormErrorSummary: React.FC<FormErrorSummaryProps> = ({
  errors,
  title,
  severity = "error",
}) => {
  const { t } = useTranslation();

  // Get array of error messages
  const errorMessages = Object.entries(errors)
    .map(([field, error]) => {
      if (!error || typeof error !== "object") return null;

      // Handle nested field errors
      if ("message" in error && error.message) {
        return {
          field,
          message: error.message as string,
        };
      }
      return null;
    })
    .filter(
      (item): item is { field: string; message: string } => item !== null,
    );

  // Don't render if no errors
  if (errorMessages.length === 0) {
    return null;
  }

  return (
    <Alert severity={severity} role="alert" sx={{ mb: 2 }}>
      <AlertTitle>{title || t("validation.form_errors")}</AlertTitle>
      <List dense disablePadding>
        {errorMessages.map(({ field, message }, index) => (
          <ListItem key={`${field}-${index}`} disableGutters sx={{ py: 0.5 }}>
            <ListItemText
              primary={message}
              primaryTypographyProps={{
                variant: "body2",
                color: severity === "error" ? "error" : "warning.main",
              }}
            />
          </ListItem>
        ))}
      </List>
    </Alert>
  );
};

export default FormErrorSummary;
