import React, { useState, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Skeleton,
  Stack,
  Grid,
  Select,
  MenuItem,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { format, addDays } from "date-fns";
import {
  useDemoSlots,
  useDemoSettings,
  useConfirmDemoSlot,
} from "../../hooks/api/useDemoBooking";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PublicIcon from "@mui/icons-material/Public";

// ─── Timezone list ────────────────────────────────────────────────────────────

const COMMON_TIMEZONES = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "New York (ET)" },
  { value: "America/Chicago", label: "Chicago (CT)" },
  { value: "America/Denver", label: "Denver (MT)" },
  { value: "America/Los_Angeles", label: "Los Angeles (PT)" },
  { value: "America/Sao_Paulo", label: "São Paulo (BRT)" },
  { value: "America/Argentina/Buenos_Aires", label: "Buenos Aires (ART)" },
  { value: "America/Bogota", label: "Bogotá (COT)" },
  { value: "America/Mexico_City", label: "Mexico City (CST)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Paris", label: "Paris (CET/CEST)" },
  { value: "Europe/Berlin", label: "Berlin (CET/CEST)" },
  { value: "Europe/Moscow", label: "Moscow (MSK)" },
  { value: "Asia/Dubai", label: "Dubai (GST)" },
  { value: "Asia/Kolkata", label: "Mumbai/Delhi (IST)" },
  { value: "Asia/Singapore", label: "Singapore (SGT)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Australia/Sydney", label: "Sydney (AEST)" },
  { value: "Pacific/Auckland", label: "Auckland (NZST)" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** ISO string → "YYYY-MM-DD" in the given timezone */
const getSlotDateInTZ = (isoStr: string, tz: string): string => {
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(
    new Date(isoStr),
  );
};

/** Format slot time range in the given timezone */
const formatSlotTime = (
  startStr: string,
  endStr: string,
  tz: string,
): string => {
  try {
    const opts: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      timeZone: tz,
    };
    const fmt = new Intl.DateTimeFormat("en-US", opts);
    return `${fmt.format(new Date(startStr))} – ${fmt.format(new Date(endStr))}`;
  } catch {
    return `${startStr} – ${endStr}`;
  }
};

const toDateStr = (date: Date): string => format(date, "yyyy-MM-dd");

const getDurationMinutes = (startStr: string, endStr: string): number => {
  try {
    return (new Date(endStr).getTime() - new Date(startStr).getTime()) / 60000;
  } catch {
    return 0;
  }
};

const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

// ─── Day card ─────────────────────────────────────────────────────────────────

interface DayCardProps {
  date: Date;
  dateStr: string;
  isSelected: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

const DayCard: React.FC<DayCardProps> = ({
  date,
  isSelected,
  isDisabled,
  onClick,
}) => {
  const dayName = format(date, "EEE");
  const dayNum = format(date, "d");
  const month = format(date, "MMM");

  return (
    <Paper
      elevation={isSelected ? 4 : 1}
      onClick={isDisabled ? undefined : onClick}
      sx={{
        minWidth: 64,
        width: 64,
        py: 1.5,
        px: 1,
        textAlign: "center",
        cursor: isDisabled ? "not-allowed" : "pointer",
        opacity: isDisabled ? 0.4 : 1,
        border: isSelected ? 2 : 1,
        borderColor: isSelected ? "primary.main" : "divider",
        bgcolor: isSelected ? "primary.50" : "background.paper",
        transition: "all 0.2s",
        flexShrink: 0,
        "&:hover": isDisabled
          ? {}
          : {
              borderColor: "primary.main",
              bgcolor: isSelected ? "primary.50" : "action.hover",
            },
      }}
    >
      <Typography
        variant="caption"
        display="block"
        color={isSelected ? "primary.main" : "text.secondary"}
        sx={{ fontWeight: 600, lineHeight: 1.2 }}
      >
        {dayName}
      </Typography>
      <Typography
        variant="h6"
        color={isSelected ? "primary.main" : "text.primary"}
        sx={{ lineHeight: 1.3, fontWeight: isSelected ? 700 : 400 }}
      >
        {dayNum}
      </Typography>
      <Typography
        variant="caption"
        display="block"
        color={isSelected ? "primary.main" : "text.secondary"}
        sx={{ lineHeight: 1.2 }}
      >
        {month}
      </Typography>
    </Paper>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

const BookDemoPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlotUid, setSelectedSlotUid] = useState<string | null>(null);
  const [timezone, setTimezone] = useState<string>(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
  );

  const tzOptions = useMemo(() => {
    const inList = COMMON_TIMEZONES.some((tz) => tz.value === timezone);
    return inList
      ? COMMON_TIMEZONES
      : [{ value: timezone, label: timezone }, ...COMMON_TIMEZONES];
  }, [timezone]);

  const {
    data: availableSlots,
    isLoading: slotsLoading,
    isError,
    error,
  } = useDemoSlots(token || null);

  const { data: calendarSettings, isLoading: settingsLoading } =
    useDemoSettings(token || null);

  const { mutate: confirmSlot, isPending: isConfirming } = useConfirmDemoSlot();

  const isLoading = slotsLoading || settingsLoading;

  const advanceDays = calendarSettings?.advanceBookingDays ?? 30;
  const workingDays: number[] = calendarSettings?.workingDays ?? [
    1, 2, 3, 4, 5,
  ];
  const blockedDates: string[] = calendarSettings?.blockedDates ?? [];

  // Build date range anchored to "today" in the selected timezone
  const dateRange: Date[] = useMemo(() => {
    const todayStr = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
    }).format(new Date());
    const todayInTZ = new Date(todayStr + "T00:00:00");
    return Array.from({ length: advanceDays }, (_, i) => addDays(todayInTZ, i));
  }, [advanceDays, timezone]);

  const isDateDisabled = (dateStr: string, dayOfWeek: number): boolean => {
    if (!workingDays.includes(dayOfWeek)) return true;
    if (blockedDates.includes(dateStr)) return true;
    const hasSlots = availableSlots?.some(
      (s) => getSlotDateInTZ(s.startTime, timezone) === dateStr,
    );
    return !hasSlots;
  };

  const slotsForSelectedDate = selectedDate
    ? (availableSlots?.filter(
        (s) => getSlotDateInTZ(s.startTime, timezone) === selectedDate,
      ) ?? [])
    : [];

  const handleConfirm = () => {
    if (!selectedSlotUid || !token) return;
    confirmSlot(
      { token, slotUid: selectedSlotUid },
      {
        onSuccess: () => {
          navigate(`/booking-confirmed-demo/${token}`);
        },
      },
    );
  };

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedSlotUid(null);
  };

  const scrollDates = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 64 * 3 + 8 * 3;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: "center" }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          {t("booking.loading_slots")}
        </Typography>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Alert severity="error">
          <Typography variant="h6">{t("booking.error_title")}</Typography>
          <Typography>
            {(error as Error)?.message || t("booking.error_invalid_token")}
          </Typography>
        </Alert>
      </Container>
    );
  }

  if (!availableSlots || availableSlots.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Alert severity="info">
          <Typography variant="h6">{t("booking.no_slots_title")}</Typography>
          <Typography>{t("booking.no_slots_message")}</Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <EventAvailableIcon
          sx={{ fontSize: 56, color: "primary.main", mb: 1.5 }}
        />
        <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
          {t("contact.book_demo_page_title")}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t("contact.book_demo_page_subtitle")}
        </Typography>
      </Box>

      {/* Timezone selector */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 3,
          p: 1.5,
          borderRadius: 1,
          bgcolor: "action.hover",
        }}
      >
        <PublicIcon fontSize="small" color="action" />
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ flexShrink: 0 }}
        >
          {t("booking.timezone_label")}:
        </Typography>
        <Select
          value={timezone}
          onChange={(e) => {
            setTimezone(e.target.value);
            setSelectedDate(null);
            setSelectedSlotUid(null);
          }}
          size="small"
          variant="standard"
          disableUnderline
          sx={{ fontSize: "0.875rem", flex: 1, maxWidth: 320 }}
        >
          {tzOptions.map((tz) => (
            <MenuItem
              key={tz.value}
              value={tz.value}
              sx={{ fontSize: "0.875rem" }}
            >
              {tz.label}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* Date selector */}
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
        {t("booking.select_date")}
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 3 }}>
        <IconButton
          size="small"
          onClick={() => scrollDates("left")}
          aria-label={t("common.back")}
        >
          <ChevronLeftIcon />
        </IconButton>

        <Box
          ref={scrollRef}
          sx={{
            display: "flex",
            gap: 1,
            overflowX: "hidden",
            flex: 1,
            scrollBehavior: "smooth",
          }}
        >
          {isLoading
            ? Array.from({ length: 7 }).map((_, i) => (
                <Skeleton
                  key={i}
                  variant="rounded"
                  width={64}
                  height={80}
                  sx={{ flexShrink: 0 }}
                />
              ))
            : dateRange.map((date) => {
                const dateStr = toDateStr(date);
                const dayOfWeek = date.getDay();
                const disabled = isDateDisabled(dateStr, dayOfWeek);
                return (
                  <DayCard
                    key={dateStr}
                    date={date}
                    dateStr={dateStr}
                    isSelected={selectedDate === dateStr}
                    isDisabled={disabled}
                    onClick={() => handleDateClick(dateStr)}
                  />
                );
              })}
        </Box>

        <IconButton
          size="small"
          onClick={() => scrollDates("right")}
          aria-label={t("common.next")}
        >
          <ChevronRightIcon />
        </IconButton>
      </Box>

      {/* Time slots */}
      {selectedDate ? (
        <>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
            {t("booking.select_time")}
          </Typography>

          {slotsForSelectedDate.length === 0 ? (
            <Alert severity="info" sx={{ mb: 3 }}>
              {t("booking.no_slots_this_day")}
            </Alert>
          ) : (
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {slotsForSelectedDate.map((slot) => {
                const isSelected = selectedSlotUid === slot.uid;
                const duration = getDurationMinutes(
                  slot.startTime,
                  slot.endTime,
                );
                return (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={slot.uid}>
                    <Paper
                      elevation={isSelected ? 6 : 1}
                      onClick={() => setSelectedSlotUid(slot.uid)}
                      sx={{
                        p: 2,
                        cursor: "pointer",
                        border: isSelected ? 2 : 1,
                        borderColor: isSelected ? "primary.main" : "divider",
                        bgcolor: isSelected ? "primary.50" : "background.paper",
                        transition: "all 0.2s",
                        textAlign: "center",
                        "&:hover": {
                          borderColor: "primary.main",
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      {isSelected && (
                        <CheckCircleIcon
                          sx={{ color: "primary.main", mb: 0.5 }}
                        />
                      )}
                      <AccessTimeIcon
                        sx={{
                          color: isSelected ? "primary.main" : "text.secondary",
                          display: "block",
                          mx: "auto",
                          mb: 0.5,
                        }}
                      />
                      <Typography variant="h6" fontWeight={600}>
                        {formatSlotTime(slot.startTime, slot.endTime, timezone)}
                      </Typography>
                      {duration > 0 && (
                        <Chip
                          label={formatDuration(duration)}
                          size="small"
                          color={isSelected ? "primary" : "default"}
                          sx={{ mt: 0.5 }}
                        />
                      )}
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </>
      ) : (
        <Box
          sx={{
            py: 4,
            textAlign: "center",
            border: "1px dashed",
            borderColor: "divider",
            borderRadius: 1,
            mb: 4,
          }}
        >
          <Typography variant="body1" color="text.secondary">
            {t("booking.select_date")}
          </Typography>
        </Box>
      )}

      {/* Confirm button */}
      <Stack alignItems="center">
        <Button
          variant="contained"
          size="large"
          onClick={handleConfirm}
          disabled={!selectedSlotUid || isConfirming}
          endIcon={isConfirming ? undefined : <CheckCircleIcon />}
          sx={{ px: 6, py: 1.5, minWidth: 220 }}
        >
          {isConfirming ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1, color: "inherit" }} />
              {t("booking.confirming")}
            </>
          ) : (
            t("booking.confirm_selection")
          )}
        </Button>
      </Stack>
    </Container>
  );
};

export default BookDemoPage;
