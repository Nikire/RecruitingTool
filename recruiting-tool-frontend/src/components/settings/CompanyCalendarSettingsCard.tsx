import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Skeleton,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import {
  CalendarMonth as CalendarMonthIcon,
  Save as SaveIcon,
  LinkOff as LinkOffIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import SettingsCard from "./SettingsCard";
import {
  useGetCompanyCalendarSettings,
  useUpdateCompanyCalendarSettings,
} from "../../hooks/api/useCompanyCalendarSettings";

// ─── Day mapping (0=Sun … 6=Sat) ─────────────────────────────────────────────

interface DayOption {
  value: number;
  labelKey: string;
}

const DAY_OPTIONS: DayOption[] = [
  { value: 1, labelKey: "calendar_settings.mon" },
  { value: 2, labelKey: "calendar_settings.tue" },
  { value: 3, labelKey: "calendar_settings.wed" },
  { value: 4, labelKey: "calendar_settings.thu" },
  { value: 5, labelKey: "calendar_settings.fri" },
  { value: 6, labelKey: "calendar_settings.sat" },
  { value: 0, labelKey: "calendar_settings.sun" },
];

const BUFFER_OPTIONS = [0, 5, 10, 15, 30, 45, 60];

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * CompanyCalendarSettingsCard
 *
 * Allows company admins to configure calendar availability and booking settings:
 * working days, working hours, buffer time, default duration, advance booking
 * window, and blocked dates.
 */
interface CompanyCalendarSettingsCardProps {
  isGoogleCalendarConnected: boolean;
}

const CompanyCalendarSettingsCard: React.FC<
  CompanyCalendarSettingsCardProps
> = ({ isGoogleCalendarConnected }) => {
  const { t } = useTranslation();
  const { data: settings, isLoading } = useGetCompanyCalendarSettings();
  const { mutate: updateSettings, isPending } =
    useUpdateCompanyCalendarSettings();

  // ── Form state ──────────────────────────────────────────────────────────────
  const [isBookingEnabled, setIsBookingEnabled] = useState(false);
  const [workingDays, setWorkingDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [workingHoursStart, setWorkingHoursStart] = useState("09:00");
  const [workingHoursEnd, setWorkingHoursEnd] = useState("18:00");
  const [bufferMinutes, setBufferMinutes] = useState(15);
  const [advanceBookingDays, setAdvanceBookingDays] = useState(30);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [newDate, setNewDate] = useState("");

  // ── Populate from fetched data ───────────────────────────────────────────────
  useEffect(() => {
    if (settings) {
      setIsBookingEnabled(settings.isBookingEnabled);
      setWorkingDays(settings.workingDays);
      setWorkingHoursStart(settings.workingHoursStart);
      setWorkingHoursEnd(settings.workingHoursEnd);
      setBufferMinutes(settings.bufferMinutes);
      setAdvanceBookingDays(settings.advanceBookingDays);
      setBlockedDates(settings.blockedDates ?? []);
    }
  }, [settings]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleWorkingDaysChange = (
    _event: React.MouseEvent<HTMLElement>,
    newDays: number[],
  ) => {
    setWorkingDays(newDays);
  };

  const handleBufferChange = (event: SelectChangeEvent<number>) => {
    setBufferMinutes(Number(event.target.value));
  };

  const handleAddDate = () => {
    if (!newDate) return;
    if (blockedDates.includes(newDate)) return;
    setBlockedDates((prev) => [...prev, newDate].sort());
    setNewDate("");
  };

  const handleRemoveDate = (date: string) => {
    setBlockedDates((prev) => prev.filter((d) => d !== date));
  };

  const handleSave = () => {
    updateSettings({
      isBookingEnabled,
      workingDays,
      workingHoursStart,
      workingHoursEnd,
      bufferMinutes,
      advanceBookingDays,
      blockedDates,
    });
  };

  // ── Format a YYYY-MM-DD string into a readable label ──────────────────────
  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    // Use local date to avoid timezone shift
    return new Date(year, month - 1, day).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // ── Buffer option label ────────────────────────────────────────────────────
  const bufferLabel = (minutes: number) => {
    if (minutes === 0) return t("calendar_settings.buffer_options.0");
    const key = String(minutes) as "5" | "10" | "15" | "30" | "45" | "60";
    return t(`calendar_settings.buffer_options.${key}`);
  };

  // ── Booking toggle action for card header ─────────────────────────────────
  const bookingToggle = (
    <FormControlLabel
      control={
        <Switch
          checked={isBookingEnabled}
          onChange={(e) => setIsBookingEnabled(e.target.checked)}
          color="primary"
          size="small"
          disabled={!isGoogleCalendarConnected}
        />
      }
      label={
        <Typography variant="body2" fontWeight={500}>
          {t("calendar_settings.booking_enabled")}
        </Typography>
      }
      labelPlacement="start"
      sx={{ mr: 0 }}
    />
  );

  // ── Skeleton while loading ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <SettingsCard
        icon={<CalendarMonthIcon />}
        title={t("calendar_settings.title")}
        iconColor="primary.main"
      >
        <Stack spacing={2}>
          <Skeleton variant="rectangular" height={40} />
          <Skeleton variant="rectangular" height={40} />
          <Skeleton variant="rectangular" height={40} />
          <Skeleton variant="rectangular" height={40} />
        </Stack>
      </SettingsCard>
    );
  }

  return (
    <SettingsCard
      icon={<CalendarMonthIcon />}
      title={t("calendar_settings.title")}
      iconColor="primary.main"
      action={bookingToggle}
    >
      <Stack spacing={3}>
        {/* Google Calendar not connected — block entire section */}
        {!isGoogleCalendarConnected && (
          <Alert severity="warning" icon={<LinkOffIcon />}>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              {t("calendar_settings.requires_google_calendar_title")}
            </Typography>
            <Typography variant="body2">
              {t("calendar_settings.requires_google_calendar_body")}
            </Typography>
          </Alert>
        )}

        {/* Booking disabled info */}
        {isGoogleCalendarConnected && !isBookingEnabled && (
          <Alert severity="info" sx={{ py: 0.5 }}>
            <Typography variant="body2">
              {t("calendar_settings.booking_disabled_info")}
            </Typography>
          </Alert>
        )}

        {isGoogleCalendarConnected && isBookingEnabled && (
          <>
            {/* ── Working Days ── */}
            <Box>
              <Typography
                variant="body2"
                fontWeight={600}
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                {t("calendar_settings.working_days")}
              </Typography>
              <ToggleButtonGroup
                value={workingDays}
                onChange={handleWorkingDaysChange}
                aria-label={t("calendar_settings.working_days")}
                size="small"
                sx={{ flexWrap: "wrap", gap: 0.5 }}
              >
                {DAY_OPTIONS.map((day) => (
                  <ToggleButton
                    key={day.value}
                    value={day.value}
                    aria-label={t(day.labelKey)}
                    sx={{ minWidth: 48 }}
                  >
                    {t(day.labelKey)}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>

            {/* ── Working Hours ── */}
            <Box>
              <Typography
                variant="body2"
                fontWeight={600}
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                {t("calendar_settings.working_hours")}
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <TextField
                  label={t("calendar_settings.hours_from")}
                  type="time"
                  value={workingHoursStart}
                  onChange={(e) => setWorkingHoursStart(e.target.value)}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 300 }}
                  sx={{ minWidth: 140 }}
                />
                <TextField
                  label={t("calendar_settings.hours_to")}
                  type="time"
                  value={workingHoursEnd}
                  onChange={(e) => setWorkingHoursEnd(e.target.value)}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 300 }}
                  sx={{ minWidth: 140 }}
                />
              </Box>
            </Box>

            {/* ── Buffer Between Slots ── */}
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>{t("calendar_settings.buffer_time")}</InputLabel>
              <Select
                value={bufferMinutes}
                label={t("calendar_settings.buffer_time")}
                onChange={handleBufferChange}
              >
                {BUFFER_OPTIONS.map((min) => (
                  <MenuItem key={min} value={min}>
                    {bufferLabel(min)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* ── Advance Booking Window ── */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <TextField
                label={t("calendar_settings.advance_booking")}
                type="number"
                value={advanceBookingDays}
                onChange={(e) =>
                  setAdvanceBookingDays(
                    Math.min(365, Math.max(1, Number(e.target.value))),
                  )
                }
                size="small"
                inputProps={{ min: 1, max: 365 }}
                sx={{ width: 120 }}
              />
              <Typography variant="body2" color="text.secondary">
                {t("calendar_settings.advance_booking_unit")}
              </Typography>
            </Box>

            {/* ── Blocked Dates ── */}
            <Box>
              <Typography
                variant="body2"
                fontWeight={600}
                color="text.secondary"
                sx={{ mb: 0.5 }}
              >
                {t("calendar_settings.blocked_dates")}
              </Typography>
              <Typography
                variant="caption"
                color="text.disabled"
                sx={{ display: "block", mb: 1 }}
              >
                {t("calendar_settings.blocked_dates_hint")}
              </Typography>

              <Box
                sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1.5 }}
              >
                <TextField
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={{ flex: 1, maxWidth: 220 }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleAddDate}
                  disabled={!newDate}
                >
                  {t("calendar_settings.add_date")}
                </Button>
              </Box>

              {blockedDates.length === 0 ? (
                <Typography variant="caption" color="text.disabled">
                  {t("calendar_settings.no_blocked_dates")}
                </Typography>
              ) : (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {blockedDates.map((date) => (
                    <Chip
                      key={date}
                      label={formatDate(date)}
                      onDelete={() => handleRemoveDate(date)}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              )}
            </Box>

            {/* ── Save button ── */}
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                startIcon={
                  isPending ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <SaveIcon />
                  )
                }
                disabled={isPending}
                onClick={handleSave}
              >
                {isPending ? t("common.saving") : t("calendar_settings.save")}
              </Button>
            </Box>
          </>
        )}

        {/* Save toggle state — only when Google Calendar is connected */}
        {isGoogleCalendarConnected && !isBookingEnabled && (
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={
                isPending ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <SaveIcon />
                )
              }
              disabled={isPending}
              onClick={handleSave}
            >
              {isPending ? t("common.saving") : t("calendar_settings.save")}
            </Button>
          </Box>
        )}
      </Stack>
    </SettingsCard>
  );
};

export default CompanyCalendarSettingsCard;
