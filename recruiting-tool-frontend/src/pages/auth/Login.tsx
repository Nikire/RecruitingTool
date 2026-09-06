import { useForm } from "react-hook-form";
import {
  useNavigate,
  useLocation,
  useSearchParams,
  Link as RouterLink,
} from "react-router-dom";
import { Typography, TextField, Button, Divider, Link } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useLogin } from "../../hooks/api/useAuth";
import { getDefaultDashboard } from "../../utils/permissions";
import { AuthGroupWrapper, AuthPageWrapper, FormWrapper } from "./Auth.styles";
import SocialLoginButtons from "../../components/auth/SocialLoginButtons";

interface LoginFormData {
  email: string;
  password: string;
}

/**
 * Only same-origin relative paths are honoured after login, so a crafted
 * `returnUrl` (or router state) cannot bounce the user to another site.
 */
const isSafeInternalPath = (path?: string | null): path is string =>
  !!path && path.startsWith("/") && !path.startsWith("//");

const Login: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();
  const { mutate: login, isPending, isError } = useLogin();

  const onSubmit = (data: LoginFormData) => {
    login(data, {
      onSuccess: (response) => {
        // Return the user to the protected page that sent them here
        // (ProtectedRoute passes it as router state, emailed links may use a
        // ?returnUrl param); otherwise use the role's default dashboard.
        const fromState = (location.state as { from?: string } | null)?.from;
        const returnUrl = searchParams.get("returnUrl");
        const redirectTo = isSafeInternalPath(fromState)
          ? fromState
          : isSafeInternalPath(returnUrl)
            ? returnUrl
            : getDefaultDashboard(response.user);

        navigate(redirectTo, { replace: true });
      },
    });
  };

  return (
    <AuthPageWrapper>
      <AuthGroupWrapper>
        <Typography variant="h4">{t("auth.login_title")}</Typography>
        <Divider />

        {/* Social Login Buttons (only shown if Auth0 is configured) */}
        <SocialLoginButtons context="login" />

        <FormWrapper onSubmit={handleSubmit(onSubmit)}>
          <TextField
            label={t("auth.email")}
            size="small"
            fullWidth
            margin="none"
            error={!!errors.email}
            helperText={errors.email?.message}
            {...register("email", {
              required: t("validation.email_required"),
            })}
          />
          <TextField
            label={t("auth.password")}
            size="small"
            type="password"
            fullWidth
            margin="none"
            error={!!errors.password}
            helperText={errors.password?.message}
            {...register("password", {
              required: t("validation.password_required"),
            })}
          />
          <Link
            component={RouterLink}
            to="/forgot-password"
            underline="hover"
            variant="body2"
            sx={{ alignSelf: "flex-end" }}
          >
            {t("forgot_password.link_label")}
          </Link>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isPending}
          >
            {isPending ? t("auth.logging_in") : t("auth.login_title")}
          </Button>
          {isError && (
            <Typography color="error">{t("auth.login_failed")}</Typography>
          )}
        </FormWrapper>
        <Typography variant="body2" align="center">
          {t("auth.no_account")}{" "}
          <Link component={RouterLink} to="/register" underline="hover">
            {t("auth.sign_up_link")}
          </Link>
        </Typography>
      </AuthGroupWrapper>
    </AuthPageWrapper>
  );
};

export default Login;
