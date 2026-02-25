import React, { useRef } from "react";
import { Box } from "@mui/material";
import { DataGridProps, GridToolbarContainer } from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";
import StyledDataGrid from "./StyledDataGrid";
import DataGridOnboarding from "./DataGridOnboarding";
import DataGridToolbarHelp from "./DataGridToolbarHelp";

interface EnhancedDataGridProps extends DataGridProps {
  /**
   * Unique key for onboarding state storage.
   * Use a descriptive key like 'email-templates' or 'job-positions'.
   */
  onboardingKey: string;
  /**
   * Whether to show the onboarding tooltip for first-time users.
   * @default true
   */
  showOnboarding?: boolean;
  /**
   * Whether to show the help icon in the toolbar.
   * @default true
   */
  showToolbarHelp?: boolean;
}

/**
 * Custom toolbar with help icon
 */
const EnhancedToolbar: React.FC<{
  showHelp: boolean;
  customToolbar?: React.FC;
}> = ({ showHelp, customToolbar: CustomToolbar }) => {
  return (
    <GridToolbarContainer sx={{ justifyContent: "flex-end", pr: 1 }}>
      {CustomToolbar && <CustomToolbar />}
      {showHelp && <DataGridToolbarHelp />}
    </GridToolbarContainer>
  );
};

/**
 * EnhancedDataGrid - DataGrid with improved discoverability features
 *
 * Features:
 * - Always-visible column menu icon
 * - First-time user onboarding tooltip
 * - Toolbar help icon for feature reference
 * - Full accessibility support
 *
 * @example
 * ```tsx
 * <EnhancedDataGrid
 *   rows={data}
 *   columns={columns}
 *   onboardingKey="email-templates"
 * />
 * ```
 */
const EnhancedDataGrid: React.FC<EnhancedDataGridProps> = ({
  onboardingKey,
  showOnboarding = true,
  showToolbarHelp = true,
  slots,
  ...props
}) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  // Merge custom toolbar with our enhanced toolbar
  const customToolbar = slots?.toolbar as React.FC | undefined;

  return (
    <Box ref={containerRef} sx={{ width: "100%", height: "100%" }}>
      <StyledDataGrid
        {...props}
        slots={{
          ...slots,
          toolbar: showToolbarHelp
            ? () => (
                <EnhancedToolbar
                  showHelp={showToolbarHelp}
                  customToolbar={customToolbar}
                />
              )
            : slots?.toolbar,
        }}
        aria-label={t("dataGrid.ariaLabel")}
      />
      {showOnboarding && (
        <DataGridOnboarding
          onboardingKey={onboardingKey}
          containerRef={containerRef as React.RefObject<HTMLDivElement>}
        />
      )}
    </Box>
  );
};

export default EnhancedDataGrid;
