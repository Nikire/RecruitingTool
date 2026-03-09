import {
  Box,
  Button,
  Divider,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useAuth0 } from "@auth0/auth0-react";
import GoogleIcon from "@mui/icons-material/Google";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import { useAuth0Configured } from "../../providers/Auth0ProviderWithNavigate";

interface SocialLoginButtonsProps {
  /**
   * Context for Auth0 authentication
   * - 'login': User is logging in (show "Continue with Google/GitHub")
   * - 'signup': User is signing up (show "Sign up with Google/GitHub")
   */
  context?: "login" | "signup";
}

/**
 * Social Login Buttons Component
 *
 * Displays Google and GitHub login buttons using Auth0 Universal Login.
 * Only renders if Auth0 is configured via environment variables.
 *
 * Features:
 * - Google OAuth login
 * - GitHub OAuth login
 * - Loading states during redirect
 * - Divider with "or" text
 * - i18n compliant
 * - Responsive design
 *
 * Usage:
 * ```tsx
 * <SocialLoginButtons context="login" />
 * ```
 */
const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({
  context = "login",
}) => {
  const { t } = useTranslation();
  const { loginWithRedirect, isLoading } = useAuth0();
  const isAuth0Configured = useAuth0Configured();

  // Don't render if Auth0 is not configured
  if (!isAuth0Configured) {
    return null;
  }

  const handleGoogleLogin = () => {
    sessionStorage.setItem("auth0_login_pending", "true");
    loginWithRedirect({
      authorizationParams: {
        connection: "google-oauth2",
      },
    });
  };

  const handleLinkedInLogin = () => {
    sessionStorage.setItem("auth0_login_pending", "true");
    loginWithRedirect({
      authorizationParams: {
        connection: "linkedin",
      },
    });
  };

  const translationKey = context === "signup" ? "signup" : "login";

  return (
    <Box sx={{ width: "100%" }}>
      {/* Social Login Buttons */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          mb: 3,
        }}
      >
        {/* Google Login Button */}
        <Button
          variant="outlined"
          fullWidth
          onClick={handleGoogleLogin}
          disabled={isLoading}
          startIcon={
            isLoading ? <CircularProgress size={20} /> : <GoogleIcon />
          }
          sx={{
            textTransform: "none",
            borderColor: "divider",
            color: "text.primary",
            "&:hover": {
              borderColor: "primary.main",
              backgroundColor: "action.hover",
            },
          }}
        >
          {isLoading
            ? t("auth.social.redirecting")
            : t(`auth.social.${translationKey}_with_google`)}
        </Button>

        {/* LinkedIn Login Button */}
        <Button
          variant="outlined"
          fullWidth
          onClick={handleLinkedInLogin}
          disabled={isLoading}
          startIcon={
            isLoading ? <CircularProgress size={20} /> : <LinkedInIcon />
          }
          sx={{
            textTransform: "none",
            borderColor: "divider",
            color: "text.primary",
            "&:hover": {
              borderColor: "primary.main",
              backgroundColor: "action.hover",
            },
          }}
        >
          {isLoading
            ? t("auth.social.redirecting")
            : t(`auth.social.${translationKey}_with_linkedin`)}
        </Button>
      </Box>

      {/* Divider with "or" text */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Divider sx={{ flexGrow: 1 }} />
        <Typography variant="body2" color="text.secondary" sx={{ mx: 2 }}>
          {t("auth.social.or")}
        </Typography>
        <Divider sx={{ flexGrow: 1 }} />
      </Box>
    </Box>
  );
};

export default SocialLoginButtons;
