import { Box } from "@mui/material";
import { ReactNode } from "react";
import { UnifiedStatCard } from "../common";

/**
 * Statistics Card Data Interface
 * Defines the shape of data for each stat card
 */
export interface StatCardData {
  /** Translation key or display text for the card title */
  title: string;
  /** Numeric value to display prominently */
  value: number;
  /** Subtitle text (can include dynamic content) */
  subtitle: string;
  /** Icon component to display */
  icon: ReactNode;
  /** Color for the icon (MUI color path, e.g., 'primary.main') */
  iconColor: string;
  /** Optional click handler for card navigation */
  onClick?: () => void;
  /** Whether to translate the title (default: true) */
  translate?: boolean;
}

/**
 * StatisticsCards Props
 */
interface StatisticsCardsProps {
  /** Array of stat card data objects */
  stats: StatCardData[];
  /** Whether the data is currently loading */
  isLoading?: boolean;
  /** Custom gap spacing (responsive) */
  gap?: { xs?: number; sm?: number; md?: number } | number;
  /** Custom margin bottom (responsive) */
  mb?: { xs?: number; sm?: number; md?: number } | number;
  /** Number of columns on desktop (default: 4) */
  columns?: 2 | 3 | 4;
}

/**
 * StatisticsCards - Reusable grid of statistic cards
 *
 * @description
 * A responsive grid layout for displaying multiple UnifiedStatCard components
 * with equal widths. Automatically handles responsive breakpoints.
 *
 * @example
 * ```tsx
 * const stats = [
 *   {
 *     title: 'dashboard.stats.applications',
 *     value: 42,
 *     subtitle: t('dashboard.stats.pending', {count: 5}),
 *     icon: <AssignmentIcon />,
 *     iconColor: 'primary.main',
 *     onClick: () => navigate('/applications'),
 *     translate: true,
 *   },
 *   // ... more stats
 * ];
 *
 * <StatisticsCards stats={stats} isLoading={isLoading} />
 * ```
 *
 * @componentization-criteria
 * This component was extracted because:
 * 1. REPEATED PATTERN: Flexbox grid with equal-width cards appeared in multiple dashboards
 * 2. COMPLEX LAYOUT: Contains responsive flexbox logic that shouldn't be duplicated
 * 3. CONSISTENT STYLING: Ensures all stat card grids look identical across the app
 * 4. ENCAPSULATED LOGIC: Card sizing calculations (25%, 50%, 100%) are contained
 * 5. SINGLE RESPONSIBILITY: Only handles layout, delegates rendering to UnifiedStatCard
 */
const StatisticsCards: React.FC<StatisticsCardsProps> = ({
  stats,
  isLoading = false,
  gap = { xs: 2, sm: 3 },
  mb = { xs: 3, sm: 4 },
  columns = 4,
}) => {
  // Calculate flex basis based on column count
  const getFlexBasis = () => {
    switch (columns) {
      case 2:
        return {
          xs: "1 1 100%",
          sm: "1 1 calc(50% - 12px)",
          md: "1 1 calc(50% - 12px)",
        };
      case 3:
        return {
          xs: "1 1 100%",
          sm: "1 1 calc(50% - 12px)",
          md: "1 1 calc(33.333% - 16px)",
        };
      case 4:
      default:
        return {
          xs: "1 1 100%",
          sm: "1 1 calc(50% - 12px)",
          md: "1 1 calc(25% - 18px)",
        };
    }
  };

  const flexBasis = getFlexBasis();

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap,
        mb,
      }}
    >
      {stats.map((stat, index) => (
        <Box
          key={index}
          sx={{
            flex: flexBasis,
            minWidth: 0,
          }}
        >
          <UnifiedStatCard
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
            icon={stat.icon}
            color={stat.iconColor}
            isLoading={isLoading}
            onClick={stat.onClick}
            translate={stat.translate}
            variant="statistic"
          />
        </Box>
      ))}
    </Box>
  );
};

export default StatisticsCards;
