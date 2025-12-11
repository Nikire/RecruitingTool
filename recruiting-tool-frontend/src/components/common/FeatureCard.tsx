import { Card, CardContent, Box, Typography, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";

export interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color?: string;
  onClick?: () => void;
  elevation?: number;
  hoverEffect?: boolean;
  translate?: boolean;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  color,
  onClick,
  elevation = 1,
  hoverEffect = true,
  translate = false,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const displayTitle = translate ? t(title) : title;
  const displayDescription = translate ? t(description) : description;
  const iconColor = color || theme.palette.primary.main;

  return (
    <Card
      sx={{
        height: "100%",
        transition: hoverEffect ? "transform 0.3s, box-shadow 0.3s" : undefined,
        "&:hover": hoverEffect
          ? {
              transform: "translateY(-8px)",
              boxShadow: theme.shadows[8],
            }
          : undefined,
        cursor: onClick ? "pointer" : "default",
      }}
      elevation={elevation}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            color: iconColor,
            mb: 2,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          {displayTitle}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {displayDescription}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;
