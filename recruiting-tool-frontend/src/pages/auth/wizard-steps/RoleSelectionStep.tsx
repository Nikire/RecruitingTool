import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Grid,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import WorkIcon from "@mui/icons-material/Work";
import BusinessIcon from "@mui/icons-material/Business";
import { UserRole } from "../RegistrationWizard";

interface RoleSelectionStepProps {
  selectedRole: UserRole | null;
  onNext: (role: UserRole) => void;
}

const RoleSelectionStep: React.FC<RoleSelectionStepProps> = ({
  selectedRole: initialRole,
  onNext,
}) => {
  const { t } = useTranslation();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(
    initialRole,
  );

  const roles = [
    {
      value: "HR" as UserRole,
      icon: <BusinessCenterIcon sx={{ fontSize: 60, color: "primary.main" }} />,
      title: t("registration_wizard.roles.hr.title"),
      description: t("registration_wizard.roles.hr.description"),
    },
    {
      value: "USER" as UserRole,
      icon: <WorkIcon sx={{ fontSize: 60, color: "success.main" }} />,
      title: t("registration_wizard.roles.applicant.title"),
      description: t("registration_wizard.roles.applicant.description"),
    },
    {
      value: "COMPANY_OWNER" as UserRole,
      icon: <BusinessIcon sx={{ fontSize: 60, color: "secondary.main" }} />,
      title: t("registration_wizard.roles.company_owner.title"),
      description: t("registration_wizard.roles.company_owner.description"),
    },
  ];

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    // Automatically proceed to next step after selection
    onNext(role);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, textAlign: "center" }}>
        {t("registration_wizard.role_selection.title")}
      </Typography>
      <Typography
        variant="body1"
        color="textSecondary"
        sx={{ mb: 4, textAlign: "center" }}
      >
        {t("registration_wizard.role_selection.subtitle")}
      </Typography>

      <Grid container spacing={3}>
        {roles.map((role) => (
          <Grid item xs={12} md={4} key={role.value}>
            <Card
              sx={{
                height: "100%",
                border: selectedRole === role.value ? 2 : 1,
                borderColor:
                  selectedRole === role.value ? "primary.main" : "divider",
                transition: "all 0.3s",
                "&:hover": {
                  boxShadow: 6,
                  transform: "translateY(-4px)",
                },
              }}
            >
              <CardActionArea
                onClick={() => handleRoleSelect(role.value)}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 3,
                }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                  }}
                >
                  <Box sx={{ mb: 2 }}>{role.icon}</Box>
                  <Typography variant="h6" gutterBottom>
                    {role.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {role.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default RoleSelectionStep;
