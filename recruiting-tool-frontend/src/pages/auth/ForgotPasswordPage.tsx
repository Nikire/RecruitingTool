import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Typography,
  TextField,
  Button,
  Divider,
  Link,
  Alert,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { AuthGroupWrapper, AuthPageWrapper, FormWrapper } from "./Auth.styles";
import { useForgotPassword } from "../../hooks/api/useAuth";

interface ForgotPasswordFormData {
  email: string;
}

const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [failed, setFailed] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>();
  const { mutate: requestReset, isPending } = useForgotPassword();

  const onSubmit = (data: ForgotPasswordFormData) => {
    setFailed(false);
    requestReset(data, {
      onSuccess: () => {
        setSubmitted(true);
      },
      onError: () => {
        // The backend already returns a generic 200 for unknown emails, so an
        // error here is a real failure (network, rate limit, 5xx). Show a
        // generic message that does not reveal whether the email exists.
        setFailed(true);
      },
    });
  };

  return (
    <AuthPageWrapper>
      <AuthGroupWrapper>
        <Typography variant="h4">{t("forgot_password.title")}</Typography>
        <Divider />

        {submitted ? (
          <>
            <Alert severity="success">
              {t("forgot_password.success_message")}
            </Alert>
            <Link component={RouterLink} to="/login" underline="hover">
              {t("forgot_password.back_to_login")}
            </Link>
          </>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary">
              {t("forgot_password.description")}
            </Typography>
            {failed && (
              <Alert severity="error">
                {t("forgot_password.error_message")}
              </Alert>
            )}
            <FormWrapper onSubmit={handleSubmit(onSubmit)}>
              <TextField
                label={t("auth.email")}
                size="small"
                fullWidth
                type="email"
                margin="none"
                error={!!errors.email}
                helperText={errors.email?.message}
                {...register("email", {
                  required: t("validation.email_required"),
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: t("validation.email_invalid"),
                  },
                })}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isPending}
              >
                {isPending
                  ? t("forgot_password.sending")
                  : t("forgot_password.send_link")}
              </Button>
            </FormWrapper>
            <Link component={RouterLink} to="/login" underline="hover">
              {t("forgot_password.back_to_login")}
            </Link>
          </>
        )}
      </AuthGroupWrapper>
    </AuthPageWrapper>
  );
};

export default ForgotPasswordPage;
