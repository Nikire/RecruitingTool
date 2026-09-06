import { useEffect } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import {
  Typography,
  Button,
  Divider,
  Link,
  Alert,
  CircularProgress,
  Box,
} from "@mui/material";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useTranslation } from "react-i18next";
import { AuthGroupWrapper, AuthPageWrapper } from "./Auth.styles";
import { useAuthMe, useVerifyEmail } from "../../hooks/api/useAuth";
import { getDefaultDashboard } from "../../utils/permissions";

const VerifyEmailPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { isAuthenticated, user } = useAuthMe();

  const { mutate: doVerify, isPending, isSuccess, isError } = useVerifyEmail();

  // Trigger verification on mount if token is present
  useEffect(() => {
    if (token) {
      doVerify(token);
    }
  }, [token, doVerify]);

  if (!token) {
    return (
      <AuthPageWrapper>
        <AuthGroupWrapper>
          <Typography variant="h4">
            {t("email_verification.verify_title")}
          </Typography>
          <Divider />
          <Alert severity="error">
            {t("email_verification.missing_token")}
          </Alert>
          <Link component={RouterLink} to="/login" underline="hover">
            {t("email_verification.go_to_login")}
          </Link>
        </AuthGroupWrapper>
      </AuthPageWrapper>
    );
  }

  return (
    <AuthPageWrapper>
      <AuthGroupWrapper>
        <Typography variant="h4">
          {t("email_verification.verify_title")}
        </Typography>
        <Divider />

        {isPending && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              {t("email_verification.verifying")}
            </Typography>
          </Box>
        )}

        {isSuccess && (
          <>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <MarkEmailReadIcon sx={{ fontSize: 64, color: "success.main" }} />
            </Box>
            <Alert severity="success">
              {t("email_verification.success_message")}
            </Alert>
            <Button
              component={RouterLink}
              to={isAuthenticated ? getDefaultDashboard(user) : "/login"}
              variant="contained"
              fullWidth
            >
              {isAuthenticated
                ? t("email_verification.go_to_dashboard")
                : t("email_verification.go_to_login")}
            </Button>
          </>
        )}

        {isError && (
          <>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <ErrorOutlineIcon sx={{ fontSize: 64, color: "error.main" }} />
            </Box>
            <Alert severity="error">
              {t("email_verification.error_message")}
            </Alert>
            <Link component={RouterLink} to="/login" underline="hover">
              {t("email_verification.go_to_login")}
            </Link>
          </>
        )}
      </AuthGroupWrapper>
    </AuthPageWrapper>
  );
};

export default VerifyEmailPage;
