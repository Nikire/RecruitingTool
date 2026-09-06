import {
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
} from "@mui/icons-material";
import { Box, IconButton, Tooltip, useTheme } from "@mui/material";
import { useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";
import { useAuthMe } from "../hooks/api/useAuth";
import { getDefaultDashboard } from "../utils/permissions";
import { themeModeAtom } from "../store/preferences.atoms";
import LanguageSelector from "../components/common/LanguageSelector";

// Auth pages that a signed-in user must still be able to use: the registration
// wizard navigates to onboarding itself once /auth/me resolves, the email
// verification and password reset links are opened while logged in, and
// /logout must never be pre-empted. Bouncing away from these would cancel the
// flow the user is in the middle of.
const REDIRECT_EXCLUDED_PATHS = [
  "/register",
  "/verify-email",
  "/reset-password",
  "/logout",
];

const AuthLayout = () => {
  const { t } = useTranslation();
  const { user } = useAuthMe();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [themeMode, setThemeMode] = useAtom(themeModeAtom);

  const handleThemeToggle = () => {
    setThemeMode(themeMode === "dark" ? "light" : "dark");
  };

  const isRedirectExcluded = REDIRECT_EXCLUDED_PATHS.some((path) =>
    location.pathname.startsWith(path),
  );

  // Already signed-in users opening /login or /forgot-password go to their own
  // dashboard (not the marketing landing page).
  useEffect(() => {
    if (isRedirectExcluded) return;
    const token = localStorage.getItem("authToken");
    if (token && user) {
      navigate(getDefaultDashboard(user), { replace: true });
    }
  }, [user, navigate, isRedirectExcluded]);

  return (
    <Box
      sx={{
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Minimal top bar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 3,
          py: 1,
          borderBottom: 1,
          borderColor: "divider",
          flexShrink: 0,
        }}
      >
        <Box
          component={NavLink}
          to="/"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            textDecoration: "none",
            color: "text.primary",
            flexGrow: 1,
            "&:hover": { opacity: 0.8 },
          }}
        >
          <Box
            component="img"
            src={
              theme.palette.mode === "dark"
                ? "/borderless-logo-light.png"
                : "/borderless-logo-dark.png"
            }
            alt="Borderless ATS"
            sx={{ height: 28, width: "auto" }}
          />
        </Box>
        <Tooltip
          title={
            themeMode === "dark"
              ? t("theme.switch_to_light")
              : t("theme.switch_to_dark")
          }
        >
          <IconButton
            color="inherit"
            onClick={handleThemeToggle}
            aria-label={
              themeMode === "dark"
                ? t("aria.switch_to_light_mode")
                : t("aria.switch_to_dark_mode")
            }
          >
            {themeMode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>
        <LanguageSelector />
      </Box>

      {/* Full remaining height for auth content; scrolls when a page (e.g. the
          registration wizard) is taller than the viewport */}
      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default AuthLayout;
