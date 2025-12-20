import { Box, Typography } from "@mui/material";
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUserAtom } from "../../hooks/api/state/useUserAtom";
import { UnifiedStatCard } from "../../components/common";

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useUserAtom();
  const navigate = useNavigate();

  const stats = [
    {
      title: t("admin_dashboard.candidate_management"),
      icon: <PeopleIcon />,
      color: "#1976d2",
      description: t("admin_dashboard.candidate_management_desc"),
      path: "/admin/candidates",
    },
    {
      title: t("admin_dashboard.company_management"),
      icon: <BusinessIcon />,
      color: "#2e7d32",
      description: t("admin_dashboard.company_management_desc"),
      path: "/admin/companies",
    },
    {
      title: t("admin_dashboard.user_management"),
      icon: <AssignmentIcon />,
      color: "#ed6c02",
      description: t("admin_dashboard.user_management_desc"),
      path: "/admin/users",
    },
    {
      title: t("admin_dashboard.job_positions"),
      icon: <WorkIcon />,
      color: "#9c27b0",
      description: t("admin_dashboard.job_positions_desc"),
      path: "/careers",
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        py: { xs: 4, sm: 6 },
      }}
    >
      {/* Header Section - Enhanced with better typography */}
      <Box
        sx={{
          mb: { xs: 4, sm: 5 },
          textAlign: "center",
          maxWidth: 800,
          px: { xs: 2, sm: 0 },
        }}
      >
        <Typography
          variant="h3"
          gutterBottom
          sx={{
            fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
            fontWeight: 600,
            color: "text.primary",
            mb: 2,
          }}
        >
          {t("admin_dashboard.title")}
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            fontSize: { xs: "0.95rem", sm: "1rem" },
            lineHeight: 1.7,
          }}
        >
          {t("admin_dashboard.welcome", { name: user?.name })}
        </Typography>
      </Box>

      {/* Navigation Cards Grid - Enhanced with better spacing and responsive layout */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
          },
          gap: { xs: 2.5, sm: 3 },
          width: "100%",
          maxWidth: {
            xs: "100%",
            sm: "calc(300px * 2 + 24px)",
          },
          px: { xs: 2, sm: 0 },
        }}
      >
        {stats.map((stat) => (
          <Box
            key={stat.title}
            sx={{
              minHeight: 140,
            }}
          >
            <UnifiedStatCard
              title={stat.title}
              icon={stat.icon}
              color={stat.color}
              subtitle={stat.description}
              onClick={() => navigate(stat.path)}
              variant="navigation"
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default AdminDashboard;
