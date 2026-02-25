import {
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
} from "@mui/icons-material";
import { Box, IconButton, Tooltip, useTheme } from "@mui/material";
import { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";
import { useAuthMe } from "../hooks/api/useAuth";
import { themeModeAtom } from "../store/preferences.atoms";
import LanguageSelector from "../components/common/LanguageSelector";

const AuthLayout = () => {
  const { t } = useTranslation();
  const { user } = useAuthMe();
  const navigate = useNavigate();
  const theme = useTheme();
  const [themeMode, setThemeMode] = useAtom(themeModeAtom);

  const handleThemeToggle = () => {
    setThemeMode(themeMode === "dark" ? "light" : "dark");
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token && user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

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
            alt="Borderless"
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

      {/* Full remaining height for auth content */}
      <Box sx={{ flex: 1, overflow: "hidden" }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default AuthLayout;
