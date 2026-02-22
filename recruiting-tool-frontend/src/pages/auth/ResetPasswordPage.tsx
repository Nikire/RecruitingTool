import { useEffect } from "react";
import {
  Link as RouterLink,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
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
import { useResetPassword } from "../../hooks/api/useAuth";

interface ResetPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

const ResetPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>();

  const {
    mutate: doReset,
    isPending,
    isSuccess,
    isError,
    error,
  } = useResetPassword();

  // Redirect to login 3 seconds after a successful reset
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        navigate("/login");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate]);

  const onSubmit = (data: ResetPasswordFormData) => {
    doReset({ token, newPassword: data.newPassword });
  };

  if (!token) {
    return (
      <AuthPageWrapper>
        <AuthGroupWrapper>
          <Typography variant="h4">{t("reset_password.title")}</Typography>
          <Divider />
          <Alert severity="error">{t("reset_password.missing_token")}</Alert>
          <Link component={RouterLink} to="/forgot-password" underline="hover">
            {t("reset_password.request_new_link")}
          </Link>
        </AuthGroupWrapper>
      </AuthPageWrapper>
    );
  }

  return (
    <AuthPageWrapper>
      <AuthGroupWrapper>
        <Typography variant="h4">{t("reset_password.title")}</Typography>
        <Divider />

        {isSuccess ? (
          <>
            <Alert severity="success">
              {t("reset_password.success_message")}
            </Alert>
            <Typography variant="body2" color="text.secondary">
              {t("reset_password.redirect_message")}
            </Typography>
            <Link component={RouterLink} to="/login" underline="hover">
              {t("reset_password.go_to_login")}
            </Link>
          </>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary">
              {t("reset_password.description")}
            </Typography>

            {isError && (
              <Alert severity="error">
                {(error as { response?: { data?: { message?: string } } })
                  ?.response?.data?.message ||
                  t("reset_password.error_message")}
              </Alert>
            )}

            <FormWrapper onSubmit={handleSubmit(onSubmit)}>
              <TextField
                label={t("reset_password.new_password")}
                size="small"
                fullWidth
                type="password"
                margin="none"
                error={!!errors.newPassword}
                helperText={errors.newPassword?.message}
                {...register("newPassword", {
                  required: t("reset_password.password_required"),
                  minLength: {
                    value: 8,
                    message: t("reset_password.password_min_length"),
                  },
                })}
              />
              <TextField
                label={t("reset_password.confirm_password")}
                size="small"
                fullWidth
                type="password"
                margin="none"
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                {...register("confirmPassword", {
                  required: t("reset_password.confirm_password_required"),
                  validate: (value) =>
                    value === watch("newPassword") ||
                    t("reset_password.passwords_must_match"),
                })}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isPending}
              >
                {isPending
                  ? t("reset_password.resetting")
                  : t("reset_password.reset_button")}
              </Button>
            </FormWrapper>

            <Link component={RouterLink} to="/login" underline="hover">
              {t("reset_password.back_to_login")}
            </Link>
          </>
        )}
      </AuthGroupWrapper>
    </AuthPageWrapper>
  );
};

export default ResetPasswordPage;
