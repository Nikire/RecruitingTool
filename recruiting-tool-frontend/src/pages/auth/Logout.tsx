import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useLogout } from "../../hooks/api/useAuth";

const Logout: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const logout = useLogout();

  useEffect(() => {
    // Execute logout
    logout();
    // Redirect to home after a short delay
    const timer = setTimeout(() => {
      navigate("/");
    }, 1000);

    return () => clearTimeout(timer);
  }, [logout, navigate]);

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
