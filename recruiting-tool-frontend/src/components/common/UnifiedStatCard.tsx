import {
  Card,
  CardContent,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useTranslation } from "react-i18next";

/**
 * Props for the UnifiedStatCard component
 */
export interface UnifiedStatCardProps {
  /** Title of the card (can be i18n key or plain text) */
  title: string;
  /** Icon element to display */
  icon: React.ReactNode;
  /** Color for the icon (hex string or MUI theme color like 'primary.main') */
  color: string;
  /** Optional main value to display (for statistics) */
  value?: number | string;
  /** Optional subtitle/description text (can be i18n key or plain text) */
  subtitle?: string;
  /** Loading state - shows spinner instead of value (only applicable if value is provided) */
  isLoading?: boolean;
  /** Optional click handler - makes card interactive */
  onClick?: () => void;
  /** Whether to translate title and subtitle using i18n (default: false) */
  translate?: boolean;
  /** Variant of the card: 'statistic' shows large value, 'navigation' shows description-focused layout (default: auto-detect based on value prop) */
  variant?: "statistic" | "navigation";
}

/**
 * UnifiedStatCard - Consolidated reusable card component for statistics and navigation
 *
 * This component replaces both StatCard and DashboardStatCard to reduce duplication.
 * It supports two modes:
 * - 'statistic' mode: Displays a key metric with large value (used in HR Dashboard)
 * - 'navigation' mode: Displays description/action card (used in Admin Dashboard)
 *
 * The mode is auto-detected based on the presence of the value prop, or can be explicitly set.
 *
 * @example Statistic Card (with value)
 * ```tsx
 * <UnifiedStatCard
 *   title="dashboard.total_applications"
 *   value={150}
 *   subtitle="dashboard.pending_review"
 *   icon={<AssignmentIcon />}
 *   color="primary.main"
 *   isLoading={isLoading}
 *   onClick={() => navigate('/applications')}
 *   translate
 * />
 * ```
 *
 * @example Navigation Card (without value)
 * ```tsx
 * <UnifiedStatCard
 *   title="Candidate Management"
 *   icon={<PeopleIcon />}
 *   color="#1976d2"
 *   subtitle="Manage all candidates and applications"
 *   onClick={() => navigate('/candidates')}
 * />
 * ```
 */
const UnifiedStatCard: React.FC<UnifiedStatCardProps> = ({
  title,
  icon,
  color,
  value,
  subtitle,
  isLoading = false,
  onClick,
  translate = false,
  variant,
}) => {
  const { t } = useTranslation();

  // Auto-detect variant based on whether value is provided
  const effectiveVariant =
    variant || (value !== undefined ? "statistic" : "navigation");
  const isStatistic = effectiveVariant === "statistic";
  const isClickable = !!onClick;

  // Translate text if requested
  const displayTitle = translate ? t(title) : title;
  const displaySubtitle = subtitle
    ? translate
      ? t(subtitle)
      : subtitle
    : undefined;

  return (
    <Card
      elevation={isClickable ? 1 : 0}
      sx={{
        height: "100%",
        width: "100%",
        flex: 1,
        minHeight: isStatistic ? 120 : 100,
        display: "flex",
        flexDirection: "column",
        cursor: isClickable ? "pointer" : "default",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        "&:hover": isClickable
          ? {
              boxShadow: 3,
              transform: "translateY(-4px)",
              borderColor: "primary.main",
            }
          : {},
      }}
      onClick={onClick}
    >
      <CardContent
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          p: { xs: 2, sm: 2.5 },
          "&:last-child": { pb: { xs: 2, sm: 2.5 } },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: isStatistic ? 1.5 : 1,
          }}
        >
          {isStatistic ? (
            // Statistic mode: Large icon on the left, title/value on the right
            <>
              <Box
                sx={{
                  fontSize: 40,
                  color,
                  mr: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0.9,
                }}
              >
                {icon}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  color="text.secondary"
                  variant="body2"
                  sx={{ fontWeight: 500, mb: 0.5 }}
                >
                  {displayTitle}
                </Typography>
                {isLoading ? (
                  <CircularProgress size={24} sx={{ mt: 0.5 }} />
                ) : (
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: "text.primary",
                      lineHeight: 1.2,
                    }}
                  >
                    {value}
                  </Typography>
                )}
              </Box>
            </>
          ) : (
            // Navigation mode: Icon in colored box, title next to it
            <>
              <Box
                sx={{
                  bgcolor: color,
                  color: "white",
                  p: 1.5,
                  borderRadius: 2,
                  display: "flex",
                  mr: 2,
                  boxShadow: 1,
                }}
              >
                {icon}
              </Box>
              <Typography
                variant="h6"
                component="div"
                sx={{ fontWeight: 600, color: "text.primary" }}
              >
                {displayTitle}
              </Typography>
            </>
          )}
        </Box>
        {displaySubtitle && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              lineHeight: 1.5,
              fontSize: "0.875rem",
            }}
            title={displaySubtitle}
          >
            {displaySubtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default UnifiedStatCard;
