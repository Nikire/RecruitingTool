import { Card, CardContent, Typography, Box, Divider } from "@mui/material";
import { ReactNode } from "react";

/**
 * SettingsCard - Reusable card component for settings sections
 *
 * @description Displays a settings section with an icon, title, and content area
 * Follows Material-UI design patterns with consistent spacing and styling
 */

export interface SettingsCardProps {
  /** Icon to display in the card header */
  icon: ReactNode;
  /** Title of the settings section (i18n key) */
  title: string;
  /** Background color for the icon */
  iconColor?: string;
  /** Content to display in the card body */
  children: ReactNode;
  /** Optional action button in the header */
  action?: ReactNode;
}

const SettingsCard: React.FC<SettingsCardProps> = ({
  icon,
  title,
  iconColor = "primary.main",
  children,
  action,
}) => {
  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Card Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box
              sx={{
                bgcolor: iconColor,
                color: "white",
                p: 1.5,
                borderRadius: 2,
                display: "flex",
                mr: 2,
              }}
            >
              {icon}
            </Box>
            <Typography variant="h6" component="h3">
              {title}
            </Typography>
          </Box>
          {action && <Box>{action}</Box>}
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Card Content */}
        <Box>{children}</Box>
      </CardContent>
    </Card>
  );
};

export default SettingsCard;
