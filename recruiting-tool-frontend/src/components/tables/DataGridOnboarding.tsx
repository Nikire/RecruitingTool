import { useState, useEffect, useRef } from "react";
import {
  Popover,
  Typography,
  Button,
  Box,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { useTranslation } from "react-i18next";

interface DataGridOnboardingProps {
  /**
   * Unique key for storing dismissal state in localStorage.
   * Each table should have a unique key to track onboarding independently.
   */
  onboardingKey: string;
  /**
   * Reference to the DataGrid container element
   */
  containerRef: React.RefObject<HTMLDivElement>;
}

const STORAGE_PREFIX = "datagrid_onboarding_dismissed_";
const GLOBAL_DISMISS_KEY = "datagrid_onboarding_global_dismissed";

/**
 * DataGridOnboarding - First-time user tooltip for DataGrid features
 *
 * Shows a one-time educational popover pointing to the column menu icon,
 * explaining filter, sort, and column management features.
 * Dismissal is stored in localStorage per unique key.
 */
const DataGridOnboarding: React.FC<DataGridOnboardingProps> = ({
  onboardingKey,
  containerRef,
}) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [isDismissed, setIsDismissed] = useState(true);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const storageKey = `${STORAGE_PREFIX}${onboardingKey}`;

  useEffect(() => {
    // Check if globally dismissed
    const globalDismissed = localStorage.getItem(GLOBAL_DISMISS_KEY);
    if (globalDismissed === "true") {
      setIsDismissed(true);
      return;
    }

    // Check if already dismissed for this specific table
    const dismissed = localStorage.getItem(storageKey);
    if (dismissed === "true") {
      setIsDismissed(true);
      return;
    }

    setIsDismissed(false);

    // Delay showing popover to let DataGrid render fully
    timeoutRef.current = setTimeout(() => {
      if (containerRef.current) {
        // Find the first column header menu icon
        const menuIcon = containerRef.current.querySelector(
          ".MuiDataGrid-columnHeader .MuiDataGrid-menuIcon",
        ) as HTMLElement;

        if (menuIcon) {
          setAnchorEl(menuIcon);
        }
      }
    }, 1000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [containerRef, storageKey]);

  const handleDismiss = () => {
    // Save individual dismissal
    localStorage.setItem(storageKey, "true");

    // If "don't show again" is checked, save global dismissal
    if (dontShowAgain) {
      localStorage.setItem(GLOBAL_DISMISS_KEY, "true");
    }

    setIsDismissed(true);
    setAnchorEl(null);
  };

  if (isDismissed) {
    return null;
  }

  return (
    <Popover
      open={!!anchorEl}
      anchorEl={anchorEl}
      onClose={handleDismiss}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
      slotProps={{
        paper: {
          sx: {
            p: 2,
            maxWidth: 300,
            boxShadow: 4,
          },
        },
      }}
    >
      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
        {t("dataGrid.onboarding.title")}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {t("dataGrid.onboarding.description")}
      </Typography>
      <FormControlLabel
        control={
          <Checkbox
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            size="small"
          />
        }
        label={
          <Typography variant="body2" color="text.secondary">
            {t("dataGrid.onboarding.dontShowAgain")}
          </Typography>
        }
        sx={{ mb: 1, ml: -0.5 }}
      />
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          size="small"
          variant="contained"
          onClick={handleDismiss}
          sx={{ minWidth: 80 }}
        >
          {t("common.gotIt")}
        </Button>
      </Box>
    </Popover>
  );
};

export default DataGridOnboarding;
