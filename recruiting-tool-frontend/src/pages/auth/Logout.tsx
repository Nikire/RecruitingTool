import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useAuth0 } from "@auth0/auth0-react";
import { useLogout } from "../../hooks/api/useAuth";
import { useAuth0Configured } from "../../providers/Auth0ProviderWithNavigate";

const Logout: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const logout = useLogout();
  const isAuth0Configured = useAuth0Configured();
  const { logout: auth0Logout, isAuthenticated: isAuth0Authenticated } =
    useAuth0();

  useEffect(() => {
    // Clear local tokens and state
    logout();

    // Also logout from Auth0 if the user authenticated via social login
    if (isAuth0Configured && isAuth0Authenticated) {
      auth0Logout({
        logoutParams: { returnTo: `${window.location.origin}/login` },
      });
      return; // Auth0 logout will redirect the page
    }

    // Redirect to home after a short delay
    const timer = setTimeout(() => {
      navigate("/");
    }, 1000);

    return () => clearTimeout(timer);
  }, [logout, navigate, isAuth0Configured, isAuth0Authenticated, auth0Logout]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "50vh",
        gap: 2,
      }}
    >
      <CircularProgress />
      <Typography variant="h6">{t("auth.logging_out")}</Typography>
    </Box>
  );
};

export default Logout;
