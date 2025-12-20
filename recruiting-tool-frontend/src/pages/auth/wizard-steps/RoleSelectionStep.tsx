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

      <Grid container spacing={3} justifyContent="center">
        {roles.map((role) => (
          <Grid item xs={12} sm={6} md={4} key={role.value}>
            <Card
              sx={{
                height: "100%",
                minHeight: 280,
                width: 320,
                maxWidth: "100%",
                mx: "auto",
                position: "relative",
                border: 2,
                borderColor:
                  selectedRole === role.value ? "primary.main" : "transparent",
                boxShadow: selectedRole === role.value ? 6 : 2,
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  boxShadow: 8,
                  transform: "translateY(-8px)",
                  borderColor:
                    selectedRole === role.value ? "primary.main" : "grey.300",
                },
                ...(selectedRole === role.value && {
                  backgroundColor: "primary.50",
                }),
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
                  py: 4,
                  px: 3,
                }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    width: "100%",
                    p: 0,
                    "&:last-child": { pb: 0 },
                  }}
                >
                  <Box
                    sx={{
                      mb: 3,
                      p: 2,
                      borderRadius: "50%",
                      backgroundColor:
                        selectedRole === role.value
                          ? "primary.main"
                          : "grey.100",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.3s ease-in-out",
                      "& > svg": {
                        color:
                          selectedRole === role.value ? "white" : "inherit",
                        transition: "color 0.3s ease-in-out",
                      },
                    }}
                  >
                    {role.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      fontWeight: 600,
                      mb: 1.5,
                      color:
                        selectedRole === role.value
                          ? "primary.main"
                          : "inherit",
                    }}
                  >
                    {role.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{
                      lineHeight: 1.6,
                      px: 1,
                    }}
                  >
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
