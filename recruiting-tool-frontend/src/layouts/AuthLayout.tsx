import { WorkOutline as WorkIcon } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthMe } from "../hooks/api/useAuth";

const AuthLayout = () => {
  const { t } = useTranslation();
  const { user } = useAuthMe();
  const navigate = useNavigate();

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
        component={NavLink}
        to="/"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 3,
          py: 1.5,
          textDecoration: "none",
          color: "text.primary",
          borderBottom: 1,
          borderColor: "divider",
          flexShrink: 0,
          "&:hover": { opacity: 0.8 },
        }}
      >
        <WorkIcon sx={{ fontSize: 28, color: "primary.main" }} />
        <Typography variant="h6" fontWeight={700} letterSpacing={0.5}>
          {t("navbar.app_title")}
        </Typography>
      </Box>

      {/* Full remaining height for auth content */}
      <Box sx={{ flex: 1, overflow: "hidden" }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default AuthLayout;
