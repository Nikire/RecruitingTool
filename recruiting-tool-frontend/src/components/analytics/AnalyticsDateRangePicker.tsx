import React, { useState } from "react";
import {
  Box,
  Button,
  ButtonGroup,
  Collapse,
  Typography,
  Paper,
  Chip,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { startOfDay, endOfDay, subDays, startOfYear, format } from "date-fns";
import { useTranslation } from "react-i18next";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import TuneIcon from "@mui/icons-material/Tune";

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export type PresetPeriod = "7d" | "30d" | "90d" | "year" | "custom";

export interface DateRangeValue {
  startDate: string | undefined; // ISO 8601
  endDate: string | undefined; // ISO 8601
  preset: PresetPeriod;
  label: string;
}

interface AnalyticsDateRangePickerProps {
  /** Called whenever the user confirms a new date range */
  onChange: (value: DateRangeValue) => void;
  /** Currently active value (controlled) */
  value: DateRangeValue;
}

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

const toIso = (date: Date): string => date.toISOString();

/** Return the ISO start/end for a given preset */
function resolvePreset(preset: Exclude<PresetPeriod, "custom">): {
  startDate: string;
  endDate: string;
} {
  const now = new Date();
  switch (preset) {
    case "7d":
      return {
        startDate: toIso(startOfDay(subDays(now, 6))),
        endDate: toIso(endOfDay(now)),
      };
    case "30d":
      return {
        startDate: toIso(startOfDay(subDays(now, 29))),
        endDate: toIso(endOfDay(now)),
      };
    case "90d":
      return {
        startDate: toIso(startOfDay(subDays(now, 89))),
        endDate: toIso(endOfDay(now)),
      };
    case "year":
      return {
        startDate: toIso(startOfYear(now)),
        endDate: toIso(endOfDay(now)),
      };
  }
}

// -----------------------------------------------------------------------
// Default exported component
// -----------------------------------------------------------------------

/**
 * AnalyticsDateRangePicker
 *
 * Provides preset period buttons (Last 7/30/90 days, This year) and a
 * "Custom" option that reveals two MUI DatePicker inputs.
 * Fully i18n-compliant — no hardcoded user-facing strings.
 */
const AnalyticsDateRangePicker: React.FC<AnalyticsDateRangePickerProps> = ({
  onChange,
  value,
}) => {
  const { t } = useTranslation();

  // Local state for the custom date inputs (only used when preset === "custom")
  const [customFrom, setCustomFrom] = useState<Date | null>(
    value.preset === "custom" && value.startDate
      ? new Date(value.startDate)
      : null,
  );
  const [customTo, setCustomTo] = useState<Date | null>(
    value.preset === "custom" && value.endDate ? new Date(value.endDate) : null,
  );

  // ------------------------------------------------------------------
  // Preset presets
  // ------------------------------------------------------------------

  const presets: { key: Exclude<PresetPeriod, "custom">; labelKey: string }[] =
    [
      { key: "7d", labelKey: "analytics.period_7d" },
      { key: "30d", labelKey: "analytics.period_30d" },
      { key: "90d", labelKey: "analytics.period_90d" },
      { key: "year", labelKey: "analytics.period_year" },
    ];

  const handlePresetClick = (preset: Exclude<PresetPeriod, "custom">) => {
    const { startDate, endDate } = resolvePreset(preset);
    onChange({
      preset,
      startDate,
      endDate,
      label: t(`analytics.period_${preset}`),
    });
  };

  // ------------------------------------------------------------------
  // Custom range
  // ------------------------------------------------------------------

  const handleCustomClick = () => {
    // Switch to custom mode without immediately firing onChange
    onChange({
      preset: "custom",
      startDate: value.startDate,
      endDate: value.endDate,
      label: buildCustomLabel(customFrom, customTo),
    });
  };

  const handleApplyCustom = () => {
    if (!customFrom || !customTo) return;
    onChange({
      preset: "custom",
      startDate: toIso(startOfDay(customFrom)),
      endDate: toIso(endOfDay(customTo)),
      label: buildCustomLabel(customFrom, customTo),
    });
  };

  const buildCustomLabel = (from: Date | null, to: Date | null): string => {
    if (!from || !to) return t("analytics.period_custom");
    return `${format(from, "MMM d, yyyy")} – ${format(to, "MMM d, yyyy")}`;
  };

  const isCustomMode = value.preset === "custom";
  const canApplyCustom = customFrom !== null && customTo !== null;

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        {/* Period label shown above the picker buttons */}
        <Box display="flex" alignItems="center" gap={1} mb={1.5}>
          <CalendarTodayIcon
            fontSize="small"
            sx={{ color: "text.secondary" }}
          />
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {t("analytics.date_range")}:
          </Typography>
          <Chip
            label={value.label}
            size="small"
            color="primary"
            variant="filled"
            sx={{ fontWeight: 600, borderRadius: 1.5 }}
          />
        </Box>

        {/* Preset buttons */}
        <Box display="flex" flexWrap="wrap" gap={1} alignItems="center">
          <ButtonGroup
            size="small"
            variant="contained"
            sx={{
              flexWrap: "wrap",
              "& .MuiButtonGroup-firstButton, & .MuiButtonGroup-middleButton": {
                borderRightColor: "transparent",
              },
            }}
          >
            {presets.map(({ key, labelKey }) => (
              <Button
                key={key}
                onClick={() => handlePresetClick(key)}
                variant={
                  value.preset === key && !isCustomMode
                    ? "contained"
                    : "contained"
                }
                sx={{
                  borderRadius: "8px !important",
                  fontWeight: value.preset === key ? 700 : 400,
                  minWidth: 90,
                  border: "1px solid",
                  borderColor:
                    value.preset === key ? "primary.main" : "divider",
                  "&:not(:last-child)": {
                    borderRight: "1px solid",
                    borderRightColor:
                      value.preset === key ? "primary.main" : "divider",
                  },
                }}
              >
                {t(labelKey)}
              </Button>
            ))}
          </ButtonGroup>

          {/* Custom range toggle */}
          <Button
            size="small"
            startIcon={<TuneIcon fontSize="small" />}
            onClick={handleCustomClick}
            variant={isCustomMode ? "contained" : "contained"}
            sx={{
              borderRadius: 2,
              fontWeight: isCustomMode ? 700 : 400,
              minWidth: 90,
            }}
          >
            {t("analytics.period_custom")}
          </Button>
        </Box>

        {/* Custom date pickers — only visible when custom mode is active */}
        <Collapse in={isCustomMode} timeout="auto">
          <Paper
            elevation={0}
            sx={{
              mt: 2,
              p: 2,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              alignItems: { xs: "stretch", sm: "flex-end" },
              flexWrap: "wrap",
            }}
          >
            <DatePicker
              label={t("analytics.date_from")}
              value={customFrom}
              onChange={(date) => setCustomFrom(date)}
              slotProps={{
                textField: {
                  size: "small",
                  sx: {
                    minWidth: { xs: "100%", sm: 180 },
                    "& .MuiOutlinedInput-root": { borderRadius: 2 },
                  },
                },
              }}
            />
            <DatePicker
              label={t("analytics.date_to")}
              value={customTo}
              onChange={(date) => setCustomTo(date)}
              minDate={customFrom ?? undefined}
              slotProps={{
                textField: {
                  size: "small",
                  sx: {
                    minWidth: { xs: "100%", sm: 180 },
                    "& .MuiOutlinedInput-root": { borderRadius: 2 },
                  },
                },
              }}
            />
            <Button
              variant="contained"
              onClick={handleApplyCustom}
              disabled={!canApplyCustom}
              sx={{ borderRadius: 2, px: 3, fontWeight: 600, height: 40 }}
            >
              {t("analytics.apply")}
            </Button>
          </Paper>
        </Collapse>
      </Box>
    </LocalizationProvider>
  );
};

export default AnalyticsDateRangePicker;
